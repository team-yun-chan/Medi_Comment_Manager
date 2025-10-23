# Meta App Review 가이드

## 📋 개요

**앱 이름**: Social Comment Manager  
**앱 타입**: Business  
**카테고리**: Business Tools  
**목적**: Instagram 댓글 관리 및 모더레이션 서비스

---

## 🔑 요청 권한 (Permissions)

### 필수 권한

| 권한 | 용도 | 검수 필요 |
|------|------|-----------|
| `instagram_basic` | 기본 프로필 정보 | ✅ Yes |
| `instagram_manage_comments` | 댓글 관리 | ✅ Yes |
| `pages_show_list` | 페이지 목록 조회 | ✅ Yes |
| `pages_read_engagement` | 댓글 통계 조회 | ✅ Yes |
| `pages_manage_engagement` | 댓글 숨김/삭제 | ✅ Yes |
| `pages_manage_metadata` | Webhook 구독 | ✅ Yes |
| `business_management` | 비즈니스 자산 접근 | ✅ Yes |

### 선택 권한 (미래 확장)
- `instagram_manage_messages` (DM 관리)
- `pages_read_user_content` (고급 분석)

---

## 📱 앱 설정

### 1. 기본 정보
```
앱 이름: Social Comment Manager
카테고리: Business Tools
설명: Instagram 댓글을 효율적으로 관리하고 자동 모더레이션하는 서비스

앱 아이콘: 512x512px PNG (투명 배경)
개인정보 처리방침: https://your-domain.com/privacy
서비스 약관: https://your-domain.com/terms
```

### 2. 연락처
```
지원 이메일: support@your-domain.com
웹사이트: https://your-domain.com
```

### 3. OAuth 리디렉션
```
Valid OAuth Redirect URIs:
  https://your-domain.com/auth/callback
  https://api.your-domain.com/auth/meta/callback
```

### 4. Webhook 설정
```
Callback URL: https://api.your-domain.com/webhooks/meta
Verify Token: your-verify-token-here

구독 필드:
  ✅ comments
  ✅ mentions
```

---

## 🎬 검수 제출 요구사항

### 1. 테스트 계정
Meta는 **2개의 테스트 계정**을 요구합니다:

#### 계정 1: 비즈니스 관리자 (Admin)
```
역할: 페이지 관리자
필요 자산:
  - Facebook 페이지 1개
  - Instagram 비즈니스 계정 1개
  - 게시물 3개 이상
  - 각 게시물에 댓글 5개 이상
```

#### 계정 2: 일반 사용자 (Commenter)
```
역할: 댓글 작성자
액션:
  - 계정 1의 게시물에 댓글 작성
  - 테스트용 멘션 작성
```

### 2. 시연 동영상
**필수 요소**:
- 길이: 3-5분
- 해상도: 1280x720 이상
- 형식: MP4, WebM
- 업로드: YouTube (Unlisted) 또는 Vimeo

**포함 내용**:
1. ✅ 로그인 플로우 (OAuth)
2. ✅ 권한 동의 화면
3. ✅ 페이지 연결
4. ✅ Instagram 계정 연결
5. ✅ 댓글 목록 조회
6. ✅ 댓글 숨김 기능
7. ✅ 댓글 삭제 기능
8. ✅ 댓글 답글 기능
9. ✅ Webhook 구독 설정
10. ✅ 실시간 댓글 수신 확인

### 3. 단계별 지침서
**제출 양식**에 각 권한별 사용법을 상세히 작성:

```markdown
# instagram_manage_comments 사용법

1. https://your-domain.com/login 접속
2. "Instagram으로 시작하기" 클릭
3. 테스트 계정으로 로그인
4. 권한 승인
5. 대시보드 > Instagram 메뉴
6. 페이지 선택
7. 게시물 선택
8. 댓글 목록에서 [숨김] 버튼 클릭
9. 확인
10. Instagram 앱에서 댓글이 숨겨졌는지 확인
```

---

## 📸 스크린샷 요구사항

Meta는 각 권한마다 **2-3장의 스크린샷** 요구:

### 1. instagram_basic
- 로그인 후 대시보드
- 프로필 정보 표시

### 2. instagram_manage_comments
- 댓글 목록 화면
- 댓글 숨김 전
- 댓글 숨김 후

### 3. pages_show_list
- 페이지 선택 화면

### 4. pages_manage_engagement
- 댓글 액션 버튼
- 삭제 확인 팝업

### 5. pages_manage_metadata
- Webhook 구독 설정 화면
- 구독 상태 확인

---

## ⚠️ 검수 거부 사유 (자주 발생)

### 1. 테스트 계정 문제
- ❌ 페이지/IG 계정 미연결
- ❌ 게시물 없음
- ❌ 댓글 없음

**해결**: 완전히 설정된 테스트 환경 준비

### 2. 동영상 불명확
- ❌ 권한 사용 화면 누락
- ❌ 화질 낮음
- ❌ 너무 빠른 화면 전환

**해결**: 상세한 시연 스크립트 준비

### 3. 권한 과다 요청
- ❌ 사용하지 않는 권한 요청
- ❌ 권한 사용 근거 불명확

**해결**: 필요한 권한만 요청, 각 권한의 사용처 명확히 설명

### 4. 개인정보 처리방침 미흡
- ❌ 데이터 삭제 정책 누락
- ❌ 제3자 공유 정보 누락
- ❌ 데이터 보관 기간 명시 안 됨

**해결**: Meta 가이드라인에 맞춰 작성

---

## 📝 검수 신청서 작성 팁

### 1. 앱 설명 (App Description)
```
Social Comment Manager는 Instagram 비즈니스 계정의 댓글을 효율적으로 
관리할 수 있는 도구입니다. 

주요 기능:
- 여러 계정의 댓글을 한 곳에서 관리
- 키워드 기반 자동 모더레이션
- 부적절한 댓글 자동 숨김/삭제
- 실시간 댓글 알림 (Webhook)
- 대량 댓글 일괄 처리

대상 사용자:
- 소셜 미디어 관리자
- 브랜드 커뮤니티 매니저
- 인플루언서
- 디지털 마케팅 에이전시
```

### 2. 권한별 사용 근거 (Justification)

**instagram_manage_comments**:
```
이 권한은 서비스의 핵심 기능인 댓글 관리를 위해 필수입니다.

사용 사례:
1. 댓글 조회: 사용자가 관리할 댓글 목록 표시
2. 댓글 숨김: 스팸이나 부적절한 댓글 숨김
3. 댓글 삭제: 심각한 규정 위반 댓글 삭제
4. 댓글 답글: 고객 문의에 답변

화면: 대시보드 > Instagram > 댓글 관리
API: GET/POST/DELETE /{ig-media-id}/comments
```

**pages_manage_metadata**:
```
Webhook 실시간 알림을 위해 필요합니다.

사용 사례:
1. Webhook 구독: 새 댓글 실시간 알림
2. 구독 해제: 사용자가 알림 끄기
3. 구독 상태 확인: 현재 알림 설정 확인

화면: 설정 > Webhook 관리
API: POST /{page-id}/subscribed_apps
```

---

## ⏱️ 검수 타임라인

### 일반적인 소요 시간
- **초기 검수**: 5-10 영업일
- **재검수** (수정 후): 3-5 영업일
- **심층 검토** (복잡한 권한): 2주 이상

### 검수 상태

1. **Pending Review** (검토 대기)
   - 제출 완료, 검수 대기 중

2. **In Review** (검토 중)
   - 검수팀이 앱 테스트 중

3. **Additional Information Required** (추가 정보 필요)
   - 메타가 질문하거나 추가 자료 요청
   - 7일 이내 응답 필요

4. **Approved** (승인)
   - 즉시 프로덕션 사용 가능

5. **Rejected** (거부)
   - 사유 확인 후 수정하여 재제출

---

## 🔄 재제출 프로세스

### 거부된 경우
1. 거부 사유 상세 확인
2. 해당 부분 수정
3. 새 시연 동영상 제작 (필요시)
4. 응답 메시지 작성:
   ```
   We have addressed the following issues:
   1. Improved video quality and added clear demonstrations
   2. Provided detailed step-by-step instructions
   3. Added missing screenshots for permission X
   4. Updated privacy policy with data deletion process
   ```
5. 재제출

---

## ✅ 제출 전 체크리스트

### 앱 설정
- [ ] 앱 이름, 아이콘, 설명 완성
- [ ] 개인정보 처리방침 URL 유효
- [ ] 서비스 약관 URL 유효
- [ ] OAuth 리디렉트 URI 등록
- [ ] Webhook URL 등록 및 검증 완료

### 테스트 계정
- [ ] 관리자 계정 준비
  - [ ] Facebook 페이지 생성
  - [ ] Instagram 비즈니스 계정 연결
  - [ ] 게시물 3개 이상
  - [ ] 각 게시물에 댓글 5개 이상
- [ ] 댓글 작성자 계정 준비
- [ ] 테스트 계정 자격 증명 문서 작성

### 시연 자료
- [ ] 시연 동영상 제작 (3-5분)
- [ ] 각 권한 사용 화면 포함
- [ ] 동영상 업로드 (YouTube/Vimeo)
- [ ] 스크린샷 준비 (권한당 2-3장)

### 문서
- [ ] 단계별 지침서 작성
- [ ] 권한별 사용 근거 작성
- [ ] 개인정보 처리방침 최신화
- [ ] 데이터 삭제 정책 문서화

### 기능 테스트
- [ ] 로그인 플로우 정상 작동
- [ ] 모든 권한 사용 기능 정상 작동
- [ ] Webhook 수신 확인
- [ ] 에러 없이 전체 플로우 완료

---

## 🔗 참고 링크

- [Meta App Review 가이드](https://developers.facebook.com/docs/app-review)
- [Instagram Platform 정책](https://developers.facebook.com/docs/instagram-platform)
- [권한 참조](https://developers.facebook.com/docs/permissions/reference)
- [Webhook 설정](https://developers.facebook.com/docs/graph-api/webhooks)

---

## 📞 문의 및 지원

**검수 관련 질문**:
- Meta Developers Community
- support@your-domain.com

**긴급 이슈**:
- Meta Business Support (유료 계정만 가능)
