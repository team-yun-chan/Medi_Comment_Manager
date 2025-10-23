import { Router, Request, Response } from 'express';
import { GoogleService } from '../services/google';
import { MetaService } from '../services/meta';
import { prisma } from '../db';
import { generateToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import { config } from '../config';

const router = Router();

// ===== Google OAuth =====

/**
 * Google 로그인 시작
 */
router.get('/google/login', (req: Request, res: Response) => {
  const authUrl = GoogleService.getAuthUrl();
  res.json({ url: authUrl });
});

/**
 * Google OAuth 콜백
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    // 1. 토큰 교환
    const tokens = await GoogleService.exchangeCodeForTokens(code);

    // 2. 사용자 정보 가져오기
    const userInfo = await GoogleService.getUserInfo(tokens.access_token);

    // 3. 사용자 생성 또는 업데이트
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
        },
      });
    }

    // 4. Account 저장 (토큰)
    await prisma.account.upsert({
      where: {
        userId_provider: {
          userId: user.id,
          provider: 'google',
        },
      },
      create: {
        userId: user.id,
        provider: 'google',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        scope: tokens.scope,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        scope: tokens.scope,
      },
    });

    // 5. 채널 정보 동기화
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

    // 6. JWT 발급
    const jwt = generateToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
    });

    // 7. 프론트로 리다이렉트 (토큰 전달)
    const redirectUrl = `${config.WEB_BASE_URL}/auth/callback?token=${jwt}&provider=google`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${config.WEB_BASE_URL}/login?error=google_auth_failed`);
  }
});

// ===== Meta OAuth =====

/**
 * Meta 로그인 시작
 */
router.get('/meta/login', (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(7); // CSRF 방지용
  const authUrl = MetaService.getAuthUrl(state);
  res.json({ url: authUrl });
});

/**
 * Meta OAuth 콜백
 */
router.get('/meta/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    // 1. Short-Lived Token 발급
    const shortToken = await MetaService.exchangeCodeForToken(code);

    // 2. Long-Lived Token으로 교환 (60일)
    const longToken = await MetaService.exchangeForLongLivedToken(
      shortToken.access_token
    );

    // 3. 사용자 정보 가져오기
    const userInfo = await MetaService.getUserInfo(longToken.access_token);

    // 4. 사용자 생성 또는 업데이트
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userInfo.email || `meta_${userInfo.id}@placeholder.local`,
          name: userInfo.name,
        },
      });
    }

    // 5. Account 저장
    await prisma.account.upsert({
      where: {
        userId_provider: {
          userId: user.id,
          provider: 'meta',
        },
      },
      create: {
        userId: user.id,
        provider: 'meta',
        accessToken: longToken.access_token,
        expiresAt: longToken.expires_in
          ? new Date(Date.now() + longToken.expires_in * 1000)
          : null,
      },
      update: {
        accessToken: longToken.access_token,
        expiresAt: longToken.expires_in
          ? new Date(Date.now() + longToken.expires_in * 1000)
          : null,
      },
    });

    // 6. 페이지 정보 동기화
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
            accessToken: page.access_token, // Page Access Token
          },
          update: {
            name: page.name,
            igId: igAccount?.id,
            accessToken: page.access_token,
          },
        });

        // IG 계정의 username 가져오기
        if (igAccount?.id) {
          try {
            const igInfo = await MetaService.getInstagramAccount(
              page.access_token,
              igAccount.id
            );
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

    // 7. JWT 발급
    const jwt = generateToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
    });

    // 8. 프론트로 리다이렉트
    const redirectUrl = `${config.WEB_BASE_URL}/auth/callback?token=${jwt}&provider=meta`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Meta OAuth error:', error);
    res.redirect(`${config.WEB_BASE_URL}/login?error=meta_auth_failed`);
  }
});

// ===== 공통 인증 =====

/**
 * 현재 로그인한 사용자 정보
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        accounts: {
          select: {
            provider: true,
            expiresAt: true,
          },
        },
        youtubeChannels: {
          select: {
            id: true,
            channelId: true,
            title: true,
          },
        },
        instagramPages: {
          select: {
            id: true,
            fbPageId: true,
            name: true,
            username: true,
            igId: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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

/**
 * 로그아웃 (클라이언트에서 토큰 삭제만 하면 됨)
 */
router.post('/logout', authMiddleware, (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
