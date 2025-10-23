import { Redis } from 'ioredis'
import { config } from '../config'

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: null,
})

redis.on('connect', () => {
  console.log('✅ Redis connected')
})

redis.on('error', (error) => {
  console.error('❌ Redis error:', error)
})

export default redis
