# Meta 테스트 계정 설정 가이드

## 📋 개요

Meta 앱 검수를 위해서는 **완전히 설정된 테스트 환경**이 필요합니다.

**필요한 자산**:
- Facebook 페이지 1개 (최소)
- Instagram 비즈니스 계정 1개
- 게시물 3개 이상
- 각 게시물에 댓글 5개 이상

---

## 🏗️ 테스트 환경 구축 단계

### 1단계: Facebook 테스트 계정 생성

#### 옵션 A: Meta Test Users (권장)
Meta에서 제공하는 공식 테스트 계정 사용

**생성 방법**:
1. [Meta App Dashboard](https://developers.facebook.com/apps) 접속
2. 앱 선택 → Roles → Test Users
3. "Add Test Users" 클릭
4. 이름 입력 (예: "Test Admin")
5. 권한 설정:
   - ✅ Manage App
   - ✅ Access token
6. Create

**장점**:
- 검수팀이 선호
- 실제 계정 정보 불필요
- 삭제 용이

**단점**:
- Instagram 연동 복잡
- 실제 환경과 다를 수 있음

---

#### 옵션 B: 실제 계정 사용
개인 Facebook 계정 사용 (추천하지 않음)

**주의사항**:
- 개인정보 노출 위험
- 검수 후 삭제 어려움
- 실제 데이터 혼재

---

### 2단계: Facebook 페이지 생성

#### 페이지 생성
1. Facebook 로그인 (테스트 계정)
2. [페이지 만들기](https://www.facebook.com/pages/create)
3. 페이지 정보 입력:
   ```
   페이지 이름: Test Brand for Review
   카테고리: 브랜드
   설명: This is a test page for app review
   ```
4. 페이지 생성 완료

#### 페이지 설정
```
프로필 사진: 업로드 (필수)
커버 사진: 업로드 (선택)
공개 범위: 공개
```

---

### 3단계: Instagram 비즈니스 계정 연결

#### Instagram 계정 생성
1. Instagram 앱 설치
2. 새 계정 만들기
   ```
   사용자 이름: testbrand_review
   이메일: test@your-domain.com
   비밀번호: [안전한 비밀번호]
   ```
3. 프로필 설정
   - 프로필 사진 업로드
   - 자기소개 작성

#### 비즈니스 계정 전환
1. 설정 → 계정
2. "비즈니스 계정으로 전환"
3. 카테고리 선택: "제품/서비스"
4. Facebook 페이지 연결
   - 위에서 만든 페이지 선택
   - 연결 승인

---

### 4단계: 게시물 작성

#### 최소 요구사항
- 게시물 수: **3개 이상**
- 각 게시물에 댓글: **5개 이상**

#### 게시물 1: 제품 소개
```
이미지: 제품 사진 또는 브랜드 로고
캡션:
"🎉 New Product Launch!
Check out our latest collection.
#testproduct #review"
```

#### 게시물 2: 프로모션
```
이미지: 프로모션 배너
캡션:
"💰 Special Offer!
Get 20% off this weekend only.
#sale #promo"
```

#### 게시물 3: 고객 리뷰
```
이미지: 고객 리뷰 스크린샷
캡션:
"⭐ We love hearing from our customers!
Thank you for your support.
#customerreview #testimonial"
```

---

### 5단계: 댓글 작성

#### 테스트 계정 2 필요
댓글 작성을 위한 별도 Instagram 계정

**생성 방법**:
1. 새 Instagram 계정 만들기
   ```
   사용자 이름: testuser_commenter
   ```
2. 테스트 비즈니스 계정 팔로우
3. 각 게시물에 댓글 작성

#### 댓글 예시

**일반 댓글** (3-4개):
```
- "Looks great! 😍"
- "When can I buy this?"
- "Love your brand! ❤️"
- "Amazing quality!"
```

**스팸 댓글** (1-2개) - 테스트용:
```
- "Check out my profile for cheap deals! 🔥"
- "Click here bit.ly/xxxxx"
```

**부정적 댓글** (1개) - 숨김 테스트용:
```
- "Not satisfied with the service 😠"
```

---

### 6단계: 테스트 시나리오 준비

#### 시나리오 1: 댓글 조회
```
1. 로그인
2. Instagram > 페이지 선택
3. 게시물 선택
4. 댓글 목록 확인
5. 모든 댓글이 표시되는지 확인
```

#### 시나리오 2: 댓글 숨김
```
1. 스팸 댓글 찾기
2. [숨김] 버튼 클릭
3. 확인
4. Instagram 앱에서 숨겨졌는지 확인
```

#### 시나리오 3: 댓글 삭제
```
1. 심각한 스팸 댓글 선택
2. [삭제] 버튼 클릭
3. 확인
4. Instagram 앱에서 삭제되었는지 확인
```

#### 시나리오 4: 댓글 답글
```
1. 고객 질문 댓글 선택
2. [답글] 버튼 클릭
3. "Thank you for your interest!" 입력
4. 전송
5. Instagram 앱에서 답글 확인
```

#### 시나리오 5: Webhook 구독
```
1. 설정 > Webhook
2. [구독] 버튼 클릭
3. 구독 상태 확인
4. 새 댓글 작성 (테스트 계정으로)
5. 실시간 알림 수신 확인
```

---

## 📝 테스트 계정 자격 증명 문서

Meta 검수 신청 시 제공할 정보:

```
=== Test Account Credentials ===

Admin Account (Business Owner):
  Facebook Email: test-admin@your-domain.com
  Facebook Password: [제공]
  Instagram Username: @testbrand_review
  Instagram Password: [제공]
  
  Connected Assets:
  - Facebook Page: "Test Brand for Review"
    (https://facebook.com/testbrandreview)
  - Instagram Business: @testbrand_review
    (https://instagram.com/testbrand_review)

Commenter Account (For testing comments):
  Instagram Username: @testuser_commenter
  Instagram Password: [제공]

Test Data:
  - 3 Instagram posts with 5+ comments each
  - Mix of normal, spam, and negative comments
  - Ready for all testing scenarios

Login URL: https://your-domain.com/login

=== Test Instructions ===

1. Login with admin account credentials above
2. Click "Instagram으로 시작하기"
3. Authorize all permissions
4. Select "Test Brand for Review" page
5. Navigate to Dashboard > Instagram > Comments
6. You will see 3 posts with multiple comments
7. Try hiding/deleting spam comments
8. Try replying to customer questions
9. Verify changes on actual Instagram app

All test data is pre-populated and ready for review.
```

---

## 🎬 시연 영상 촬영 팁

### 사전 준비
- [ ] 테스트 계정으로 로그아웃된 상태에서 시작
- [ ] 브라우저 캐시/쿠키 삭제
- [ ] Instagram 앱도 로그아웃
- [ ] 화면 녹화 시작

### 촬영 순서
1. **로그인 화면** 보여주기
2. **테스트 계정으로 로그인** (자격 증명 입력)
3. **OAuth 동의 화면** - 모든 권한 표시
4. **대시보드** - 연결된 계정 확인
5. **댓글 목록** 조회
6. **댓글 관리** 액션 (숨김, 삭제, 답글)
7. **Instagram 앱**에서 변경 사항 확인
8. **Webhook 설정** 및 실시간 알림

---

## ⚠️ 흔한 실수

### 1. 게시물/댓글 부족
- ❌ 게시물 1-2개만
- ❌ 댓글 없거나 1-2개만
- ✅ 최소 3개 게시물, 각 5개 댓글

### 2. Instagram 비즈니스 전환 안 함
- ❌ 개인 계정 그대로
- ✅ 비즈니스 계정 전환 필수

### 3. Facebook 페이지 미연결
- ❌ Instagram만 있고 페이지 없음
- ✅ 페이지 생성 후 IG 연결

### 4. 테스트 시나리오 미준비
- ❌ 즉석에서 테스트하려고 함
- ✅ 모든 시나리오 사전 테스트

---

## 🔐 보안 주의사항

### 테스트 계정 관리
- 실제 개인 정보 사용 금지
- 검수 후 계정 삭제 또는 비활성화
- 비밀번호 주기적 변경

### 검수팀 공유
- 자격 증명은 안전하게 암호화
- Meta 검수팀만 접근 가능하도록
- 검수 완료 후 비밀번호 변경

---

## ✅ 최종 체크리스트

제출 전 확인:

- [ ] Facebook 페이지 생성 완료
- [ ] Instagram 비즈니스 계정 연결
- [ ] 페이지와 IG 계정 연동 확인
- [ ] 게시물 3개 이상 작성
- [ ] 각 게시물에 댓글 5개 이상
- [ ] 스팸 댓글 포함 (테스트용)
- [ ] 테스트 계정 자격 증명 문서 작성
- [ ] 모든 시나리오 사전 테스트 완료
- [ ] 시연 동영상 촬영 완료
- [ ] Instagram 앱에서도 변경 확인 완료

---

## 📞 문제 해결

### Instagram 계정 연결 안 됨
**증상**: 페이지에서 IG 계정 찾을 수 없음  
**해결**: 
1. Instagram에서 비즈니스 계정으로 전환 확인
2. Facebook 페이지 설정 > Instagram > 연결

### 댓글이 보이지 않음
**증상**: API 호출 시 댓글 0개  
**해결**:
1. 게시물이 공개인지 확인
2. IG 비즈니스 계정으로 작성되었는지 확인
3. API 토큰 권한 확인

### Webhook 수신 안 됨
**증상**: 새 댓글 작성해도 알림 없음  
**해결**:
1. Webhook URL이 HTTPS인지 확인
2. Verify Token 일치 확인
3. 구독 상태 확인 (GET /subscribed_apps)

---

## 🔗 참고 링크

- [Meta Test Users 가이드](https://developers.facebook.com/docs/development/build-and-test/test-users)
- [Instagram Business Account 설정](https://help.instagram.com/502981923235522)
- [Facebook Page 만들기](https://www.facebook.com/pages/create)
