import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// 모든 라우트에 인증 적용
router.use(authMiddleware);

/**
 * 모더레이션 규칙 목록
 */
router.get('/rules', async (req: AuthRequest, res: Response) => {
  try {
    const rules = await prisma.moderationRule.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ rules });
  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({ error: 'Failed to get rules' });
  }
});

/**
 * 규칙 생성
 */
router.post('/rules', async (req: AuthRequest, res: Response) => {
  try {
    const { name, platform, type, pattern, action, enabled } = req.body;

    if (!name || !platform || !type || !pattern || !action) {
      return res.status(400).json({
        error: 'name, platform, type, pattern, action are required',
      });
    }

    // 유효성 검증
    const validPlatforms = ['youtube', 'instagram', 'all'];
    const validTypes = ['keyword', 'regex', 'user', 'spam'];
    const validActions = ['hide', 'delete', 'reply'];

    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }

    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const rule = await prisma.moderationRule.create({
      data: {
        userId: req.user!.id,
        name,
        platform,
        type,
        pattern,
        action,
        enabled: enabled !== undefined ? enabled : true,
      },
    });

    res.json({ rule });
  } catch (error) {
    console.error('Create rule error:', error);
    res.status(500).json({ error: 'Failed to create rule' });
  }
});

/**
 * 규칙 업데이트
 */
router.patch('/rules/:ruleId', async (req: AuthRequest, res: Response) => {
  try {
    const { ruleId } = req.params;
    const { name, pattern, action, enabled } = req.body;

    const rule = await prisma.moderationRule.findFirst({
      where: {
        id: ruleId,
        userId: req.user!.id,
      },
    });

    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    const updatedRule = await prisma.moderationRule.update({
      where: { id: ruleId },
      data: {
        ...(name && { name }),
        ...(pattern && { pattern }),
        ...(action && { action }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    res.json({ rule: updatedRule });
  } catch (error) {
    console.error('Update rule error:', error);
    res.status(500).json({ error: 'Failed to update rule' });
  }
});

/**
 * 규칙 삭제
 */
router.delete('/rules/:ruleId', async (req: AuthRequest, res: Response) => {
  try {
    const { ruleId } = req.params;

    const rule = await prisma.moderationRule.findFirst({
      where: {
        id: ruleId,
        userId: req.user!.id,
      },
    });

    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    await prisma.moderationRule.delete({
      where: { id: ruleId },
    });

    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    console.error('Delete rule error:', error);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

/**
 * 규칙 시뮬레이션 (테스트)
 */
router.post('/simulate', async (req: AuthRequest, res: Response) => {
  try {
    const { text, platform } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const rules = await prisma.moderationRule.findMany({
      where: {
        userId: req.user!.id,
        enabled: true,
        platform: platform || 'all',
      },
    });

    const matches = [];

    for (const rule of rules) {
      let isMatch = false;

      switch (rule.type) {
        case 'keyword':
          // 대소문자 구분 없이 검색
          isMatch = text.toLowerCase().includes(rule.pattern.toLowerCase());
          break;

        case 'regex':
          try {
            const regex = new RegExp(rule.pattern, 'i');
            isMatch = regex.test(text);
          } catch (error) {
            console.error('Invalid regex:', rule.pattern);
          }
          break;

        case 'user':
          // username 기반 매칭 (실제로는 댓글 작성자 정보 필요)
          break;

        case 'spam':
          // 간단한 스팸 감지 (링크, 반복 문자 등)
          const hasLinks = /https?:\/\//.test(text);
          const hasRepeatedChars = /(.)\1{5,}/.test(text);
          const hasExcessiveCaps = text.replace(/[^A-Z]/g, '').length > text.length * 0.7;
          
          isMatch = hasLinks || hasRepeatedChars || hasExcessiveCaps;
          break;
      }

      if (isMatch) {
        matches.push({
          ruleId: rule.id,
          ruleName: rule.name,
          action: rule.action,
          pattern: rule.pattern,
        });
      }
    }

    res.json({
      text,
      matches,
      wouldTrigger: matches.length > 0,
    });
  } catch (error) {
    console.error('Simulate error:', error);
    res.status(500).json({ error: 'Failed to simulate' });
  }
});

/**
 * 모더레이션 액션 히스토리
 */
router.get('/actions', async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 50, status } = req.query;

    // 사용자의 규칙 ID 가져오기
    const userRules = await prisma.moderationRule.findMany({
      where: { userId: req.user!.id },
      select: { id: true },
    });

    const ruleIds = userRules.map((r) => r.id);

    const actions = await prisma.moderationAction.findMany({
      where: {
        ruleId: { in: ruleIds },
        ...(status && { status: status as string }),
      },
      include: {
        rule: {
          select: {
            name: true,
            action: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    res.json({ actions });
  } catch (error) {
    console.error('Get actions error:', error);
    res.status(500).json({ error: 'Failed to get actions' });
  }
});

/**
 * 모더레이션 통계
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userRules = await prisma.moderationRule.findMany({
      where: { userId: req.user!.id },
      select: { id: true },
    });

    const ruleIds = userRules.map((r) => r.id);

    const [totalActions, pendingActions, failedActions] = await Promise.all([
      prisma.moderationAction.count({
        where: { ruleId: { in: ruleIds } },
      }),
      prisma.moderationAction.count({
        where: { ruleId: { in: ruleIds }, status: 'pending' },
      }),
      prisma.moderationAction.count({
        where: { ruleId: { in: ruleIds }, status: 'failed' },
      }),
    ]);

    res.json({
      totalRules: userRules.length,
      totalActions,
      pendingActions,
      failedActions,
      completedActions: totalActions - pendingActions - failedActions,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
