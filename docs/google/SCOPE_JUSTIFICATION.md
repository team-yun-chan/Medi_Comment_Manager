# Google OAuth 스코프 사용 근거

## 📊 요청 스코프 목록

| 스코프 | 필수 여부 | 주요 기능 |
|--------|-----------|-----------|
| `youtube.force-ssl` | 필수 | 댓글 삭제, 숨김, 답글 |
| `youtube.readonly` | 필수 | 채널/비디오/댓글 조회 |
| `openid` | 필수 | 사용자 인증 |
| `email` | 필수 | 계정 식별 |
| `profile` | 필수 | 사용자 이름 표시 |

---

## 1️⃣ youtube.force-ssl

### 사용 목적
YouTube 댓글에 대한 **쓰기 권한** (삭제, 숨김, 답글 등)

### 구체적 사용 사례

#### 1.1 댓글 삭제
**위치**: `/dashboard/youtube` → 댓글 목록 → [삭제] 버튼

**코드 예시**:
```typescript
// apps/api/src/services/google.ts
static async deleteComment(accessToken: string, commentId: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  await youtube.comments.delete({ id: commentId });
}
```

**API 호출**:
```
DELETE https://www.googleapis.com/youtube/v3/comments
  ?id={commentId}
  &access_token={token}
```

**화면 흐름**:
1. 사용자가 댓글 목록에서 부적절한 댓글 발견
2. [삭제] 버튼 클릭
3. 확인 팝업 → "삭제하시겠습니까?"
4. 확인 → API 호출 → 댓글 삭제
5. 목록에서 제거 확인

---

#### 1.2 댓글 답글
**위치**: `/dashboard/youtube` → 댓글 목록 → [답글] 버튼

**코드 예시**:
```typescript
static async replyToComment(
  accessToken: string,
  parentId: string,
  text: string
) {
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  await youtube.comments.insert({
    part: ['snippet'],
    requestBody: {
      snippet: {
        parentId,
        textOriginal: text,
      },
    },
  });
}
```

**API 호출**:
```
POST https://www.googleapis.com/youtube/v3/comments
  ?part=snippet
  
Body:
{
  "snippet": {
    "parentId": "xyz123",
    "textOriginal": "답글 내용"
  }
}
```

---

#### 1.3 댓글 숨김/보류
**위치**: `/dashboard/youtube` → 댓글 목록 → [숨김] 버튼

**코드 예시**:
```typescript
static async setModerationStatus(
  accessToken: string,
  commentId: string,
  status: 'heldForReview' | 'published'
) {
  await youtube.comments.setModerationStatus({
    id: [commentId],
    moderationStatus: status,
  });
}
```

---

### 없으면 안 되는 이유
- 댓글 관리 서비스의 **핵심 기능**
- 읽기 전용 권한으로는 관리 불가능
- 사용자가 명시적으로 요청한 기능

---

## 2️⃣ youtube.readonly

### 사용 목적
YouTube 데이터 **읽기** (채널, 비디오, 댓글 조회)

### 구체적 사용 사례

#### 2.1 채널 목록 조회
**위치**: `/dashboard/youtube` → 채널 선택

**코드 예시**:
```typescript
static async getMyChannels(accessToken: string) {
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const response = await youtube.channels.list({
    part: ['snippet', 'contentDetails', 'statistics'],
    mine: true,
  });
  return response.data.items;
}
```

**API 호출**:
```
GET https://www.googleapis.com/youtube/v3/channels
  ?part=snippet,contentDetails,statistics
  &mine=true
```

---

#### 2.2 비디오 목록 조회
**위치**: `/dashboard/youtube` → 채널 선택 → 비디오 목록

**코드 예시**:
```typescript
static async getChannelVideos(
  accessToken: string,
  channelId: string
) {
  const response = await youtube.search.list({
    part: ['snippet'],
    channelId,
    maxResults: 50,
    order: 'date',
    type: ['video'],
  });
  return response.data.items;
}
```

---

#### 2.3 댓글 목록 조회
**위치**: `/dashboard/youtube` → 비디오 선택 → 댓글 목록

**코드 예시**:
```typescript
static async getVideoComments(
  accessToken: string,
  videoId: string
) {
  const response = await youtube.commentThreads.list({
    part: ['snippet', 'replies'],
    videoId,
    maxResults: 100,
  });
  return response.data.items;
}
```

---

### 없으면 안 되는 이유
- 댓글을 조회해야 관리 대상 선택 가능
- 채널/비디오 정보 필수
- 서비스의 **기본 기능**

---

## 3️⃣ openid, email, profile

### 사용 목적
사용자 **인증 및 식별**

### 구체적 사용 사례

#### 3.1 로그인 및 계정 생성
**위치**: `/login` → "YouTube로 시작하기"

**코드 예시**:
```typescript
// 사용자 정보 가져오기
const userInfo = await GoogleService.getUserInfo(accessToken);
// { id, email, name, picture }

// DB에 저장
const user = await prisma.user.create({
  data: {
    email: userInfo.email,
    name: userInfo.name,
  },
});
```

---

#### 3.2 대시보드 사용자 표시
**위치**: `/dashboard` → 사이드바 상단

**화면 예시**:
```
┌─────────────────────┐
│ 홍길동               │
│ hong@example.com    │
└─────────────────────┘
```

---

#### 3.3 계정 구분 및 권한 관리
- 여러 사용자가 동일 서비스 사용
- 각 사용자의 YouTube 채널 데이터 분리
- 권한별 기능 접근 제어

---

### 없으면 안 되는 이유
- 사용자 구분 불가능
- 멀티테넌트 서비스 운영 불가
- 보안 및 개인정보 보호 필수

---

## 📸 스코프 사용 증거 (스크린샷)

### 1. OAuth 동의 화면
```
┌─────────────────────────────────────┐
│ Social Comment Manager              │
│ wants to access your Google Account│
│                                     │
│ ✓ View your YouTube account         │
│ ✓ Manage your YouTube comments      │
│ ✓ See your email address            │
│                                     │
│ [Cancel]  [Allow]                   │
└─────────────────────────────────────┘
```

### 2. 댓글 삭제 화면
```
[댓글 목록]
┌──────────────────────────────────────┐
│ 홍길동: 스팸 댓글입니다 🚫            │
│ [숨김] [삭제] [답글]                 │ ← youtube.force-ssl
└──────────────────────────────────────┘
```

### 3. 채널 목록 화면
```
[내 채널]                              ← youtube.readonly
- 테크 리뷰 채널 (구독자 10K)
- 게임 방송 채널 (구독자 5K)
```

---

## 🎯 최소 권한 원칙

### 요청하지 않는 스코프
- ❌ `youtube.upload` (동영상 업로드 불필요)
- ❌ `youtube.channel-memberships.creator` (멤버십 불필요)
- ❌ `youtube.partner` (파트너 기능 불필요)

### 이유
- **필요한 기능만 요청**하여 사용자 신뢰 확보
- Google 검수 통과 용이
- 보안 위험 최소화

---

## 📋 검수 팁

### 명확한 설명
각 스코프가 **어디서, 왜, 어떻게** 사용되는지 명시

### 시연 동영상
각 스코프를 실제로 사용하는 장면 포함

### 대안 없음 강조
- 댓글 삭제는 `youtube.force-ssl` 없이 불가능
- 댓글 조회는 `youtube.readonly` 없이 불가능

---

## ✅ 체크리스트

- [ ] 모든 스코프의 사용 화면 캡처
- [ ] API 호출 코드 준비
- [ ] 시연 동영상에 스코프 사용 명확히 표시
- [ ] 대안이 없음을 설명
- [ ] 최소 권한 원칙 준수 확인
