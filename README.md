# 🎯 Social Comment SaaS

YouTube + Instagram 통합 댓글 관리 플랫폼

## 🚀 기능

- ✅ Google OAuth (YouTube API 연동)
- ✅ Meta OAuth (Instagram Graph API 연동)
- ✅ 댓글 조회/삭제/숨김/답글
- ✅ 규칙 기반 자동 모더레이션
- ✅ Webhook 실시간 댓글 수신
- ✅ 감사 로그 (Audit Log)

## 📦 기술 스택

### Backend
- **Node.js** + **TypeScript**
- **Express** (API 서버)
- **Prisma** (ORM)
- **PostgreSQL** (데이터베이스)
- **Redis** (큐/캐시)
- **BullMQ** (백그라운드 작업)

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS**
- **shadcn/ui**

### APIs
- **Google YouTube Data API v3**
- **Meta Graph API v21.0**

## 🛠️ 개발 환경 설정

### 1. 사전 요구사항

```bash
node >= 20
pnpm >= 9
docker
```

### 2. 저장소 클론

```bash
git clone <repository-url>
cd social-comment-saas
```

### 3. 환경변수 설정

```bash
cp .env.example .env
# .env 파일을 열어서 필요한 값 입력
```

#### 필수 환경변수

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `META_APP_ID` / `META_APP_SECRET`
- `WEB_JWT_SECRET` (32자 이상)
- `DATABASE_URL`
- `REDIS_URL`

### 4. 패키지 설치

```bash
pnpm install
```

### 5. 데이터베이스 시작

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

### 6. 데이터베이스 마이그레이션

```bash
pnpm db:push
```

### 7. 개발 서버 실행

```bash
# 전체 실행
pnpm dev

# 개별 실행
pnpm --filter @app/api dev      # API 서버 (포트 4000)
pnpm --filter @app/web dev       # 웹 앱 (포트 3000)
pnpm --filter @app/worker dev    # 워커
```

## 📡 API 엔드포인트

### 인증
```
GET  /auth/google/login       - Google OAuth 시작
GET  /auth/google/callback    - Google OAuth 콜백
GET  /auth/meta/login         - Meta OAuth 시작
GET  /auth/meta/callback      - Meta OAuth 콜백
GET  /auth/me                 - 현재 사용자 정보
```

### YouTube
```
GET    /youtube/channels           - 채널 목록
POST   /youtube/channels/sync      - 채널 동기화
GET    /youtube/videos             - 비디오 목록
GET    /youtube/comments           - 댓글 목록 (DB)
POST   /youtube/comments/sync      - 댓글 동기화 (API)
DELETE /youtube/comments/:id       - 댓글 삭제
POST   /youtube/comments/:id/reply - 댓글 답글
```

### Instagram
```
GET    /instagram/pages                - 페이지 목록
POST   /instagram/pages/sync           - 페이지 동기화
GET    /instagram/media                - 미디어 목록
GET    /instagram/comments             - 댓글 목록 (DB)
POST   /instagram/comments/sync        - 댓글 동기화 (API)
POST   /instagram/comments/:id/hide    - 댓글 숨김
POST   /instagram/comments/:id/unhide  - 댓글 숨김 해제
DELETE /instagram/comments/:id         - 댓글 삭제
POST   /instagram/comments/:id/reply   - 댓글 답글
POST   /instagram/pages/:id/subscribe  - Webhook 구독
```

### Moderation
```
GET    /moderation/rules            - 규칙 목록
POST   /moderation/rules            - 규칙 생성
PATCH  /moderation/rules/:id        - 규칙 수정
DELETE /moderation/rules/:id        - 규칙 삭제
POST   /moderation/simulate         - 규칙 테스트
GET    /moderation/actions          - 액션 히스토리
GET    /moderation/stats            - 통계
```

### Webhooks
```
GET  /webhooks/meta       - Webhook 검증
POST /webhooks/meta       - Webhook 이벤트 수신
GET  /webhooks/meta/logs  - Webhook 로그
```

## 🔐 OAuth 설정

### Google Cloud Console

1. 프로젝트 생성
2. YouTube Data API v3 활성화
3. OAuth 클라이언트 생성 (웹 애플리케이션)
4. 승인된 리디렉션 URI: `http://localhost:4000/auth/google/callback`
5. 스코프:
   - `youtube.force-ssl`
   - `youtube.readonly`
   - `openid`, `email`, `profile`

### Meta App Dashboard

1. 앱 생성
2. Instagram Basic Display 추가
3. OAuth 리디렉션 URI: `http://localhost:4000/auth/meta/callback`
4. 권한:
   - `instagram_basic`
   - `instagram_manage_comments`
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_engagement`
   - `pages_manage_metadata`
   - `business_management`

## 🧪 Webhook 테스트

ngrok 사용:

```bash
ngrok http 4000

# .env에 ngrok URL 추가
WEBHOOK_PUBLIC_URL=https://your-ngrok-url.ngrok.io
```

Meta Webhook 설정:
- URL: `https://your-ngrok-url.ngrok.io/webhooks/meta`
- Verify Token: `.env`의 `META_APP_VERIFY_TOKEN`
- 구독 필드: `comments`, `mentions`

## 📊 데이터베이스 스키마

주요 테이블:
- `User` - 사용자
- `Account` - OAuth 계정 (Google/Meta)
- `YoutubeChannel` / `YoutubeVideo` / `YoutubeComment`
- `InstagramPage` / `InstagramMedia` / `InstagramComment`
- `ModerationRule` / `ModerationAction`
- `AuditLog` / `WebhookLog`

## 🐛 트러블슈팅

### Prisma 에러
```bash
pnpm db:push
pnpm --filter @repo/db prisma generate
```

### OAuth 리디렉션 에러
- Google/Meta 콘솔에서 리디렉션 URI 확인
- `.env`의 `GOOGLE_REDIRECT_URI` / `META_REDIRECT_URI` 확인

### Webhook 수신 안됨
- ngrok URL 확인
- Meta 대시보드에서 Webhook 구독 상태 확인
- `/webhooks/meta/logs` 엔드포인트로 로그 확인

## 🔧 Worker (BullMQ)

### 큐 목록
- **comment-sync**: 댓글 동기화 (YouTube/Instagram)
- **moderation**: 자동 모더레이션 (규칙 기반 or AI)
- **webhook-event**: Webhook 이벤트 처리

### 모더레이션 엔진
현재: **Rule-Based Engine** (키워드, 정규식, 스팸)

교체 가능: **AI Agent Engine** (OpenAI GPT)
```bash
# .env
OPENAI_API_KEY=sk-your-key
MODERATION_ENGINE=ai-agent
```

## 🎨 프론트엔드 페이지

### 인증
- `/login` - 통합 로그인 페이지
- `/auth/callback` - OAuth 콜백 처리

### 대시보드
- `/dashboard` - 홈 (통계 + 빠른 시작)
- `/dashboard/youtube` - YouTube 댓글 관리
- `/dashboard/instagram` - Instagram 댓글 관리
- `/dashboard/moderation` - 자동 관리 규칙
- `/dashboard/settings` - 계정 설정

## 🚀 실행 방법

### 1. 전체 개발 서버 실행
```bash
# 루트에서
pnpm dev
```

### 2. 개별 실행
```bash
# API 서버
cd apps/api
pnpm dev

# 웹 앱
cd apps/web
pnpm dev
```

### 3. 접속
- Web: http://localhost:3000
- API: http://localhost:4000

## 📝 다음 단계

- [x] 백엔드 API 구현
- [x] 프론트엔드 구현 (Next.js + shadcn/ui)
- [x] BullMQ 워커 구현 (교체 가능한 모더레이션 엔진)
- [x] 검수 문서 작성 (Google/Meta)
- [ ] 배포 (Vercel + Railway)

---

## 📄 검수 문서

### Google OAuth 검수
- [검수 가이드](docs/google/OAUTH_VERIFICATION.md)
- [스코프 사용 근거](docs/google/SCOPE_JUSTIFICATION.md)
- [시연 동영상 스크립트](docs/google/DEMO_SCRIPT.md)

### Meta App 검수
- [앱 검수 가이드](docs/meta/APP_REVIEW.md)
- [권한 사용 근거](docs/meta/PERMISSIONS.md)
- [테스트 계정 가이드](docs/meta/TEST_USERS.md)

### 공통 정책
- [개인정보 처리방침](docs/PRIVACY_POLICY.md)
- [데이터 삭제 정책](docs/DATA_DELETION.md)

### 배포
- [배포 가이드](docs/DEPLOYMENT.md)

---

## ✅ 검수 제출 체크리스트

### Google OAuth 검수
- [ ] OAuth 동의 화면 정보 작성
- [ ] 스코프 설정 (youtube.force-ssl, youtube.readonly)
- [ ] 리디렉션 URI 등록
- [ ] 개인정보 처리방침 URL 등록
- [ ] 데이터 삭제 정책 URL 등록
- [ ] 시연 동영상 제작 (3-5분)
- [ ] 스코프별 사용 근거 작성
- [ ] 검수 신청서 제출

### Meta App 검수
- [ ] 앱 기본 정보 작성 (이름, 아이콘, 설명)
- [ ] 개인정보 처리방침 URL 등록
- [ ] 서비스 약관 URL 등록
- [ ] 데이터 삭제 정책 URL 등록
- [ ] OAuth 리디렉션 URI 등록
- [ ] Webhook URL 등록 및 검증
- [ ] 테스트 계정 준비 (Facebook 페이지 + Instagram)
- [ ] 테스트 게시물 작성 (3개 이상)
- [ ] 테스트 댓글 작성 (각 5개 이상)
- [ ] 시연 동영상 제작 (3-5분)
- [ ] 권한별 사용 근거 작성
- [ ] 단계별 지침서 작성
- [ ] 스크린샷 준비 (권한당 2-3장)
- [ ] 테스트 계정 자격 증명 문서 작성
- [ ] 검수 신청서 제출

---

## 📄 라이선스

MIT
