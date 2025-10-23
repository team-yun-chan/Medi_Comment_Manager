# 배포 가이드 (Deployment Guide)

## 📋 개요

Social Comment Manager를 프로덕션 환경에 배포하는 방법입니다.

**추천 스택**:
- **Frontend**: Vercel (Next.js)
- **Backend API**: Railway
- **Worker**: Railway
- **Database**: Railway PostgreSQL
- **Redis**: Railway Redis

---

## 🎯 배포 전 체크리스트

### 필수 준비사항
- [ ] 도메인 구매 (예: your-domain.com)
- [ ] Google Cloud Console 프로젝트 생성
- [ ] Meta App 생성
- [ ] GitHub 레포지토리 생성 (프라이빗 권장)
- [ ] Railway 계정 생성
- [ ] Vercel 계정 생성

### 환경변수 준비
- [ ] Google OAuth 클라이언트 ID/Secret
- [ ] Meta App ID/Secret
- [ ] Database URL
- [ ] Redis URL
- [ ] JWT Secret
- [ ] Webhook Verify Token

---

## 1️⃣ 데이터베이스 배포 (Railway PostgreSQL)

### 1.1 Railway에서 PostgreSQL 생성

1. [Railway 대시보드](https://railway.app/dashboard) 접속
2. "New Project" 클릭
3. "Deploy PostgreSQL" 선택
4. 프로젝트명: `social-comment-db`

### 1.2 연결 정보 확인

Railway에서 제공하는 연결 정보:
```bash
DATABASE_URL=postgresql://postgres:password@host:port/railway
```

### 1.3 마이그레이션 실행

로컬에서 프로덕션 DB로 마이그레이션:

```bash
# .env.production 파일 생성
DATABASE_URL=postgresql://... # Railway에서 복사

# 마이그레이션 실행
npx prisma migrate deploy

# 확인
npx prisma studio
```

---

## 2️⃣ Redis 배포 (Railway Redis)

### 2.1 Railway에서 Redis 생성

1. Railway 프로젝트에서 "New Service" 클릭
2. "Redis" 선택
3. 연결 정보 확인:
```bash
REDIS_URL=redis://default:password@host:port
```

---

## 3️⃣ 백엔드 API 배포 (Railway)

### 3.1 Railway 프로젝트 설정

```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link
```

### 3.2 환경변수 설정

Railway 대시보드 → Variables 탭:

```bash
# Database
DATABASE_URL=postgresql://...  # PostgreSQL에서 복사

# Redis
REDIS_URL=redis://...  # Redis에서 복사

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://api.your-domain.com/auth/google/callback

# Meta OAuth
META_APP_ID=your-app-id
META_APP_SECRET=your-app-secret
META_REDIRECT_URI=https://api.your-domain.com/auth/meta/callback

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars

# Webhook
META_WEBHOOK_VERIFY_TOKEN=your-verify-token
WEBHOOK_PUBLIC_URL=https://api.your-domain.com

# Environment
NODE_ENV=production
PORT=3001
```

### 3.3 배포 설정

`apps/api/railway.json` 생성:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm --filter @app/api build"
  },
  "deploy": {
    "startCommand": "pnpm --filter @app/api start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3.4 배포 실행

```bash
# API 배포
railway up --service api

# 로그 확인
railway logs
```

### 3.5 도메인 연결

Railway 대시보드:
1. Service → Settings → Networking
2. "Generate Domain" 클릭
3. 커스텀 도메인 설정:
   - `api.your-domain.com` → Railway URL

---

## 4️⃣ Worker 배포 (Railway)

### 4.1 Worker 서비스 생성

Railway 프로젝트에서:
1. "New Service" 클릭
2. "GitHub Repo" 선택 (동일 레포)
3. Root Directory: `apps/worker`

### 4.2 환경변수 설정

Worker도 동일한 환경변수 필요:
```bash
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Moderation Engine
MODERATION_ENGINE=rule-based

# OpenAI (선택)
OPENAI_API_KEY=sk-...

# Worker Settings
WORKER_CONCURRENCY=5
```

### 4.3 배포 설정

`apps/worker/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm --filter @app/worker build"
  },
  "deploy": {
    "startCommand": "pnpm --filter @app/worker start",
    "restartPolicyType": "ALWAYS"
  }
}
```

### 4.4 배포 실행

```bash
railway up --service worker
```

---

## 5️⃣ 프론트엔드 배포 (Vercel)

### 5.1 Vercel 프로젝트 생성

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. "New Project" 클릭
3. GitHub 레포지토리 연결
4. Framework: **Next.js** 자동 감지
5. Root Directory: `apps/web`

### 5.2 환경변수 설정

Vercel → Settings → Environment Variables:

```bash
# API URL
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Auth URLs
NEXT_PUBLIC_GOOGLE_AUTH_URL=https://api.your-domain.com/auth/google
NEXT_PUBLIC_META_AUTH_URL=https://api.your-domain.com/auth/meta
```

### 5.3 빌드 설정

Vercel 자동 감지하지만, 명시적으로 설정:

**Build Command**:
```bash
pnpm --filter @app/web build
```

**Output Directory**:
```bash
apps/web/.next
```

**Install Command**:
```bash
pnpm install
```

### 5.4 도메인 연결

Vercel 대시보드:
1. Settings → Domains
2. `your-domain.com` 추가
3. DNS 설정:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel IP)
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 5.5 배포

```bash
# 로컬에서 푸시
git push origin main

# Vercel이 자동 배포
```

---

## 6️⃣ 도메인 및 DNS 설정

### 6.1 DNS 레코드

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| A | @ | 76.76.21.21 | 메인 도메인 (Vercel) |
| CNAME | www | cname.vercel-dns.com | www 리디렉션 |
| CNAME | api | railway-url.up.railway.app | API 서버 |
| TXT | @ | v=spf1... | 이메일 인증 |

### 6.2 SSL/TLS 인증서

- **Vercel**: 자동 HTTPS (Let's Encrypt)
- **Railway**: 자동 HTTPS

---

## 7️⃣ OAuth 리디렉션 URI 업데이트

### 7.1 Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. OAuth 2.0 Client IDs 선택
4. Authorized redirect URIs 추가:
   ```
   https://api.your-domain.com/auth/google/callback
   https://your-domain.com/auth/callback
   ```

### 7.2 Meta App Dashboard

1. [Meta Developers](https://developers.facebook.com/apps)
2. App 선택 → Settings → Basic
3. App Domains:
   ```
   your-domain.com
   api.your-domain.com
   ```
4. Privacy Policy URL:
   ```
   https://your-domain.com/privacy
   ```
5. User Data Deletion URL:
   ```
   https://your-domain.com/data-deletion
   ```

---

## 8️⃣ Webhook 설정

### 8.1 Meta Webhook 등록

1. Meta App → Products → Webhooks
2. Callback URL:
   ```
   https://api.your-domain.com/webhooks/meta
   ```
3. Verify Token: (환경변수와 동일)
   ```
   your-verify-token
   ```
4. Subscribe to:
   - ✅ comments
   - ✅ mentions

### 8.2 Webhook 검증

```bash
# 테스트 이벤트 전송 (Meta에서 제공)
curl -X POST https://api.your-domain.com/webhooks/meta \
  -H "Content-Type: application/json" \
  -d '{"object":"instagram","entry":[...]}'

# 로그 확인
railway logs --service api
```

---

## 9️⃣ 모니터링 및 로깅

### 9.1 Railway 로그

```bash
# API 로그
railway logs --service api

# Worker 로그
railway logs --service worker
```

### 9.2 Vercel 로그

Vercel 대시보드 → Deployments → Logs

### 9.3 에러 트래킹 (선택)

**Sentry 설정**:
```bash
# 설치
pnpm add @sentry/nextjs @sentry/node

# 환경변수
SENTRY_DSN=https://...@sentry.io/...
```

---

## 🔟 성능 최적화

### 10.1 CDN 설정

Vercel은 자동 CDN 제공 ✅

### 10.2 Database 인덱스

```sql
-- 자주 조회되는 컬럼에 인덱스
CREATE INDEX idx_youtube_comments_video_id ON youtube_comments(video_id);
CREATE INDEX idx_instagram_comments_media_id ON instagram_comments(media_id);
CREATE INDEX idx_users_email ON users(email);
```

### 10.3 Redis 캐싱

```typescript
// 자주 조회되는 데이터 캐싱
const cachedData = await redis.get(`user:${userId}:channels`);
if (cachedData) return JSON.parse(cachedData);

// DB 조회 후 캐싱
const channels = await prisma.youtubeChannel.findMany(...);
await redis.set(`user:${userId}:channels`, JSON.stringify(channels), 'EX', 3600);
```

---

## 1️⃣1️⃣ 백업 전략

### 11.1 데이터베이스 백업

Railway는 자동 백업 제공 ✅

**수동 백업**:
```bash
# 백업 생성
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 복구
psql $DATABASE_URL < backup_20250101.sql
```

### 11.2 환경변수 백업

```bash
# Railway 환경변수 내보내기
railway variables > .env.production.backup

# Vercel 환경변수는 대시보드에서 수동 복사
```

---

## 1️⃣2️⃣ CI/CD 설정 (GitHub Actions)

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Deploy API to Railway
        run: railway up --service api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      
      - name: Deploy Worker to Railway
        run: railway up --service worker
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      
      - name: Deploy Web to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 1️⃣3️⃣ 헬스체크 엔드포인트

`apps/api/src/routes/health.ts`:
```typescript
import { Router } from 'express';
import { prisma } from '../db';
import redis from '../lib/redis';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    
    // Redis check
    await redis.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
        redis: 'ok',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

export default router;
```

---

## 1️⃣4️⃣ 배포 후 확인 사항

### ✅ 체크리스트

- [ ] 웹사이트 접속 (https://your-domain.com)
- [ ] API 헬스체크 (https://api.your-domain.com/health)
- [ ] Google OAuth 로그인 테스트
- [ ] Meta OAuth 로그인 테스트
- [ ] YouTube 댓글 동기화 테스트
- [ ] Instagram 댓글 동기화 테스트
- [ ] Webhook 수신 테스트
- [ ] 댓글 삭제/숨김 테스트
- [ ] Worker 작동 확인 (로그)
- [ ] SSL 인증서 확인 (https)
- [ ] 성능 테스트 (Lighthouse)

---

## 1️⃣5️⃣ 트러블슈팅

### 문제 1: API 연결 실패
```
Error: Network request failed
```
**해결**:
- CORS 설정 확인
- API URL 환경변수 확인
- Railway 서비스 실행 상태 확인

### 문제 2: OAuth 리디렉션 실패
```
Error: redirect_uri_mismatch
```
**해결**:
- Google/Meta 콘솔에서 리디렉션 URI 확인
- 환경변수의 REDIRECT_URI 확인
- HTTPS 사용 확인

### 문제 3: Webhook 수신 안 됨
**해결**:
- Webhook URL이 공개 HTTPS인지 확인
- Verify Token 일치 확인
- Meta App에서 구독 상태 확인

---

## 📞 지원

배포 관련 문의: support@your-domain.com

---

**배포 완료! 🎉**
