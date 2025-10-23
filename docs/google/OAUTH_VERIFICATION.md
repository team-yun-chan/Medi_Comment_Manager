# Google OAuth 검수 가이드

## 📋 개요

**앱 이름**: Social Comment Manager  
**앱 타입**: 웹 애플리케이션  
**OAuth 클라이언트 타입**: Web application  
**목적**: YouTube 댓글 관리 및 모더레이션 서비스

---

## 🔑 요청 스코프

### 1. `https://www.googleapis.com/auth/youtube.force-ssl`
**용도**: YouTube 댓글 삭제, 숨김, 답글 작성  
**필수 여부**: 필수  
**사용 화면**: 대시보드 > YouTube > 댓글 관리

### 2. `https://www.googleapis.com/auth/youtube.readonly`
**용도**: YouTube 채널, 비디오, 댓글 조회  
**필수 여부**: 필수  
**사용 화면**: 대시보드 > YouTube > 채널/비디오 목록

### 3. `openid`, `email`, `profile`
**용도**: 사용자 인증 및 계정 식별  
**필수 여부**: 필수  
**사용 화면**: 로그인, 사용자 프로필

---

## 📱 앱 화면 흐름

### 1단계: 로그인
```
[로그인 페이지]
  ↓ "YouTube로 시작하기" 버튼 클릭
[Google OAuth 동의 화면]
  ↓ 권한 승인
[대시보드]
```

### 2단계: 채널 선택
```
[대시보드]
  ↓ "YouTube" 메뉴 클릭
[채널 목록] (youtube.readonly로 조회)
  ↓ 채널 선택
[비디오 목록]
```

### 3단계: 댓글 관리
```
[비디오 목록]
  ↓ 비디오 선택
[댓글 목록] (youtube.readonly로 조회)
  ↓ 댓글 액션 선택
[삭제/숨김/답글] (youtube.force-ssl로 실행)
```

---

## 🎥 시연 동영상 체크리스트

### 필수 포함 내용
- ✅ 로그인 화면에서 OAuth 동의 화면까지
- ✅ 요청된 스코프가 화면에 표시되는 장면
- ✅ 승인 후 대시보드로 리다이렉션
- ✅ 채널 목록 조회 (youtube.readonly 사용)
- ✅ 비디오 목록 조회 (youtube.readonly 사용)
- ✅ 댓글 목록 조회 (youtube.readonly 사용)
- ✅ 댓글 삭제 기능 (youtube.force-ssl 사용)
- ✅ 댓글 답글 기능 (youtube.force-ssl 사용)
- ✅ 설정 페이지에서 연결된 계정 확인

### 녹화 설정
- 해상도: 1280x720 이상
- 길이: 3-5분
- 형식: MP4, WebM
- 음성: 선택사항 (자막 권장)

---

## 📄 제출 서류

### 1. 개인정보 처리방침 URL
```
https://your-domain.com/privacy
```
**필수 포함 내용**:
- 수집하는 데이터 목록
- 데이터 사용 목적
- 데이터 보관 기간
- 데이터 삭제 방법
- 제3자 공유 여부

### 2. 서비스 약관 URL
```
https://your-domain.com/terms
```

### 3. 데이터 삭제 안내 URL
```
https://your-domain.com/data-deletion
```

### 4. 앱 로고
- 크기: 120x120px
- 형식: PNG, JPG
- 배경: 투명 또는 흰색

### 5. 앱 홈페이지
```
https://your-domain.com
```

---

## 🔒 보안 요구사항

### 1. HTTPS 필수
- 모든 리다이렉트 URI는 HTTPS 사용
- 개발 환경에서만 localhost HTTP 허용

### 2. 토큰 저장
- Access Token: 암호화된 DB에 저장
- Refresh Token: 암호화 필수
- 클라이언트에 저장 금지

### 3. 스코프 최소화
- 필요한 권한만 요청
- 사용하지 않는 스코프 제거

---

## ✅ 검수 전 체크리스트

- [ ] OAuth 동의 화면 정보 완성
  - [ ] 앱 이름
  - [ ] 앱 로고
  - [ ] 지원 이메일
  - [ ] 개인정보 처리방침 URL
  - [ ] 서비스 약관 URL
- [ ] 스코프 설정
  - [ ] youtube.force-ssl
  - [ ] youtube.readonly
  - [ ] openid, email, profile
- [ ] 리다이렉트 URI 등록
  - [ ] 프로덕션 URL
  - [ ] 스테이징 URL (선택)
- [ ] 시연 동영상 제작
  - [ ] 전체 플로우 포함
  - [ ] 스코프 사용 명확히 표시
- [ ] 문서 작성
  - [ ] 개인정보 처리방침
  - [ ] 데이터 삭제 정책
  - [ ] 스코프 사용 근거

---

## 📞 검수 제출 후

### 예상 소요 시간
- 초기 검수: 3-5 영업일
- 재검수 (수정 후): 1-2 영업일

### 검수 결과
1. **승인**: 즉시 프로덕션 사용 가능
2. **추가 정보 요청**: 이메일로 안내
3. **거부**: 사유 확인 후 수정

### 자주 거부되는 이유
- 시연 동영상 불충분
- 개인정보 처리방침 누락
- 스코프 사용 근거 불명확
- 리다이렉트 URI 불일치

---

## 🔗 참고 링크

- [Google OAuth 검수 가이드](https://support.google.com/cloud/answer/9110914)
- [YouTube Data API 할당량](https://developers.google.com/youtube/v3/getting-started#quota)
- [OAuth 2.0 스코프](https://developers.google.com/identity/protocols/oauth2/scopes)

---

## 📧 문의

검수 관련 문의: support@your-domain.com
