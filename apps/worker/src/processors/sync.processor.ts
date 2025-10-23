import { Job } from 'bullmq'
import { prisma } from '../lib/prisma'
import { CommentSyncJob } from '../queues'
import { moderationQueue } from '../queues'

/**
 * 댓글 동기화 작업 처리
 * 
 * API에서 댓글을 가져와 DB에 저장하고,
 * 새 댓글은 자동으로 모더레이션 큐에 추가
 */
export async function processCommentSyncJob(job: Job<CommentSyncJob>) {
  const { platform, userId, videoId, mediaId, pageId } = job.data

  console.log(`[Sync] Syncing ${platform} comments for user ${userId}`)

  try {
    if (platform === 'youtube' && videoId) {
      return await syncYoutubeComments(userId, videoId)
    } else if (platform === 'instagram' && mediaId && pageId) {
      return await syncInstagramComments(userId, mediaId, pageId)
    } else {
      throw new Error('Invalid sync job data')
    }
  } catch (error: any) {
    console.error(`[Sync] Error:`, error)
    throw error
  }
}

/**
 * YouTube 댓글 동기화
 */
async function syncYoutubeComments(userId: string, videoId: string) {
  console.log(`[Sync] YouTube video: ${videoId}`)

  // TODO: Google API 호출하여 실제 댓글 가져오기
  // const googleApi = ...
  // const comments = await googleApi.getVideoComments(videoId)

  // 임시: 이미 DB에 있는 댓글만 확인
  const existingComments = await prisma.youtubeComment.findMany({
    where: { videoId },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  })

  console.log(`[Sync] Found ${existingComments.length} existing YouTube comments`)

  // 새 댓글을 모더레이션 큐에 추가
  let queuedCount = 0
  for (const comment of existingComments) {
    // 이미 처리된 댓글은 스킵
    const alreadyProcessed = await prisma.moderationAction.findFirst({
      where: { commentId: comment.commentId },
    })

    if (!alreadyProcessed) {
      await moderationQueue.add('moderate-comment', {
        commentId: comment.commentId,
        commentText: comment.text,
        platform: 'youtube',
        userId,
      })
      queuedCount++
    }
  }

  console.log(`[Sync] Queued ${queuedCount} YouTube comments for moderation`)

  return {
    success: true,
    platform: 'youtube',
    total: existingComments.length,
    queued: queuedCount,
  }
}

/**
 * Instagram 댓글 동기화
 */
async function syncInstagramComments(userId: string, mediaId: string, pageId: string) {
  console.log(`[Sync] Instagram media: ${mediaId}`)

  // TODO: Meta Graph API 호출하여 실제 댓글 가져오기
  // const metaApi = ...
  // const comments = await metaApi.getMediaComments(mediaId)

  // 임시: 이미 DB에 있는 댓글만 확인
  const existingComments = await prisma.instagramComment.findMany({
    where: { mediaId },
    orderBy: { timestamp: 'desc' },
    take: 50,
  })

  console.log(`[Sync] Found ${existingComments.length} existing Instagram comments`)

  // 새 댓글을 모더레이션 큐에 추가
  let queuedCount = 0
  for (const comment of existingComments) {
    // 이미 처리된 댓글은 스킵
    const alreadyProcessed = await prisma.moderationAction.findFirst({
      where: { commentId: comment.commentId },
    })

    if (!alreadyProcessed) {
      await moderationQueue.add('moderate-comment', {
        commentId: comment.commentId,
        commentText: comment.text,
        platform: 'instagram',
        userId,
      })
      queuedCount++
    }
  }

  console.log(`[Sync] Queued ${queuedCount} Instagram comments for moderation`)

  return {
    success: true,
    platform: 'instagram',
    total: existingComments.length,
    queued: queuedCount,
  }
}
