import { Worker } from 'bullmq'
import redis from '../lib/redis'
import { config } from '../config'
import { QUEUE_NAMES } from '../queues'

// Processors
import { processCommentSyncJob } from '../processors/sync.processor'
import { processModerationJob } from '../processors/moderation.processor'
import { processWebhookEventJob } from '../processors/webhook.processor'

/**
 * Comment Sync Worker
 */
export const commentSyncWorker = new Worker(
  QUEUE_NAMES.COMMENT_SYNC,
  async (job) => {
    return await processCommentSyncJob(job)
  },
  {
    connection: redis,
    concurrency: config.worker.concurrency,
  }
)

commentSyncWorker.on('completed', (job) => {
  console.log(`✅ [CommentSync] Job ${job.id} completed`)
})

commentSyncWorker.on('failed', (job, err) => {
  console.error(`❌ [CommentSync] Job ${job?.id} failed:`, err.message)
})

/**
 * Moderation Worker
 */
export const moderationWorker = new Worker(
  QUEUE_NAMES.MODERATION,
  async (job) => {
    return await processModerationJob(job)
  },
  {
    connection: redis,
    concurrency: config.worker.concurrency,
  }
)

moderationWorker.on('completed', (job, result) => {
  console.log(`✅ [Moderation] Job ${job.id} completed:`, result)
})

moderationWorker.on('failed', (job, err) => {
  console.error(`❌ [Moderation] Job ${job?.id} failed:`, err.message)
})

/**
 * Webhook Event Worker
 */
export const webhookEventWorker = new Worker(
  QUEUE_NAMES.WEBHOOK_EVENT,
  async (job) => {
    return await processWebhookEventJob(job)
  },
  {
    connection: redis,
    concurrency: config.worker.concurrency * 2, // Webhook은 더 빠르게 처리
  }
)

webhookEventWorker.on('completed', (job) => {
  console.log(`✅ [Webhook] Job ${job.id} completed`)
})

webhookEventWorker.on('failed', (job, err) => {
  console.error(`❌ [Webhook] Job ${job?.id} failed:`, err.message)
})

// 에러 핸들러
const workers = [commentSyncWorker, moderationWorker, webhookEventWorker]

workers.forEach((worker) => {
  worker.on('error', (err) => {
    console.error(`Worker error:`, err)
  })
})

console.log('✅ All workers initialized')
