import { Job } from 'bullmq'
import { prisma } from '../lib/prisma'
import { getModerationEngine } from '../services/moderation'
import { ModerationJob } from '../queues'

/**
 * 모더레이션 작업 처리
 */
export async function processModerationJob(job: Job<ModerationJob>) {
  const { commentId, commentText, platform, userId } = job.data

  console.log(`[Moderation] Processing comment: ${commentId}`)

  try {
    // 1. 사용자의 활성 규칙 가져오기
    const rules = await prisma.moderationRule.findMany({
      where: {
        userId,
        enabled: true,
        platform: { in: [platform, 'all'] },
      },
    })

    if (rules.length === 0) {
      console.log(`[Moderation] No rules found for user ${userId}`)
      return { skipped: true, reason: 'no_rules' }
    }

    // 2. 모더레이션 엔진으로 분석
    const engine = getModerationEngine()
    const result = await engine.analyze(commentText, platform, rules as any)

    console.log(`[Moderation] Analysis result:`, {
      shouldModerate: result.shouldModerate,
      matchedRules: result.matchedRules.length,
      suggestedAction: result.suggestedAction,
    })

    // 3. 매칭된 규칙이 없으면 종료
    if (!result.shouldModerate || result.matchedRules.length === 0) {
      return { skipped: true, reason: 'no_match' }
    }

    // 4. 액션 로그 기록
    const actions = []
    for (const match of result.matchedRules) {
      const action = await prisma.moderationAction.create({
        data: {
          ruleId: match.ruleId,
          commentId,
          platform,
          action: match.action,
          status: 'pending',
        },
      })
      actions.push(action)
    }

    // 5. 실제 액션 실행 (제안된 액션 기준)
    if (result.suggestedAction) {
      await executeAction(
        commentId,
        platform,
        result.suggestedAction,
        userId,
        actions[0].id
      )
    }

    return {
      success: true,
      matchedRules: result.matchedRules.length,
      action: result.suggestedAction,
    }
  } catch (error: any) {
    console.error(`[Moderation] Error processing comment ${commentId}:`, error)
    throw error
  }
}

/**
 * 액션 실행
 */
async function executeAction(
  commentId: string,
  platform: 'youtube' | 'instagram',
  action: 'hide' | 'delete' | 'reply',
  userId: string,
  actionLogId: string
) {
  try {
    console.log(`[Action] Executing ${action} on ${platform} comment ${commentId}`)

    // TODO: 실제 API 호출
    // - YouTube: Google API
    // - Instagram: Meta Graph API
    // 
    // 지금은 DB만 업데이트

    if (platform === 'youtube') {
      // await googleApi.deleteComment(commentId)
      // await prisma.youtubeComment.delete({ where: { commentId } })
    } else if (platform === 'instagram') {
      if (action === 'hide') {
        // await metaApi.hideComment(commentId)
        await prisma.instagramComment.update({
          where: { commentId },
          data: { hidden: true },
        })
      } else if (action === 'delete') {
        // await metaApi.deleteComment(commentId)
        // await prisma.instagramComment.delete({ where: { commentId } })
      }
    }

    // 액션 로그 업데이트
    await prisma.moderationAction.update({
      where: { id: actionLogId },
      data: { status: 'done' },
    })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId,
        platform,
        entityType: 'comment',
        entityId: commentId,
        action: `auto_${action}`,
        meta: { moderationAction: actionLogId },
      },
    })

    console.log(`[Action] Successfully executed ${action}`)
  } catch (error: any) {
    console.error(`[Action] Failed to execute ${action}:`, error)

    // 실패 로그
    await prisma.moderationAction.update({
      where: { id: actionLogId },
      data: {
        status: 'failed',
        error: error.message,
      },
    })

    throw error
  }
}
