import { Queue } from 'bullmq'
import redis from '../lib/redis'

// ===== Queue Names =====
export const QUEUE_NAMES = {
  COMMENT_SYNC: 'comment-sync',
  MODERATION: 'moderation',
  WEBHOOK_EVENT: 'webhook-event',
} as const

// ===== Queues =====
export const commentSyncQueue = new Queue(QUEUE_NAMES.COMMENT_SYNC, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5초, 10초, 20초
    },
    removeOnComplete: 100, // 완료된 작업 100개까지 보관
    removeOnFail: 500,
  },
})

export const moderationQueue = new Queue(QUEUE_NAMES.MODERATION, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: 200,
    removeOnFail: 500,
  },
})

export const webhookEventQueue = new Queue(QUEUE_NAMES.WEBHOOK_EVENT, {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 50,
    removeOnFail: 200,
  },
})

// ===== Job Types =====
export interface CommentSyncJob {
  platform: 'youtube' | 'instagram'
  userId: string
  channelId?: string
  videoId?: string
  pageId?: string
  mediaId?: string
}

export interface ModerationJob {
  commentId: string
  commentText: string
  platform: 'youtube' | 'instagram'
  userId: string
  rules?: string[] // 특정 규칙만 적용
}

export interface WebhookEventJob {
  platform: 'meta'
  event: any
  receivedAt: Date
}

console.log('✅ Queues initialized')
