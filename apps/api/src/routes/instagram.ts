import { Router, Response } from 'express';
import { MetaService } from '../services/meta';
import { prisma } from '../db';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import { queueCommentSync } from '../queues';

const router = Router();

// 모든 라우트에 인증 적용
router.use(authMiddleware);

/**
 * Helper: 사용자의 Instagram 페이지 Access Token 가져오기
 */
async function getPageAccessToken(userId: string, pageId: string): Promise<string> {
  const page = await prisma.instagramPage.findFirst({
    where: {
      id: pageId,
      userId,
    },
  });

  if (!page) {
    throw new Error('Instagram page not found');
  }

  return page.accessToken;
}

/**
 * 내 Instagram 페이지 목록
 */
router.get('/pages', async (req: AuthRequest, res: Response) => {
  try {
    const pages = await prisma.instagramPage.findMany({
      where: { userId: req.user!.id },
    });

    res.json({ pages });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ error: 'Failed to get pages' });
  }
});

/**
 * 페이지 동기화 (최신 정보 가져오기)
 */
router.post('/pages/sync', async (req: AuthRequest, res: Response) => {
  try {
    const metaAccount = await prisma.account.findUnique({
      where: {
        userId_provider: {
          userId: req.user!.id,
          provider: 'meta',
        },
      },
    });

    if (!metaAccount) {
      return res.status(400).json({ error: 'Meta account not connected' });
    }

    const pages = await MetaService.getUserPages(metaAccount.accessToken);

    for (const page of pages) {
      const igAccount = page.instagram_business_account;

      await prisma.instagramPage.upsert({
        where: { fbPageId: page.id },
        create: {
          fbPageId: page.id,
          name: page.name,
          igId: igAccount?.id,
          userId: req.user!.id,
          accessToken: page.access_token,
        },
        update: {
          name: page.name,
          igId: igAccount?.id,
          accessToken: page.access_token,
        },
      });

      // IG 계정 username 가져오기
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

    const syncedPages = await prisma.instagramPage.findMany({
      where: { userId: req.user!.id },
    });

    res.json({ pages: syncedPages });
  } catch (error) {
    console.error('Sync pages error:', error);
    res.status(500).json({ error: 'Failed to sync pages' });
  }
});

/**
 * 페이지의 Instagram 미디어 목록
 */
router.get('/media', async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.query;

    if (!pageId) {
      return res.status(400).json({ error: 'pageId is required' });
    }

    const page = await prisma.instagramPage.findFirst({
      where: {
        id: pageId as string,
        userId: req.user!.id,
      },
    });

    if (!page || !page.igId) {
      return res.status(404).json({ error: 'Instagram account not found' });
    }

    const media = await MetaService.getInstagramMedia(
      page.accessToken,
      page.igId
    );

    // DB에 저장
    for (const item of media) {
      await prisma.instagramMedia.upsert({
        where: { mediaId: item.id },
        create: {
          mediaId: item.id,
          pageId: page.id,
          caption: item.caption,
          permalink: item.permalink,
          timestamp: new Date(item.timestamp),
        },
        update: {
          caption: item.caption,
          permalink: item.permalink,
        },
      });
    }

    res.json({ media });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to get media' });
  }
});

/**
 * 미디어의 댓글 목록 (DB 조회)
 */
router.get('/comments', async (req: AuthRequest, res: Response) => {
  try {
    const { mediaId } = req.query;

    if (!mediaId) {
      return res.status(400).json({ error: 'mediaId is required' });
    }

    const comments = await prisma.instagramComment.findMany({
      where: { mediaId: mediaId as string },
      orderBy: { timestamp: 'desc' },
    });

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

/**
 * 댓글 동기화 (API에서 최신 댓글 가져와 DB 저장)
 */
router.post('/comments/sync', async (req: AuthRequest, res: Response) => {
  try {
    const { mediaId, pageId } = req.body;

    if (!mediaId || !pageId) {
      return res.status(400).json({ error: 'mediaId and pageId are required' });
    }

    // 백그라운드 작업 큐에 추가
    await queueCommentSync({
      platform: 'instagram',
      userId: req.user!.id,
      mediaId,
      pageId,
    });

    res.json({
      message: 'Comment sync job queued',
      mediaId,
    });
  } catch (error) {
    console.error('Sync comments error:', error);
    res.status(500).json({ error: 'Failed to queue sync job' });
  }
});

/**
 * 댓글 숨김
 */
router.post('/comments/:commentId/hide', async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { pageId } = req.body;

    if (!pageId) {
      return res.status(400).json({ error: 'pageId is required' });
    }

    const comment = await prisma.instagramComment.findUnique({
      where: { commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const accessToken = await getPageAccessToken(req.user!.id, pageId);
    await MetaService.hideComment(accessToken, comment.commentId);

    // DB 업데이트
    await prisma.instagramComment.update({
      where: { commentId },
      data: { hidden: true },
    });

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        platform: 'instagram',
        entityType: 'comment',
        entityId: commentId,
        action: 'hide',
      },
    });

    res.json({ message: 'Comment hidden successfully' });
  } catch (error) {
    console.error('Hide comment error:', error);
    res.status(500).json({ error: 'Failed to hide comment' });
  }
});

/**
 * 댓글 숨김 해제
 */
router.post('/comments/:commentId/unhide', async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { pageId } = req.body;

    if (!pageId) {
      return res.status(400).json({ error: 'pageId is required' });
    }

    const comment = await prisma.instagramComment.findUnique({
      where: { commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const accessToken = await getPageAccessToken(req.user!.id, pageId);
    await MetaService.unhideComment(accessToken, comment.commentId);

    // DB 업데이트
    await prisma.instagramComment.update({
      where: { commentId },
      data: { hidden: false },
    });

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        platform: 'instagram',
        entityType: 'comment',
        entityId: commentId,
        action: 'unhide',
      },
    });

    res.json({ message: 'Comment unhidden successfully' });
  } catch (error) {
    console.error('Unhide comment error:', error);
    res.status(500).json({ error: 'Failed to unhide comment' });
  }
});

/**
 * 댓글 삭제
 */
router.delete('/comments/:commentId', async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { pageId } = req.body;

    if (!pageId) {
      return res.status(400).json({ error: 'pageId is required' });
    }

    const comment = await prisma.instagramComment.findUnique({
      where: { commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const accessToken = await getPageAccessToken(req.user!.id, pageId);
    await MetaService.deleteComment(accessToken, comment.commentId);

    // DB에서도 삭제
    await prisma.instagramComment.delete({
      where: { commentId },
    });

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        platform: 'instagram',
        entityType: 'comment',
        entityId: commentId,
        action: 'delete',
      },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

/**
 * 댓글에 답글 달기
 */
router.post('/comments/:commentId/reply', async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { pageId, message } = req.body;

    if (!pageId || !message) {
      return res.status(400).json({ error: 'pageId and message are required' });
    }

    const comment = await prisma.instagramComment.findUnique({
      where: { commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const accessToken = await getPageAccessToken(req.user!.id, pageId);
    const reply = await MetaService.replyToComment(
      accessToken,
      comment.commentId,
      message
    );

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        platform: 'instagram',
        entityType: 'comment',
        entityId: commentId,
        action: 'reply',
        meta: { message },
      },
    });

    res.json({ message: 'Reply posted successfully', reply });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ error: 'Failed to post reply' });
  }
});

/**
 * Webhook 구독
 */
router.post('/pages/:pageId/subscribe', async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;

    const page = await prisma.instagramPage.findFirst({
      where: {
        id: pageId,
        userId: req.user!.id,
      },
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const result = await MetaService.subscribePageWebhook(
      page.accessToken,
      page.fbPageId
    );

    res.json({
      message: 'Webhook subscribed successfully',
      result,
    });
  } catch (error) {
    console.error('Subscribe webhook error:', error);
    res.status(500).json({ error: 'Failed to subscribe webhook' });
  }
});

/**
 * Webhook 구독 해제
 */
router.post('/pages/:pageId/unsubscribe', async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;

    const page = await prisma.instagramPage.findFirst({
      where: {
        id: pageId,
        userId: req.user!.id,
      },
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const result = await MetaService.unsubscribePageWebhook(
      page.accessToken,
      page.fbPageId
    );

    res.json({
      message: 'Webhook unsubscribed successfully',
      result,
    });
  } catch (error) {
    console.error('Unsubscribe webhook error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe webhook' });
  }
});

/**
 * Webhook 구독 상태 확인
 */
router.get('/pages/:pageId/webhooks', async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;

    const page = await prisma.instagramPage.findFirst({
      where: {
        id: pageId,
        userId: req.user!.id,
      },
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const subscriptions = await MetaService.getWebhookSubscriptions(
      page.accessToken,
      page.fbPageId
    );

    res.json({ subscriptions });
  } catch (error) {
    console.error('Get webhooks error:', error);
    res.status(500).json({ error: 'Failed to get webhook subscriptions' });
  }
});

export default router;
