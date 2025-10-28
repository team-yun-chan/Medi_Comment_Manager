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

  // 1. Access Token 가져오기
  const account = await prisma.account.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: 'google',
      },
    },
  })

  if (!account || !account.accessToken) {
    throw new Error('Google account not found or no access token')
  }

  console.log(`[Sync] 🔑 Got access token for user ${userId}`)

  // 2. YouTube API 호출 (Google Service import 필요)
  // ⚠️ GoogleService를 import 해야 함!
  console.log(`[Sync] 📡 Calling YouTube API...`)
  
  try {
    // Google Service import
    const { google } = await import('googleapis')
    const youtube = google.youtube('v3')

    // Access Token으로 OAuth2 클라이언트 생성
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: account.accessToken })

    // YouTube API 호출
    const response = await youtube.commentThreads.list({
      auth: oauth2Client,
      part: ['snippet'],
      videoId: videoId,
      maxResults: 100,
      order: 'time',
    })

    const fetchedComments = response.data.items || []
    console.log(`[Sync] ✅ Fetched ${fetchedComments.length} comments from YouTube`)

    // 3. DB에 저장
    let savedCount = 0
    for (const thread of fetchedComments) {
      const commentData = thread.snippet?.topLevelComment?.snippet
      if (!commentData || !thread.id) continue

      await prisma.youtubeComment.upsert({
        where: { commentId: thread.id },
        create: {
          commentId: thread.id,
          videoId: videoId,
          text: commentData.textDisplay || '',
          authorName: commentData.authorDisplayName || 'Unknown',
          authorChannelId: commentData.authorChannelId?.value,
          likeCount: commentData.likeCount || 0,
          publishedAt: new Date(commentData.publishedAt!),
        },
        update: {
          text: commentData.textDisplay || '',
          likeCount: commentData.likeCount || 0,
        },
      })
      savedCount++
    }

    console.log(`[Sync] ✅ Saved ${savedCount} comments to DB`)

    // 4. DB에서 댓글 다시 조회
    const existingComments = await prisma.youtubeComment.findMany({
      where: { videoId },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    })

    console.log(`[Sync] Found ${existingComments.length} existing YouTube comments`)

    // 5. 새 댓글을 모더레이션 큐에 추가
    let queuedCount = 0
    for (const comment of existingComments) {
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
  } catch (error: any) {
    console.error(`[Sync] ❌ YouTube API Error:`, error.message)
    throw error
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
