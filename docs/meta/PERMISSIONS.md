# Meta 권한별 사용 근거 (Permissions Justification)

## 📊 요청 권한 요약

| 권한 | 타입 | 사용 빈도 | 대안 가능 |
|------|------|-----------|-----------|
| `instagram_basic` | 읽기 | 높음 | ❌ No |
| `instagram_manage_comments` | 쓰기 | 높음 | ❌ No |
| `pages_show_list` | 읽기 | 중간 | ❌ No |
| `pages_read_engagement` | 읽기 | 높음 | ❌ No |
| `pages_manage_engagement` | 쓰기 | 높음 | ❌ No |
| `pages_manage_metadata` | 쓰기 | 낮음 | ❌ No |
| `business_management` | 읽기 | 중간 | ❌ No |

---

## 1️⃣ instagram_basic

### 권한 설명
Instagram 비즈니스 계정의 **기본 프로필 정보** 읽기

### 사용 목적
- 계정 식별
- 사용자명 표시
- 프로필 정보 표시

### 구체적 사용 사례

#### 1.1 계정 연결
**위치**: `/dashboard/instagram` → 페이지 선택

**API 호출**:
```
GET https://graph.facebook.com/v21.0/{ig-user-id}
  ?fields=id,username,name,profile_picture_url
  &access_token={token}
```

**코드 예시**:
```typescript
// apps/api/src/services/meta.ts
static async getInstagramAccount(pageAccessToken: string, igId: string) {
  const response = await axios.get(
    `https://graph.facebook.com/v21.0/${igId}`,
    {
      params: {
        fields: 'id,username,name,profile_picture_url',
        access_token: pageAccessToken,
      },
    }
  );
  return response.data;
}
```

**화면 예시**:
```
┌────────────────────────────┐
│ 연결된 계정                 │
├────────────────────────────┤
│ 📷 @your_brand             │
│    브랜드명                 │
│    IG ID: 123456789        │
└────────────────────────────┘
```

---

#### 1.2 대시보드 표시
**위치**: `/dashboard/instagram` → 상단 헤더

**화면**:
```
Social Comment Manager
━━━━━━━━━━━━━━━━━━━━━
현재 관리 중: @your_brand (Instagram)
```

---

### 없으면 안 되는 이유
- 계정 구분 불가능
- 여러 IG 계정 관리 시 혼란
- 사용자 경험 저하

---

## 2️⃣ instagram_manage_comments

### 권한 설명
Instagram 게시물의 **댓글 조회, 숨김, 삭제, 답글**

### 사용 목적
서비스의 **핵심 기능** - 댓글 관리

### 구체적 사용 사례

#### 2.1 댓글 조회
**위치**: `/dashboard/instagram` → 게시물 선택 → 댓글 목록

**API 호출**:
```
GET https://graph.facebook.com/v21.0/{media-id}/comments
  ?fields=id,text,username,timestamp,like_count,hidden
  &access_token={token}
```

**코드 예시**:
```typescript
static async getMediaComments(pageAccessToken: string, mediaId: string) {
  const response = await axios.get(
    `https://graph.facebook.com/v21.0/${mediaId}/comments`,
    {
      params: {
        fields: 'id,text,username,timestamp,like_count,hidden,replies{id,text}',
        access_token: pageAccessToken,
      },
    }
  );
  return response.data.data;
}
```

---

#### 2.2 댓글 숨김
**위치**: 댓글 목록 → [숨김] 버튼

**API 호출**:
```
POST https://graph.facebook.com/v21.0/{comment-id}
  ?hide=true
  &access_token={token}
```

**코드 예시**:
```typescript
static async hideComment(pageAccessToken: string, commentId: string) {
  await axios.post(
    `https://graph.facebook.com/v21.0/${commentId}`,
    {},
    {
      params: {
        hide: true,
        access_token: pageAccessToken,
      },
    }
  );
}
```

**화면 플로우**:
```
1. 사용자가 스팸 댓글 발견
   "구매하세요! bit.ly/xxxx"

2. [숨김] 버튼 클릭

3. 확인 팝업
   "이 댓글을 숨기시겠습니까?"
   [취소] [확인]

4. API 호출 → 성공

5. 댓글 상태 업데이트
   ✓ 숨김 처리됨
```

---

#### 2.3 댓글 삭제
**위치**: 댓글 목록 → [삭제] 버튼

**API 호출**:
```
DELETE https://graph.facebook.com/v21.0/{comment-id}
  ?access_token={token}
```

**코드 예시**:
```typescript
static async deleteComment(pageAccessToken: string, commentId: string) {
  await axios.delete(
    `https://graph.facebook.com/v21.0/${commentId}`,
    {
      params: {
        access_token: pageAccessToken,
      },
    }
  );
}
```

---

#### 2.4 댓글 답글
**위치**: 댓글 목록 → [답글] 버튼

**API 호출**:
```
POST https://graph.facebook.com/v21.0/{comment-id}/replies
  ?message={reply_text}
  &access_token={token}
```

**코드 예시**:
```typescript
static async replyToComment(
  pageAccessToken: string,
  commentId: string,
  message: string
) {
  await axios.post(
    `https://graph.facebook.com/v21.0/${commentId}/replies`,
    {},
    {
      params: {
        message,
        access_token: pageAccessToken,
      },
    }
  );
}
```

---

### 없으면 안 되는 이유
- **핵심 기능** 완전 불가능
- 대안 권한 없음
- 서비스 존재 이유

---

## 3️⃣ pages_show_list

### 권한 설명
사용자가 관리하는 **Facebook 페이지 목록** 조회

### 사용 목적
Instagram 비즈니스 계정이 연결된 페이지 선택

### 구체적 사용 사례

#### 3.1 페이지 목록 조회
**위치**: `/dashboard/instagram` → 페이지 선택

**API 호출**:
```
GET https://graph.facebook.com/v21.0/me/accounts
  ?fields=id,name,access_token,instagram_business_account
  &access_token={user_token}
```

**코드 예시**:
```typescript
static async getUserPages(accessToken: string) {
  const response = await axios.get(
    'https://graph.facebook.com/v21.0/me/accounts',
    {
      params: {
        fields: 'id,name,access_token,instagram_business_account',
        access_token: accessToken,
      },
    }
  );
  return response.data.data;
}
```

**화면**:
```
┌─────────────────────────────┐
│ 관리할 페이지 선택           │
├─────────────────────────────┤
│ ○ 브랜드 A (Instagram 연결)  │
│ ○ 브랜드 B (Instagram 연결)  │
│ ○ 개인 페이지 (연결 안됨)    │
└─────────────────────────────┘
```

---

### 없으면 안 되는 이유
- Instagram 비즈니스 계정은 **반드시 Facebook 페이지를 통해** 접근
- 페이지 없이는 IG 접근 불가능
- Meta API 구조상 필수

---

## 4️⃣ pages_read_engagement

### 권한 설명
페이지의 **참여 데이터** (댓글, 좋아요 등) 읽기

### 사용 목적
댓글 통계 및 분석

### 구체적 사용 사례

#### 4.1 댓글 통계
**위치**: `/dashboard/instagram` → 통계 대시보드

**API 호출**:
```
GET https://graph.facebook.com/v21.0/{media-id}/insights
  ?metric=comments_count
  &access_token={token}
```

**화면**:
```
┌─────────────────────────┐
│ 댓글 통계                │
├─────────────────────────┤
│ 총 댓글: 1,234          │
│ 숨김: 45                │
│ 삭제: 12                │
└─────────────────────────┘
```

---

### 없으면 안 되는 이유
- 댓글 메타데이터 (좋아요 수 등) 필요
- 통계 기능 제공 불가
- 사용자 경험 개선

---

## 5️⃣ pages_manage_engagement

### 권한 설명
페이지의 **참여 관리** (댓글 숨김, 삭제 등)

### 사용 목적
댓글에 대한 **관리 액션 실행**

### 구체적 사용 사례
`instagram_manage_comments`와 함께 작동하여 실제 관리 액션 허용

**필요한 이유**:
- 페이지 수준의 관리 권한 필요
- Instagram은 페이지를 통해 관리되므로 필수

---

## 6️⃣ pages_manage_metadata

### 권한 설명
페이지의 **Webhook 구독/해제**

### 사용 목적
실시간 댓글 알림 설정

### 구체적 사용 사례

#### 6.1 Webhook 구독
**위치**: `/dashboard/instagram/settings` → Webhook 설정

**API 호출**:
```
POST https://graph.facebook.com/v21.0/{page-id}/subscribed_apps
  ?subscribed_fields=comments,mentions
  &access_token={page_token}
```

**코드 예시**:
```typescript
static async subscribePageWebhook(
  pageAccessToken: string,
  pageId: string
) {
  await axios.post(
    `https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`,
    {},
    {
      params: {
        subscribed_fields: 'comments,mentions',
        access_token: pageAccessToken,
      },
    }
  );
}
```

**화면**:
```
┌─────────────────────────────┐
│ Webhook 설정                 │
├─────────────────────────────┤
│ 상태: ✓ 활성                 │
│ 구독 이벤트:                 │
│   ✓ 댓글                     │
│   ✓ 멘션                     │
│                              │
│ [구독 해제]                  │
└─────────────────────────────┘
```

---

#### 6.2 실시간 알림 플로우
```
1. 누군가 Instagram에 댓글 작성
2. Meta가 Webhook으로 알림 전송
3. 우리 서버가 수신
4. Worker가 자동 모더레이션 실행
5. 필요 시 자동 숨김/삭제
```

---

### 없으면 안 되는 이유
- 실시간 알림 불가능
- 수동 동기화만 가능 → 비효율적
- 빠른 대응 필요한 상황에서 치명적

---

## 7️⃣ business_management

### 권한 설명
**비즈니스 자산** (페이지, IG 계정 등) 접근

### 사용 목적
비즈니스 계정 관리 및 토큰 교환

### 구체적 사용 사례

#### 7.1 장기 토큰 교환
**코드 예시**:
```typescript
// Short-lived token → Long-lived token
static async exchangeForLongLivedToken(shortToken: string) {
  const response = await axios.get(
    'https://graph.facebook.com/v21.0/oauth/access_token',
    {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        fb_exchange_token: shortToken,
      },
    }
  );
  return response.data; // 60일 유효
}
```

---

### 없으면 안 되는 이유
- 비즈니스 계정 필수
- 개인 계정으로는 댓글 관리 불가
- Meta API 구조상 필수

---

## 📸 권한 사용 증거 (스크린샷 가이드)

### 각 권한마다 2-3장 필요

#### instagram_manage_comments
1. 댓글 목록 (조회)
2. 댓글 숨김 전/후
3. 댓글 삭제 확인

#### pages_manage_metadata
1. Webhook 설정 화면
2. 구독 확인 화면
3. 실시간 이벤트 수신 로그

---

## 🚫 요청하지 않는 권한

### 제외한 권한들
- ❌ `ads_management` (광고 불필요)
- ❌ `instagram_shopping_tag_products` (쇼핑 불필요)
- ❌ `pages_manage_posts` (게시물 작성 불필요)

### 이유
- 최소 권한 원칙
- 사용자 신뢰 확보
- 검수 통과 확률 증가

---

## ✅ 검수 팁

### 명확한 설명
- "이 권한으로 무엇을 하는가?"
- "왜 필요한가?"
- "대안이 없는가?"

### 시연 동영상
- 각 권한을 **실제로 사용**하는 장면
- Instagram 앱에서도 **변경 확인**

### API 호출 로그
- 검수자가 요청하면 API 호출 로그 제공 가능
- 어떤 엔드포인트를 언제 호출하는지 증명

---

## 📋 제출 서식 예시

Meta 검수 신청서에 다음과 같이 작성:

```
Permission: instagram_manage_comments

Use Case:
Our app allows business owners to efficiently manage Instagram comments.

Specific Features:
1. View comments: Display all comments in a centralized dashboard
2. Hide comments: Hide spam or inappropriate comments
3. Delete comments: Remove severe policy violations
4. Reply to comments: Respond to customer inquiries

User Flow:
1. User logs in at https://your-domain.com/login
2. Connects Instagram Business account
3. Navigates to Dashboard > Instagram > Comments
4. Views comment list (READ permission used)
5. Clicks [Hide] button on a spam comment (WRITE permission used)
6. Comment is hidden on Instagram (verified in Instagram app)

API Endpoints Used:
- GET /{media-id}/comments (read)
- POST /{comment-id}?hide=true (write)
- DELETE /{comment-id} (write)
- POST /{comment-id}/replies (write)

Alternative:
There is no alternative permission that provides this functionality.
Without this permission, core features of our app cannot function.
```

---

## 🔗 참고 자료

- [Instagram Platform Permissions](https://developers.facebook.com/docs/instagram-platform/overview)
- [Graph API Reference](https://developers.facebook.com/docs/graph-api)
- [Webhook Reference](https://developers.facebook.com/docs/graph-api/webhooks)
