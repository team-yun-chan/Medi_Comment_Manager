# 검수 최종 체크리스트

이 문서는 Google OAuth 및 Meta App 검수 제출 전 **최종 확인**을 위한 체크리스트입니다.

---

## 🎯 검수 제출 타임라인

### 권장 순서
1. **먼저 배포** (Vercel + Railway)
2. **테스트 환경 구축** (테스트 계정, 게시물, 댓글)
3. **시연 동영상 제작**
4. **Google OAuth 검수 제출** (3-5 영업일)
5. **Meta App 검수 제출** (5-10 영업일)
6. **검수 통과 후 프로덕션 런칭**

---

## 📋 공통 준비사항

### 1. 배포 완료
- [ ] 프론트엔드 배포 (Vercel)
  - URL: https://your-domain.com
  - HTTPS 확인
  - 빌드 에러 없음
- [ ] 백엔드 API 배포 (Railway)
  - URL: https://api.your-domain.com
  - HTTPS 확인
  - 헬스체크 정상: https://api.your-domain.com/health
- [ ] Worker 배포 (Railway)
  - 로그 확인: 정상 실행 중
- [ ] 데이터베이스 (Railway PostgreSQL)
  - 마이그레이션 완료
  - 연결 테스트 성공
- [ ] Redis (Railway Redis)
  - 연결 테스트 성공

### 2. 도메인 설정
- [ ] 도메인 구매 완료
- [ ] DNS 설정 완료
  - A 레코드: @ → Vercel IP
  - CNAME: api → Railway URL
  - CNAME: www → Vercel
- [ ] SSL 인증서 자동 발급 확인 (Let's Encrypt)

### 3. 문서 준비
- [ ] 개인정보 처리방침 작성 및 게시
  - URL: https://your-domain.com/privacy
  - 접속 가능 확인
  - 모든 필수 항목 포함
- [ ] 데이터 삭제 정책 작성 및 게시
  - URL: https://your-domain.com/data-deletion
  - 접속 가능 확인
  - 삭제 방법 명시
- [ ] 서비스 약관 작성 및 게시 (선택)
  - URL: https://your-domain.com/terms

---

## 🔍 Google OAuth 검수 체크리스트

### Phase 1: 사전 준비

#### OAuth 클라이언트 설정
- [ ] Google Cloud Console 프로젝트 생성
- [ ] OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
- [ ] 승인된 리디렉션 URI 등록
  - [ ] https://api.your-domain.com/auth/google/callback
  - [ ] https://your-domain.com/auth/callback (필요시)
- [ ] 환경변수 설정
  - [ ] GOOGLE_CLIENT_ID
  - [ ] GOOGLE_CLIENT_SECRET
  - [ ] GOOGLE_REDIRECT_URI

#### OAuth 동의 화면 작성
- [ ] 앱 이름: "Social Comment Manager"
- [ ] 앱 로고 업로드 (120x120px)
- [ ] 사용자 지원 이메일: support@your-domain.com
- [ ] 앱 도메인
  - [ ] 홈페이지: https://your-domain.com
  - [ ] 개인정보 처리방침: https://your-domain.com/privacy
  - [ ] 서비스 약관: https://your-domain.com/terms (선택)
- [ ] 승인된 도메인
  - [ ] your-domain.com
- [ ] 개발자 연락처 이메일

#### 스코프 설정
- [ ] `https://www.googleapis.com/auth/youtube.force-ssl` 추가
- [ ] `https://www.googleapis.com/auth/youtube.readonly` 추가
- [ ] `openid`, `email`, `profile` 자동 포함 확인

### Phase 2: 기능 테스트

#### 로그인 플로우
- [ ] https://your-domain.com/login 접속
- [ ] "YouTube로 시작하기" 버튼 작동
- [ ] Google OAuth 동의 화면 표시
- [ ] 요청된 스코프 모두 표시됨
- [ ] 승인 후 대시보드로 리디렉션
- [ ] 사용자 정보 정상 표시 (이름, 이메일)

#### YouTube 기능 테스트
- [ ] 채널 목록 조회 (`youtube.readonly`)
  - [ ] 채널 정보 표시 (이름, 구독자 수)
- [ ] 비디오 목록 조회 (`youtube.readonly`)
  - [ ] 비디오 제목, 날짜 표시
- [ ] 댓글 목록 조회 (`youtube.readonly`)
  - [ ] 댓글 내용, 작성자, 날짜 표시
- [ ] 댓글 삭제 (`youtube.force-ssl`)
  - [ ] [삭제] 버튼 작동
  - [ ] 확인 팝업 표시
  - [ ] YouTube에서 실제 삭제 확인
- [ ] 댓글 답글 (`youtube.force-ssl`)
  - [ ] [답글] 버튼 작동
  - [ ] 답글 작성 가능
  - [ ] YouTube에서 답글 표시 확인

### Phase 3: 시연 동영상 제작

#### 녹화 준비
- [ ] 화면 녹화 소프트웨어 준비 (OBS, Loom)
- [ ] 해상도: 1280x720 이상
- [ ] 테스트 계정 로그아웃
- [ ] 브라우저 캐시 삭제

#### 시연 씬 체크
- [ ] 씬 1: 로그인 페이지 (0:00-0:30)
- [ ] 씬 2: OAuth 동의 화면 (0:30-1:00)
  - **중요**: 요청된 스코프 모두 보이도록 3초 정지
- [ ] 씬 3: 대시보드 (1:00-1:30)
- [ ] 씬 4: 채널/비디오 조회 (1:30-2:30)
- [ ] 씬 5: 댓글 삭제 (2:30-3:30)
  - **중요**: YouTube에서도 삭제 확인
- [ ] 씬 6: 댓글 답글 (3:30-4:00)
  - **중요**: YouTube에서 답글 확인
- [ ] 씬 7: 설정 페이지 (4:00-4:30)
- [ ] 씬 8: 마무리 (4:30-5:00)

#### 동영상 편집
- [ ] 중요 화면에 화살표/하이라이트 추가
- [ ] 자막 추가 (스코프 사용 표시)
- [ ] 로딩 화면은 2배속 처리
- [ ] 최종 길이: 3-5분

#### 동영상 업로드
- [ ] YouTube에 Unlisted로 업로드
  - 제목: "Social Comment Manager - OAuth Demo"
  - 설명: "OAuth verification demo for Google"
- [ ] 또는 Google Drive에 공유 링크 생성

### Phase 4: 검수 제출

#### 스코프별 사용 근거 작성
- [ ] `youtube.force-ssl` 사용 근거
  - [ ] 사용 화면 명시
  - [ ] API 호출 설명
  - [ ] 대안 없음 설명
- [ ] `youtube.readonly` 사용 근거
  - [ ] 사용 화면 명시
  - [ ] API 호출 설명

#### 검수 신청서 제출
- [ ] OAuth 동의 화면에서 "게시 신청" 클릭
- [ ] 시연 동영상 URL 제공
- [ ] 스코프별 사용 근거 작성
- [ ] 추가 정보 제공 (필요시)

---

## 📱 Meta App 검수 체크리스트

### Phase 1: 사전 준비

#### Meta App 생성
- [ ] [Meta Developers](https://developers.facebook.com) 계정 생성
- [ ] 새 앱 생성 (타입: Business)
- [ ] App ID 및 Secret 확인
- [ ] 환경변수 설정
  - [ ] META_APP_ID
  - [ ] META_APP_SECRET
  - [ ] META_REDIRECT_URI

#### 앱 기본 설정
- [ ] 앱 이름: "Social Comment Manager"
- [ ] 카테고리: "Business Tools"
- [ ] 앱 설명 작성 (영문)
- [ ] 앱 아이콘 업로드 (512x512px PNG)
- [ ] 개인정보 처리방침 URL: https://your-domain.com/privacy
- [ ] 서비스 약관 URL: https://your-domain.com/terms
- [ ] 데이터 삭제 URL: https://your-domain.com/data-deletion
- [ ] 앱 도메인 추가
  - [ ] your-domain.com
  - [ ] api.your-domain.com

#### OAuth 리디렉션 설정
- [ ] Valid OAuth Redirect URIs 추가
  - [ ] https://api.your-domain.com/auth/meta/callback
  - [ ] https://your-domain.com/auth/callback (필요시)

#### Webhook 설정
- [ ] Products → Webhooks 설정
- [ ] Callback URL: https://api.your-domain.com/webhooks/meta
- [ ] Verify Token 설정 (환경변수와 동일)
- [ ] 구독 필드 선택
  - [ ] comments
  - [ ] mentions
- [ ] Webhook 검증 성공

#### 권한 요청
- [ ] Permissions & Features에서 권한 추가
  - [ ] instagram_basic
  - [ ] instagram_manage_comments
  - [ ] pages_show_list
  - [ ] pages_read_engagement
  - [ ] pages_manage_engagement
  - [ ] pages_manage_metadata
  - [ ] business_management

### Phase 2: 테스트 환경 구축

#### 테스트 계정 1 (관리자)
- [ ] Facebook 계정 생성 또는 Meta Test User 생성
- [ ] 이메일: test-admin@your-domain.com
- [ ] Facebook 페이지 생성
  - [ ] 페이지명: "Test Brand for Review"
  - [ ] 카테고리: 브랜드
  - [ ] 프로필 사진 업로드
  - [ ] 커버 사진 업로드 (선택)
- [ ] Instagram 비즈니스 계정 생성
  - [ ] 사용자명: @testbrand_review
  - [ ] 비즈니스 계정으로 전환
  - [ ] Facebook 페이지 연결
  - [ ] 프로필 사진 업로드
  - [ ] 자기소개 작성

#### 테스트 게시물 작성
- [ ] 게시물 1: 제품 소개
  - [ ] 이미지 업로드
  - [ ] 캡션 작성
  - [ ] 게시 완료
- [ ] 게시물 2: 프로모션
  - [ ] 이미지 업로드
  - [ ] 캡션 작성
  - [ ] 게시 완료
- [ ] 게시물 3: 고객 리뷰
  - [ ] 이미지 업로드
  - [ ] 캡션 작성
  - [ ] 게시 완료

#### 테스트 계정 2 (댓글 작성자)
- [ ] Instagram 계정 생성
  - [ ] 사용자명: @testuser_commenter
- [ ] 테스트 비즈니스 계정 팔로우
- [ ] 각 게시물에 댓글 5개 이상 작성
  - [ ] 일반 댓글 3-4개
  - [ ] 스팸 댓글 1-2개 (테스트용)
  - [ ] 부정적 댓글 1개 (숨김 테스트용)

### Phase 3: 기능 테스트

#### 로그인 플로우
- [ ] https://your-domain.com/login 접속
- [ ] "Instagram으로 시작하기" 버튼 작동
- [ ] Meta OAuth 동의 화면 표시
- [ ] 요청된 권한 모두 표시됨
- [ ] 승인 후 대시보드로 리디렉션
- [ ] 페이지 목록 표시

#### Instagram 기능 테스트
- [ ] 페이지 선택 (`pages_show_list`)
  - [ ] 페이지명 표시
- [ ] Instagram 계정 정보 조회 (`instagram_basic`)
  - [ ] 사용자명, 프로필 사진 표시
- [ ] 게시물 목록 조회
  - [ ] 게시물 이미지, 캡션 표시
- [ ] 댓글 목록 조회 (`instagram_manage_comments`)
  - [ ] 댓글 내용, 작성자, 날짜 표시
- [ ] 댓글 숨김 (`pages_manage_engagement`)
  - [ ] [숨김] 버튼 작동
  - [ ] Instagram 앱에서 숨김 확인
- [ ] 댓글 삭제 (`instagram_manage_comments`)
  - [ ] [삭제] 버튼 작동
  - [ ] Instagram 앱에서 삭제 확인
- [ ] 댓글 답글 (`instagram_manage_comments`)
  - [ ] [답글] 버튼 작동
  - [ ] Instagram 앱에서 답글 확인
- [ ] Webhook 구독 (`pages_manage_metadata`)
  - [ ] [구독] 버튼 작동
  - [ ] 구독 상태 확인
  - [ ] 새 댓글 작성 시 실시간 알림 확인

### Phase 4: 시연 동영상 제작

#### 녹화 준비
- [ ] 화면 녹화 소프트웨어 준비
- [ ] 해상도: 1280x720 이상
- [ ] 테스트 계정 로그아웃
- [ ] 브라우저 캐시 삭제
- [ ] Instagram 앱도 로그아웃

#### 시연 씬 체크
- [ ] 씬 1: 로그인 페이지
- [ ] 씬 2: OAuth 동의 화면
  - **중요**: 모든 권한 표시, 3초 정지
- [ ] 씬 3: 대시보드
- [ ] 씬 4: 페이지 선택
- [ ] 씬 5: Instagram 계정 정보
- [ ] 씬 6: 게시물 및 댓글 조회
- [ ] 씬 7: 댓글 숨김
  - **중요**: Instagram 앱에서도 확인
- [ ] 씬 8: 댓글 삭제
  - **중요**: Instagram 앱에서도 확인
- [ ] 씬 9: 댓글 답글
  - **중요**: Instagram 앱에서도 확인
- [ ] 씬 10: Webhook 구독 설정
- [ ] 씬 11: 실시간 댓글 수신 확인

#### 동영상 업로드
- [ ] YouTube Unlisted 또는 Vimeo에 업로드
- [ ] 제목: "Social Comment Manager - Meta App Demo"

### Phase 5: 문서 작성

#### 권한별 사용 근거
- [ ] `instagram_basic` 사용 근거
- [ ] `instagram_manage_comments` 사용 근거
- [ ] `pages_show_list` 사용 근거
- [ ] `pages_read_engagement` 사용 근거
- [ ] `pages_manage_engagement` 사용 근거
- [ ] `pages_manage_metadata` 사용 근거
- [ ] `business_management` 사용 근거

#### 단계별 지침서
- [ ] 로그인 단계
- [ ] 페이지 연결 단계
- [ ] Instagram 연동 단계
- [ ] 댓글 조회 단계
- [ ] 댓글 관리 단계 (숨김, 삭제, 답글)
- [ ] Webhook 설정 단계

#### 스크린샷 준비
- [ ] 권한당 2-3장 준비
- [ ] 로그인 화면
- [ ] OAuth 동의 화면
- [ ] 댓글 목록 화면
- [ ] 댓글 숨김 전/후
- [ ] 댓글 삭제 전/후
- [ ] Webhook 설정 화면

#### 테스트 계정 자격 증명 문서
- [ ] 관리자 계정 정보
  - Facebook 이메일/비밀번호
  - Instagram 사용자명/비밀번호
- [ ] 댓글 작성자 계정 정보
  - Instagram 사용자명/비밀번호
- [ ] 테스트 시나리오 설명
- [ ] 로그인 URL 명시

### Phase 6: 검수 제출

#### App Review 신청
- [ ] Meta App Dashboard → App Review
- [ ] 각 권한별로 검수 신청
- [ ] 시연 동영상 URL 제공
- [ ] 단계별 지침서 작성
- [ ] 스크린샷 업로드
- [ ] 테스트 계정 자격 증명 제공
- [ ] 제출

---

## 🔄 검수 진행 상태 확인

### Google OAuth 검수
- [ ] 제출 완료
- [ ] 상태: Pending Review
- [ ] 상태: In Review
- [ ] 상태: Approved ✅ (또는 Additional Info Requested)

### Meta App 검수
- [ ] 제출 완료
- [ ] 상태: Pending Review
- [ ] 상태: In Review
- [ ] 상태: Approved ✅ (또는 Additional Info Requested)

---

## ⚠️ 검수 거부 시 대응

### 추가 정보 요청 받은 경우
- [ ] 거부 사유 상세 확인
- [ ] 부족한 부분 보완
  - [ ] 시연 동영상 재제작 (필요시)
  - [ ] 스크린샷 추가
  - [ ] 문서 수정
- [ ] 응답 메시지 작성 (영문)
- [ ] 재제출
- [ ] 7일 이내 응답 필수

### 일반적인 거부 사유
- [ ] 시연 동영상 불충분 → 상세한 동영상 재제작
- [ ] 개인정보 처리방침 미흡 → 필수 항목 추가
- [ ] 테스트 환경 불충분 → 게시물/댓글 추가
- [ ] 스코프/권한 사용 근거 불명확 → 상세 설명 추가

---

## 🎉 검수 승인 후

### 프로덕션 런칭
- [ ] Google OAuth 승인 확인
- [ ] Meta App 승인 확인
- [ ] 실제 사용자에게 공개
- [ ] 마케팅/홍보 시작
- [ ] 사용자 피드백 수집

---

## 📞 도움이 필요한 경우

### 검수 관련 문의
- Google: [OAuth Verification 지원](https://support.google.com/code/contact/oauth_verification)
- Meta: [Meta Developers Community](https://developers.facebook.com/community/)

### 서비스 문의
- 이메일: support@your-domain.com
- 문서: 이 레포지토리의 docs/ 폴더 참조

---

**모든 항목을 체크한 후 검수 제출을 시작하세요!**

Good luck! 🚀
