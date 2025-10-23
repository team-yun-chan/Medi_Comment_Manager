import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../../../.env') })

export const config = {
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/social_saas',
  },
  worker: {
    concurrency: 5, // 동시 처리 작업 수
  },
  moderation: {
    // 미래: OpenAI 설정
    openaiApiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    
    // 현재: 규칙 기반 설정
    enabled: true,
  },
}
