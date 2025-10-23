import './lib/redis'
import './lib/prisma'
import './workers'
import { getModerationEngine } from './services/moderation'

console.log(`
╔═══════════════════════════════════════════╗
║   🔧 Social Comment SaaS Worker          ║
╠═══════════════════════════════════════════╣
║   Starting background workers...         ║
╚═══════════════════════════════════════════╝
`)

// 모더레이션 엔진 초기화 및 정보 출력
const engine = getModerationEngine()
console.log(`📋 Moderation Engine: ${engine.getName()}`)

console.log(`
✅ Workers are running!

Queues:
  - comment-sync       (댓글 동기화)
  - moderation         (자동 모더레이션)
  - webhook-event      (Webhook 이벤트)

Press Ctrl+C to stop.
`)

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n⏹️  SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('\n⏹️  SIGINT received, shutting down gracefully...')
  process.exit(0)
})
