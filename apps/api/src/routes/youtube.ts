import { Router, Response } from 'express';
import { GoogleService } from '../services/google';
import { prisma } from '../db';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import { queueCommentSync } from '../queues';

const router = Router();

// 모든 라우트에 인증 적용
router.use(authMiddleware);

/**
 * Helper: 사용자의 Google Access Token 가져오기
 */
async function getGoogleAccessToken(userId: string): Promise<string> {
  const account = await prisma.account.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: 'google',
      },
    },
  });

  if (!account) {
    throw new Error('Google account not connected');
  }

  // 토큰 만료 확인 및 리프레시
  if (account.expiresAt && account.expiresAt < new Date()) {
    if (!account.refreshToken) {
      throw new Error('Refresh token not available');
    }

    const newAccessToken = await GoogleService.refreshAccessToken(
      account.refreshToken
    );

    await prisma.account.update({
      where: {
        userId_provider: {
          userId,
          provider: 'google',
        },
      },
      data: {
        accessToken: newAccessToken,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1시간
      },
    });

    return newAccessToken;
  }

  return account.accessToken;
}

/**
 * 내 YouTube 채널 목록
 */
router.get('/channels', async (req: AuthRequest, res: Response) => {
  try {
    const channels = await prisma.youtubeChannel.findMany({
      where: { userId: req.user!.id },
    });

    res.json({ channels });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: 'Failed to get channels' });
  }
});

/**
 * 채널 동기화 (최신 정보 가져오기)
 */
router.post('/channels/sync', async (req: AuthRequest, res: Response) => {
  try {
    const accessToken = await getGoogleAccessToken(req.user!.id);
    const channels = await GoogleService.getMyChannels(accessToken);

    for (const channel of channels) {
      await prisma.youtubeChannel.upsert({
        where: { channelId: channel.id! },
        create: {
          channelId: channel.id!,
          title: channel.snippet?.title || 'Unknown',
          userId: req.user!.id,
        },
        update: {
          title: channel.snippet?.title || 'Unknown',
        },
      });
    }

    const syncedChannels = await prisma.youtubeChannel.findMany({
      where: { userId: req.user!.id },
    });

    res.json({ channels: syncedChannels });
  } catch (error) {
    console.error('Sync channels error:', error);
    res.status(500).json({ error: 'Failed to sync channels' });
  }
});

/**
 * 채널의 비디오 목록
 */
router.get('/videos', async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.query;

    if (!channelId) {
      return res.status(400).json({ error: 'channelId is required' });
    }

    const accessToken = await getGoogleAccessToken(req.user!.id);
    const videos = await GoogleService.getChannelVideos(
      accessToken,
      channelId as string
    );

    // DB에 저장
    for (const video of videos) {
      if (video.id?.videoId) {
        await prisma.youtubeVideo.upsert({
          where: { videoId: video.id.videoId },
          create: {
            videoId: video.id.videoId,
            title: video.snippet?.title || 'Unknown',
            channelId: channelId as string,
          },
          update: {
            title: video.snippet?.title || 'Unknown',
          },
        });
      }
    }

    res.json({ videos });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to get videos' });
  }
});

/**
 * 비디오의 댓글 목록 (DB 조회)
 */
router.get('/comments', async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.query;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const comments = await prisma.youtubeComment.findMany({
      where: { videoId: videoId as string },
      orderBy: { publishedAt: 'desc' },
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
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    // 백그라운드 작업 큐에 추가
    await queueCommentSync({
      platform: 'youtube',
      userId: req.user!.id,
      videoId,
    });

    res.json({
      message: 'Comment sync job queued',
      videoId,
    });
  } catch (error) {
    console.error('Sync comments error:', error);
    res.status(500).json({ error: 'Failed to queue sync job' });
  }
});

/**
 * 댓글 삭제
 */
router.delete('/comments/:commentId', async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;

    const accessToken = await getGoogleAccessToken(req.user!.id);
    await GoogleService.deleteComment(accessToken, commentId);

    // DB에서도 삭제
    await prisma.youtubeComment.delete({
      where: { commentId },
    });

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        platform: 'youtube',
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
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const accessToken = await getGoogleAccessToken(req.user!.id);
    const reply = await GoogleService.replyToComment(
      accessToken,
      commentId,
      text
    );

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        platform: 'youtube',
        entityType: 'comment',
        entityId: commentId,
        action: 'reply',
        meta: { text },
      },
    });

    res.json({ message: 'Reply posted successfully', reply });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ error: 'Failed to post reply' });
  }
});

/**
 * 댓글 숨김/보류 처리
 */
router.post('/comments/:commentId/moderate', async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { status } = req.body; // 'heldForReview' | 'published' | 'rejected'

    if (!['heldForReview', 'published', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const accessToken = await getGoogleAccessToken(req.user!.id);
    await GoogleService.setModerationStatus(accessToken, commentId, status);

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        platform: 'youtube',
        entityType: 'comment',
        entityId: commentId,
        action: 'moderate',
        meta: { status },
      },
    });

    res.json({ message: 'Comment moderation status updated' });
  } catch (error) {
    console.error('Moderate comment error:', error);
    res.status(500).json({ error: 'Failed to moderate comment' });
  }
});

export default router;
