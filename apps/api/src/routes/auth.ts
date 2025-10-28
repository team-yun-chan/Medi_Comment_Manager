import { Router, Request, Response } from 'express';
import { GoogleService } from '../services/google';
import { MetaService } from '../services/meta';
import { prisma } from '../db';
import { generateToken } from '../utils/jwt';
import { verifyToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import { config } from '../config';

const router = Router();

// ===== Google OAuth =====
router.get('/google', (req: Request, res: Response) => {
  const linkToken = (req.query.linkToken as string) || '';
  const state = linkToken ? `link:${linkToken}` : Math.random().toString(36).substring(7);
  const authUrl = GoogleService.getAuthUrl(state);
  res.redirect(authUrl);
});

router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) return res.status(400).json({ error: 'Authorization code missing' });

    // 1. Exchange code for tokens
    // If linking, resolve existing user from link token in state
    const stateParam = req.query.state as string | undefined;
    let linkedUser: any = null;
    if (stateParam && stateParam.startsWith('link:')) {
      const linkToken = stateParam.substring(5);
      try {
        const payload = verifyToken(linkToken) as any;
        linkedUser = await prisma.user.findUnique({ where: { id: payload.id } });
      } catch {}
    }
    const tokens = await GoogleService.exchangeCodeForTokens(code);

    // 2. Get user info
    const userInfo = await GoogleService.getUserInfo(tokens.access_token);
    const email = userInfo.email || `google_${userInfo.id || 'unknown'}@placeholder.local`;

    // 3. Upsert user
    let user = linkedUser ?? await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: userInfo.name },
      });
    }

    // 4. Upsert account
    await prisma.account.upsert({
      where: { userId_provider: { userId: user.id, provider: 'google' } },
      create: {
        userId: user.id,
        provider: 'google',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        scope: tokens.scope,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        scope: tokens.scope,
      },
    });

    // 5. Sync channels (best effort)
    try {
      const channels = await GoogleService.getMyChannels(tokens.access_token);
      for (const channel of channels) {
        await prisma.youtubeChannel.upsert({
          where: { channelId: channel.id! },
          create: {
            channelId: channel.id!,
            title: channel.snippet?.title || 'Unknown',
            userId: user.id,
          },
          update: {
            title: channel.snippet?.title || 'Unknown',
          },
        });
      }
    } catch (error) {
      console.error('Failed to sync channels:', error);
    }

    // 6. Issue JWT and redirect
    const jwt = generateToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
    });
    const redirectUrl = `${config.WEB_BASE_URL}/auth/callback?token=${jwt}&provider=google`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${config.WEB_BASE_URL}/login?error=google_auth_failed`);
  }
});

// ===== Meta OAuth =====
router.get('/meta', (req: Request, res: Response) => {
  const linkToken = (req.query.linkToken as string) || '';
  const state = linkToken ? `link:${linkToken}` : Math.random().toString(36).substring(7);
  const authUrl = MetaService.getAuthUrl(state);
  res.redirect(authUrl);
});

router.get('/meta/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) return res.status(400).json({ error: 'Authorization code missing' });

    // 1. Short-lived token
    const shortToken = await MetaService.exchangeCodeForToken(code);
    // 2. Long-lived token
    const longToken = await MetaService.exchangeForLongLivedToken(shortToken.access_token);

    // 3. Get user info
    const userInfo = await MetaService.getUserInfo(longToken.access_token);
    const email = userInfo.email || `meta_${userInfo.id}@placeholder.local`;

    // 4. Resolve user (link to existing if state carries link token)
    let user = null as any;
    const state = req.query.state as string | undefined;
    if (state && state.startsWith('link:')) {
      const linkToken = state.substring(5);
      try {
        const linked = verifyToken(linkToken) as any;
        user = await prisma.user.findUnique({ where: { id: linked.id } });
      } catch (e) {
        // fall back to email flow
      }
    }
    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({ data: { email, name: userInfo.name } });
      }
    }

    // 5. Upsert account
    await prisma.account.upsert({
      where: { userId_provider: { userId: user.id, provider: 'meta' } },
      create: {
        userId: user.id,
        provider: 'meta',
        accessToken: longToken.access_token,
        expiresAt: longToken.expires_in ? new Date(Date.now() + longToken.expires_in * 1000) : null,
      },
      update: {
        accessToken: longToken.access_token,
        expiresAt: longToken.expires_in ? new Date(Date.now() + longToken.expires_in * 1000) : null,
      },
    });

    // 6. Sync pages (best effort)
    try {
      const pages = await MetaService.getUserPages(longToken.access_token);
      for (const page of pages) {
        const igAccount = page.instagram_business_account;
        await prisma.instagramPage.upsert({
          where: { fbPageId: page.id },
          create: {
            fbPageId: page.id,
            name: page.name,
            igId: igAccount?.id,
            userId: user.id,
            accessToken: page.access_token,
          },
          update: {
            name: page.name,
            igId: igAccount?.id,
            accessToken: page.access_token,
          },
        });

        if (igAccount?.id) {
          try {
            const igInfo = await MetaService.getInstagramAccount(page.access_token, igAccount.id);
            await prisma.instagramPage.update({
              where: { fbPageId: page.id },
              data: { username: igInfo.username },
            });
          } catch (error) {
            console.error('Failed to get IG username:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync pages:', error);
    }

    // 7. Issue JWT and redirect
    const jwt = generateToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
    });
    const redirectUrl = `${config.WEB_BASE_URL}/auth/callback?token=${jwt}&provider=meta`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Meta OAuth error:', error);
    res.redirect(`${config.WEB_BASE_URL}/login?error=meta_auth_failed`);
  }
});

// ===== Common Auth =====
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        accounts: { select: { provider: true, expiresAt: true } },
        youtubeChannels: { select: { id: true, channelId: true, title: true } },
        instagramPages: { select: { id: true, fbPageId: true, name: true, username: true, igId: true } },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accounts: user.accounts,
      youtubeChannels: user.youtubeChannels,
      instagramPages: user.instagramPages,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

router.post('/logout', authMiddleware, (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
