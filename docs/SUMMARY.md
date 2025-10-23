# 🎉 Social Comment SaaS - 완성!

## 📊 프로젝트 개요

**YouTube + Instagram 통합 댓글 관리 플랫폼**

멀티플랫폼 댓글을 한 곳에서 관리하고, 키워드 기반 자동 모더레이션으로 효율적인 커뮤니티 관리를 제공하는 SaaS 서비스입니다.

---

## ✅ 완성된 기능

### 1. 인증 및 OAuth
- ✅ Google OAuth 2.0 (YouTube)
- ✅ Meta OAuth 2.0 (Instagram)
- ✅ JWT 기반 세션 관리
- ✅ 리프레시 토큰 자동 갱신

### 2. YouTube 통합
- ✅ 채널 목록 조회
- ✅ 비디오 목록 조회
- ✅ 댓글 동기화 (백그라운드)
- ✅ 댓글 삭제/답글
- ✅ 모더레이션 상태 설정

### 3. Instagram 통합
- ✅ Facebook 페이지 연동
- ✅ Instagram 비즈니스 계정 연동
- ✅ 게시물 목록 조회
- ✅ 댓글 동기화 (백그라운드)
- ✅ 댓글 숨김/삭제/답글
- ✅ Webhook 실시간 수신

### 4. 자동 모더레이션
- ✅ **교체 가능한 엔진 구조** (Strategy Pattern)
  - ✅ 규칙 기반 엔진 (현재)
  - ✅ AI Agent 엔진 (준비 완료)
- ✅ 키워드 차단
- ✅ 정규식 패턴 매칭
- ✅ 스팸 감지
- ✅ 자동 액션 (숨김/삭제/답글)

### 5. 백그라운드 작업 (BullMQ)
- ✅ 댓글 동기화 큐
- ✅ 모더레이션 큐
- ✅ Webhook 이벤트 큐
- ✅ 재시도 및 에러 핸들링

### 6. 프론트엔드
- ✅ 대시보드 (홈)
- ✅ YouTube 댓글 관리
- ✅ Instagram 댓글 관리
- ✅ 모더레이션 규칙 설정
- ✅ 감사 로그
- ✅ 설정 (계정 관리)
- ✅ 반응형 디자인 (Tailwind + shadcn/ui)

### 7. 검수 문서
- ✅ Google OAuth 검수 가이드
- ✅ Meta App 검수 가이드
- ✅ 개인정보 처리방침
- ✅ 데이터 삭제 정책
- ✅ 배포 가이드
- ✅ 최종 체크리스트

---

## 📂 전체 파일 구조

```
social-comment-saas/
├── apps/
│   ├── api/                          # Express 백엔드 API
│   │   ├── src/
│   │   │   ├── routes/              # API 라우트 (auth, youtube, instagram, webhooks)
│   │   │   ├── services/            # 비즈니스 로직 (Google, Meta)
│   │   │   ├── middleware/          # 인증, 에러 핸들러
│   │   │   ├── lib/                 # 유틸리티 (prisma, redis)
│   │   │   ├── queues.ts            # BullMQ 큐 연동
│   │   │   ├── config.ts            # 환경 설정
│   │   │   └── index.ts             # 메인 엔트리
│   │   └── package.json
│   │
│   ├── web/                          # Next.js 프론트엔드
│   │   ├── app/                     # Next.js 13+ App Router
│   │   │   ├── dashboard/           # 대시보드 페이지
│   │   │   ├── login/               # 로그인 페이지
│   │   │   └── auth/                # OAuth 콜백
│   │   ├── components/              # React 컴포넌트
│   │   │   ├── ui/                  # shadcn/ui 컴포넌트
│   │   │   ├── youtube/             # YouTube 전용 컴포넌트
│   │   │   ├── instagram/           # Instagram 전용 컴포넌트
│   │   │   └── moderation/          # 모더레이션 컴포넌트
│   │   ├── lib/                     # 유틸리티 (API 클라이언트)
│   │   └── package.json
│   │
│   └── worker/                       # BullMQ 백그라운드 워커
│       ├── src/
│       │   ├── processors/          # 작업 처리기
│       │   │   ├── sync.processor.ts      # 댓글 동기화
│       │   │   ├── moderation.processor.ts # 자동 모더레이션
│       │   │   └── webhook.processor.ts    # Webhook 처리
│       │   ├── services/
│       │   │   └── moderation/      # 모더레이션 엔진
│       │   │       ├── engine.ts           # 인터페이스
│       │   │       ├── rule-based.ts       # 규칙 기반 (현재)
│       │   │       ├── ai-agent.ts         # AI Agent (준비)
│       │   │       └── index.ts            # 팩토리
│       │   ├── workers/             # Worker 인스턴스
│       │   ├── queues/              # 큐 정의
│       │   ├── lib/                 # Prisma, Redis 클라이언트
│       │   ├── config.ts            # 설정
│       │   └── index.ts             # 메인 엔트리
│       └── package.json
│
├── packages/
│   ├── database/                     # Prisma 스키마 및 클라이언트
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # 데이터베이스 스키마
│   │   │   └── migrations/          # 마이그레이션 파일
│   │   └── package.json
│   │
│   └── ui/                           # 공유 UI 컴포넌트 (shadcn/ui)
│       └── package.json
│
├── docs/                             # 검수 및 배포 문서
│   ├── google/                       # Google OAuth 검수
│   │   ├── OAUTH_VERIFICATION.md    # 검수 가이드
│   │   ├── SCOPE_JUSTIFICATION.md   # 스코프 사용 근거
│   │   └── DEMO_SCRIPT.md           # 시연 동영상 스크립트
│   │
│   ├── meta/                         # Meta App 검수
│   │   ├── APP_REVIEW.md            # 앱 검수 가이드
│   │   ├── PERMISSIONS.md           # 권한별 사용 근거
│   │   └── TEST_USERS.md            # 테스트 계정 가이드
│   │
│   ├── PRIVACY_POLICY.md             # 개인정보 처리방침
│   ├── DATA_DELETION.md              # 데이터 삭제 정책
│   ├── DEPLOYMENT.md                 # 배포 가이드 (Vercel + Railway)
│   ├── REVIEW_CHECKLIST.md           # 검수 최종 체크리스트
│   └── SUMMARY.md                    # 이 파일
│
├── infra/
│   └── docker/
│       └── docker-compose.yml        # 로컬 개발 (Postgres, Redis)
│
├── .env.example                      # 환경변수 템플릿
├── package.json                      # 루트 패키지 (pnpm workspace)
├── pnpm-workspace.yaml               # Workspace 설정
├── tsconfig.json                     # TypeScript 설정
├── turbo.json                        # Turborepo 설정 (선택)
└── README.md                         # 프로젝트 소개
```

---

## 🎯 핵심 아키텍처

### 1. Monorepo 구조 (pnpm workspace)
- **apps/**: 독립 실행 가능한 애플리케이션들
- **packages/**: 공유 라이브러리 및 코드

### 2. 백엔드 API (Express + Prisma)
```
Client → API Server → Database (PostgreSQL)
                   ↓
                 Redis (큐/캐시)
                   ↓
                 Worker (BullMQ)
```

### 3. 모더레이션 엔진 (Strategy Pattern)
```typescript
interface ModerationEngine {
  getName(): string;
  analyze(text, platform, rules): Promise<ModerationResult>;
}

// 현재 사용: RuleBasedEngine
// 미래 교체: AIAgentEngine (OpenAI GPT)
```

**교체 방법**:
```bash
# .env
MODERATION_ENGINE=ai-agent  # 'rule-based' → 'ai-agent'
OPENAI_API_KEY=sk-...

# Worker 재시작
pnpm --filter @app/worker dev
```

### 4. 큐 기반 비동기 처리
```
API Server → Queue → Worker

큐 종류:
1. comment-sync: 댓글 동기화
2. moderation: 자동 모더레이션
3. webhook-event: Webhook 이벤트 처리
```

---

## 🚀 로컬 실행 가이드

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 인프라 시작 (Docker)
```bash
cd infra/docker
docker compose up -d
```

### 3. 환경변수 설정
```bash
cp .env.example .env
# .env 파일 수정 (Google/Meta 키 입력)
```

### 4. 데이터베이스 마이그레이션
```bash
pnpm --filter @app/database migrate:dev
```

### 5. 개발 서버 실행
```bash
# 터미널 1: API 서버
pnpm --filter @app/api dev

# 터미널 2: Worker
pnpm --filter @app/worker dev

# 터미널 3: Web (프론트엔드)
pnpm --filter @app/web dev
```

### 6. 접속
- 웹: http://localhost:3000
- API: http://localhost:3001

---

## 📋 배포 가이드

### 추천 스택
- **Frontend**: Vercel (Next.js)
- **Backend API**: Railway
- **Worker**: Railway
- **Database**: Railway PostgreSQL
- **Redis**: Railway Redis

### 배포 순서
1. Railway에서 PostgreSQL + Redis 생성
2. API 서버 배포 (Railway)
3. Worker 배포 (Railway)
4. 프론트엔드 배포 (Vercel)
5. 도메인 연결
6. OAuth 리디렉션 URI 업데이트
7. Webhook URL 등록

상세 가이드: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 📄 검수 가이드

### Google OAuth 검수
1. [OAuth 검수 가이드](docs/google/OAUTH_VERIFICATION.md) 읽기
2. [스코프 사용 근거](docs/google/SCOPE_JUSTIFICATION.md) 준비
3. [시연 동영상 스크립트](docs/google/DEMO_SCRIPT.md) 따라 녹화
4. Google Cloud Console에서 검수 신청

### Meta App 검수
1. [앱 검수 가이드](docs/meta/APP_REVIEW.md) 읽기
2. [테스트 계정 가이드](docs/meta/TEST_USERS.md) 따라 환경 구축
3. [권한별 사용 근거](docs/meta/PERMISSIONS.md) 작성
4. 시연 동영상 제작
5. Meta Developers에서 검수 신청

### 최종 체크리스트
- [검수 최종 체크리스트](docs/REVIEW_CHECKLIST.md) - 제출 전 필수 확인!

---

## 🔧 주요 환경변수

### API 서버 (.env)
```bash
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Meta OAuth
META_APP_ID=...
META_APP_SECRET=...
META_REDIRECT_URI=http://localhost:3001/auth/meta/callback

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars

# Webhook
META_WEBHOOK_VERIFY_TOKEN=your-verify-token
WEBHOOK_PUBLIC_URL=https://your-ngrok-url.ngrok.io
```

### Worker (.env)
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Moderation Engine
MODERATION_ENGINE=rule-based  # 또는 'ai-agent'

# OpenAI (AI Agent 사용 시)
OPENAI_API_KEY=sk-...
```

### Web (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_AUTH_URL=http://localhost:3001/auth/google
NEXT_PUBLIC_META_AUTH_URL=http://localhost:3001/auth/meta
```

---

## 🎨 기술적 하이라이트

### 1. 교체 가능한 모더레이션 엔진
- **Strategy Pattern** 적용
- 런타임에 엔진 전환 가능
- OpenAI GPT로 쉽게 업그레이드

### 2. 효율적인 백그라운드 처리
- BullMQ로 안정적인 큐 관리
- 재시도 로직 내장
- 동시성 제어

### 3. 실시간 Webhook 처리
- Meta Webhook 5초 응답 보장
- 큐로 비동기 처리
- 자동 모더레이션 연동

### 4. 멀티테넌시 지원
- 사용자별 데이터 격리
- OAuth 토큰 암호화 저장
- 세션 기반 인증

---

## 📊 데이터베이스 스키마

### 주요 테이블
- `User`: 사용자 계정
- `GoogleAccount`: Google OAuth 정보
- `MetaAccount`: Meta OAuth 정보
- `YoutubeChannel`, `YoutubeComment`: YouTube 데이터
- `InstagramPage`, `InstagramMedia`, `InstagramComment`: Instagram 데이터
- `ModerationRule`: 모더레이션 규칙
- `AuditLog`: 감사 로그
- `WebhookLog`: Webhook 이벤트 로그

---

## 🧪 테스트 가이드

### 로컬 테스트
```bash
# API 테스트
curl http://localhost:3001/health

# YouTube OAuth 테스트
curl http://localhost:3001/auth/google

# Instagram OAuth 테스트
curl http://localhost:3001/auth/meta
```

### Webhook 테스트 (ngrok)
```bash
# ngrok 시작
ngrok http 3001

# Meta에 Webhook URL 등록
# https://your-ngrok-url.ngrok.io/webhooks/meta
```

---

## 🐛 문제 해결

### 1. OAuth 리디렉션 실패
- Google/Meta 콘솔에서 리디렉션 URI 확인
- HTTPS 사용 확인 (프로덕션)

### 2. Webhook 수신 안 됨
- Webhook URL이 공개 HTTPS인지 확인
- Verify Token 일치 확인
- ngrok 사용 시 URL 업데이트

### 3. Worker가 작업을 처리하지 않음
- Redis 연결 확인
- Worker 로그 확인
- 큐에 작업이 추가되었는지 확인

---

## 🔒 보안 고려사항

### 1. 토큰 관리
- OAuth 토큰 암호화 저장
- 리프레시 토큰으로 자동 갱신
- 만료된 토큰 정리

### 2. API 보안
- JWT 기반 인증
- CORS 설정
- Rate Limiting (필요 시)

### 3. 데이터 보호
- HTTPS 필수
- 데이터베이스 암호화
- 백업 전략

---

## 📈 향후 개선 사항

### 기능
- [ ] AI Agent 모더레이션 (OpenAI GPT)
- [ ] 댓글 통계 대시보드
- [ ] 여러 사용자 협업 기능
- [ ] 모바일 앱 (React Native)
- [ ] 더 많은 플랫폼 (Twitter, TikTok)

### 기술
- [ ] GraphQL API (선택)
- [ ] WebSocket 실시간 알림
- [ ] 캐싱 전략 (Redis)
- [ ] E2E 테스트 (Playwright)
- [ ] CI/CD 자동화 (GitHub Actions)

---

## 🙏 크레딧

### 사용된 주요 라이브러리
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [BullMQ](https://docs.bullmq.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Meta Graph API](https://developers.facebook.com/docs/graph-api)

---

## 📞 연락처

- 이메일: support@your-domain.com
- 문서: [GitHub Wiki](링크)
- 이슈: [GitHub Issues](링크)

---

## 📜 라이선스

MIT License

---

**프로젝트 완성을 축하합니다! 🎉**

이제 검수 신청하고 배포하면 됩니다!
