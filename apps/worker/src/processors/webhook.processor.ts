import { Job } from 'bullmq'
import { prisma } from '../lib/prisma'
import { WebhookEventJob } from '../queues'
import { moderationQueue } from '../queues'

/**
 * Webhook 이벤트 처리
 * 
 * Meta에서 받은 댓글/멘션 이벤트를 처리하고
 * 자동으로 모더레이션 큐에 추가
 */
export async function processWebhookEventJob(job: Job<WebhookEventJob>) {
  const { platform, event, receivedAt } = job.data

  console.log(`[Webhook] Processing ${platform} event`)

  try {
    if (platform === 'meta') {
      return await processMetaWebhook(event)
    } else {
      throw new Error(`Unsupported platform: ${platform}`)
    }
  } catch (error: any) {
    console.error(`[Webhook] Error:`, error)
    throw error
  }
}

/**
 * Meta Webhook 이벤트 처리
 */
async function processMetaWebhook(event: any) {
  const { object, entry } = event

  if (object !== 'instagram' && object !== 'page') {
    console.log(`[Webhook] Skipping non-Instagram event: ${object}`)
    return { skipped: true }
  }

  let processedCount = 0

  for (const entryItem of entry || []) {
    for (const change of entryItem.changes || []) {
      if (change.field === 'comments') {
        await handleCommentEvent(change.value)
        processedCount++
      } else if (change.field === 'mentions') {
        await handleMentionEvent(change.value)
        processedCount++
      }
    }
  }

  return {
    success: true,
    processed: processedCount,
  }
}

/**
 * 댓글 이벤트 처리
 */
async function handleCommentEvent(value: any) {
  const { id, text, from, media } = value

  if (!id || !text || !from || !media) {
    console.warn(`[Webhook] Missing required fields in comment event`)
    return
  }

  console.log(`[Webhook] Comment event: ${id}`)

  try {
    // 1. 미디어 찾기
    const existingMedia = await prisma.instagramMedia.findUnique({
      where: { mediaId: media.id },
      include: {
        page: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!existingMedia) {
      console.warn(`[Webhook] Media not found: ${media.id}`)
      return
    }

    // 2. 댓글 저장 또는 업데이트
    const comment = await prisma.instagramComment.upsert({
      where: { commentId: id },
      create: {
        commentId: id,
        mediaId: existingMedia.id,
        text,
        username: from.username || from.id,
        timestamp: new Date(),
        likeCount: 0,
      },
      update: {
        text,
        username: from.username || from.id,
      },
    })

    console.log(`[Webhook] Comment saved: ${comment.id}`)

    // 3. 모더레이션 큐에 추가
    const userId = existingMedia.page.userId

    await moderationQueue.add('moderate-comment', {
      commentId: comment.commentId,
      commentText: text,
      platform: 'instagram',
      userId,
    })

    console.log(`[Webhook] Comment queued for moderation: ${id}`)

    // 4. Webhook 로그 업데이트
    await prisma.webhookLog.create({
      data: {
        platform: 'meta',
        event: 'comment',
        payload: value,
        status: 'processed',
      },
    })
  } catch (error: any) {
    console.error(`[Webhook] Error handling comment event:`, error)

    // 실패 로그
    await prisma.webhookLog.create({
      data: {
        platform: 'meta',
        event: 'comment',
        payload: value,
        status: 'failed',
        error: error.message,
      },
    })

    throw error
  }
}

/**
 * 멘션 이벤트 처리
 */
async function handleMentionEvent(value: any) {
  const { comment_id, text, from, media } = value

  if (!comment_id || !text || !from || !media) {
    console.warn(`[Webhook] Missing required fields in mention event`)
    return
  }

  console.log(`[Webhook] Mention event: ${comment_id}`)

  try {
    // 멘션도 댓글로 처리
    const existingMedia = await prisma.instagramMedia.findUnique({
      where: { mediaId: media.id },
      include: {
        page: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!existingMedia) {
      console.warn(`[Webhook] Media not found: ${media.id}`)
      return
    }

    const comment = await prisma.instagramComment.upsert({
      where: { commentId: comment_id },
      create: {
        commentId: comment_id,
        mediaId: existingMedia.id,
        text,
        username: from.username || from.id,
        timestamp: new Date(),
        likeCount: 0,
      },
      update: {
        text,
      },
    })

    console.log(`[Webhook] Mention saved: ${comment.id}`)

    // 모더레이션 큐에 추가
    const userId = existingMedia.page.userId

    await moderationQueue.add('moderate-comment', {
      commentId: comment.commentId,
      commentText: text,
      platform: 'instagram',
      userId,
    })

    console.log(`[Webhook] Mention queued for moderation: ${comment_id}`)

    await prisma.webhookLog.create({
      data: {
        platform: 'meta',
        event: 'mention',
        payload: value,
        status: 'processed',
      },
    })
  } catch (error: any) {
    console.error(`[Webhook] Error handling mention event:`, error)

    await prisma.webhookLog.create({
      data: {
        platform: 'meta',
        event: 'mention',
        payload: value,
        status: 'failed',
        error: error.message,
      },
    })

    throw error
  }
}
