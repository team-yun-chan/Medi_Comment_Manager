import { Queue } from 'bullmq'
import { Redis } from 'ioredis'
import { config } from './config'

// Redis 연결
const redis = new Redis(config.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

// 큐 인스턴스
export const commentSyncQueue = new Queue('comment-sync', {
  connection: redis,
})

export const moderationQueue = new Queue('moderation', {
  connection: redis,
})

export const webhookEventQueue = new Queue('webhook-event', {
  connection: redis,
})

// 헬퍼 함수
export async function queueCommentSync(data: {
  platform: 'youtube' | 'instagram'
  userId: string
  videoId?: string
  mediaId?: string
  pageId?: string
}) {
  return await commentSyncQueue.add('sync', data)
}

export async function queueModeration(data: {
  commentId: string
  commentText: string
  platform: 'youtube' | 'instagram'
  userId: string
}) {
  return await moderationQueue.add('moderate', data)
}

export async function queueWebhookEvent(data: {
  platform: 'meta'
  event: any
  receivedAt: Date
}) {
  return await webhookEventQueue.add('webhook', data)
}
