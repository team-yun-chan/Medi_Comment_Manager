# 데이터 삭제 정책 (Data Deletion Policy)

**최종 업데이트**: 2025년 1월 1일  
**서비스명**: Social Comment Manager

---

## 1. 개요

Social Comment Manager는 사용자의 **"잊혀질 권리"**를 존중합니다. 본 문서는 사용자가 개인정보 및 계정 데이터를 삭제하는 방법을 설명합니다.

---

## 2. 삭제 가능한 데이터

### 2.1 사용자 계정 데이터
- 이름, 이메일, 프로필 사진
- 로그인 이력
- 계정 설정

### 2.2 연동 계정 데이터
- Google (YouTube) 연동 정보
  - 채널 정보
  - 비디오 정보
  - 댓글 데이터
  - OAuth 토큰
- Meta (Instagram) 연동 정보
  - 페이지 정보
  - Instagram 계정 정보
  - 게시물 정보
  - 댓글 데이터
  - 액세스 토큰

### 2.3 사용 기록
- 댓글 관리 액션 (숨김, 삭제, 답글)
- 모더레이션 규칙
- 통계 데이터

### 2.4 백업 데이터
- 자동 백업된 모든 데이터
- 보관 기간: 30일

---

## 3. 데이터 삭제 방법

### 방법 1: 대시보드에서 직접 삭제 (권장)

#### 3.1 부분 삭제: 연동 해제

**YouTube 연동 해제**:
1. https://your-domain.com/dashboard/settings 접속
2. "YouTube (Google)" 섹션 찾기
3. [연동 해제] 버튼 클릭
4. 확인 팝업 → "해제" 클릭
5. 삭제되는 데이터 확인:
   - ✅ OAuth 토큰 (즉시 삭제)
   - ✅ 채널 정보 (30일 후 완전 삭제)
   - ✅ 비디오 정보 (30일 후 완전 삭제)
   - ✅ 댓글 데이터 (30일 후 완전 삭제)

**Instagram 연동 해제**:
1. https://your-domain.com/dashboard/settings 접속
2. "Instagram (Meta)" 섹션 찾기
3. [연동 해제] 버튼 클릭
4. 확인 팝업 → "해제" 클릭
5. 삭제되는 데이터 확인:
   - ✅ 페이지 액세스 토큰 (즉시 삭제)
   - ✅ 페이지 정보 (30일 후 완전 삭제)
   - ✅ Instagram 계정 정보 (30일 후 완전 삭제)
   - ✅ 게시물 정보 (30일 후 완전 삭제)
   - ✅ 댓글 데이터 (30일 후 완전 삭제)

---

#### 3.2 완전 삭제: 계정 삭제

**계정 삭제 절차**:
1. https://your-domain.com/dashboard/settings 접속
2. 페이지 하단 "계정 관리" 섹션
3. [계정 삭제] 버튼 클릭 (빨간색)
4. 경고 메시지 확인:
   ```
   ⚠️ 경고: 계정 삭제는 되돌릴 수 없습니다.
   
   삭제되는 데이터:
   - 모든 연동 계정 (YouTube, Instagram)
   - 모든 댓글 데이터
   - 모든 모더레이션 규칙
   - 모든 통계 데이터
   - 백업 데이터 (30일 후)
   
   계속하시겠습니까?
   ```
5. "DELETE"를 입력하여 확인
6. [최종 삭제] 버튼 클릭
7. 확인 이메일 수신 (삭제 완료 통보)

**삭제 타임라인**:
- **즉시** (0일):
  - OAuth/액세스 토큰 삭제
  - 로그인 세션 무효화
  - 계정 비활성화
- **7일 이내**:
  - 사용자 정보 삭제
  - 연동 계정 정보 삭제
  - 댓글 데이터 삭제
- **30일 이내**:
  - 백업 데이터 완전 삭제
  - 로그 데이터 삭제
  - 모든 흔적 제거

---

### 방법 2: 이메일 요청

대시보드 접근이 불가능한 경우:

#### 요청 방법
1. support@your-domain.com 으로 이메일 발송
2. 제목: "계정 삭제 요청 (Data Deletion Request)"
3. 본문 포함 사항:
   ```
   이름: [이름]
   이메일: [등록된 이메일]
   요청 사항: 계정 및 모든 데이터 삭제
   사유 (선택): [사유]
   
   본인은 위 계정의 소유자이며, 모든 데이터 삭제를 요청합니다.
   ```
4. 신원 확인 절차:
   - 등록된 이메일에서 발송 필요
   - 추가 확인이 필요한 경우 답변 이메일 발송
5. **처리 기간**: 7 영업일 이내
6. **완료 통보**: 이메일로 삭제 완료 안내

---

### 방법 3: Google/Meta에서 직접 삭제

#### Google (YouTube) 데이터 삭제
1. [Google 계정 설정](https://myaccount.google.com/permissions) 접속
2. "타사 앱 액세스 권한" 섹션
3. "Social Comment Manager" 찾기
4. [액세스 권한 삭제] 클릭
5. 결과:
   - ✅ OAuth 토큰 즉시 무효화
   - ✅ Google 측에서 권한 철회
   - ⚠️ 주의: 우리 서버의 데이터는 자동 삭제되지 않음
   - 💡 권장: 방법 1 또는 방법 2로 완전 삭제 요청

#### Meta (Instagram) 데이터 삭제
1. [Facebook 설정](https://www.facebook.com/settings?tab=business_tools) 접속
2. "비즈니스 통합" 섹션
3. "Social Comment Manager" 찾기
4. [삭제] 클릭
5. 결과:
   - ✅ 페이지 액세스 토큰 무효화
   - ✅ Meta 측에서 권한 철회
   - ⚠️ 주의: 우리 서버의 데이터는 자동 삭제되지 않음
   - 💡 권장: 방법 1 또는 방법 2로 완전 삭제 요청

---

## 4. 삭제 범위 및 제외 사항

### 4.1 삭제되는 데이터 (완전 삭제)
- ✅ 사용자 계정 정보
- ✅ 연동 계정 정보 (YouTube, Instagram)
- ✅ OAuth/액세스 토큰
- ✅ 댓글 데이터 (조회한 댓글 내용)
- ✅ 모더레이션 규칙
- ✅ 통계 데이터
- ✅ 로그 데이터 (90일 이내)
- ✅ 백업 데이터 (30일 이내)

### 4.2 삭제되지 않는 데이터
- ❌ YouTube/Instagram에 원본으로 존재하는 댓글
  - 이유: 우리는 댓글을 복사한 것이며, 원본은 소셜 미디어에 있음
  - 삭제 방법: YouTube/Instagram에서 직접 삭제
- ❌ 익명화된 통계 데이터 (집계된 데이터)
  - 예: "전체 사용자의 평균 댓글 관리 수"
  - 개인 식별 불가능
- ❌ 법적 의무로 보관해야 하는 데이터
  - 재무 기록 (결제 시)
  - 법원 명령에 따른 데이터

---

## 5. 삭제 프로세스 (기술적 세부사항)

### 5.1 즉시 삭제 (Soft Delete)
```sql
-- 계정 비활성화
UPDATE users 
SET deleted_at = NOW(), 
    status = 'deleted'
WHERE id = {user_id};

-- 토큰 무효화
DELETE FROM oauth_tokens 
WHERE user_id = {user_id};

-- 세션 무효화
DELETE FROM sessions 
WHERE user_id = {user_id};
```

### 5.2 7일 후 삭제 (Hard Delete)
```sql
-- 사용자 데이터 완전 삭제
DELETE FROM users WHERE id = {user_id};
DELETE FROM youtube_channels WHERE user_id = {user_id};
DELETE FROM instagram_pages WHERE user_id = {user_id};
DELETE FROM youtube_comments WHERE media_id IN (...);
DELETE FROM instagram_comments WHERE media_id IN (...);
DELETE FROM moderation_rules WHERE user_id = {user_id};
```

### 5.3 30일 후 삭제 (Backup Purge)
```bash
# 백업에서도 삭제
aws s3 rm s3://backups/user_{user_id}/ --recursive

# 로그 삭제
DELETE FROM audit_logs WHERE user_id = {user_id};
DELETE FROM webhook_logs WHERE user_id = {user_id};
```

---

## 6. 삭제 확인 방법

### 6.1 즉시 확인
1. 로그아웃됨
2. 로그인 시도 시 "계정을 찾을 수 없습니다" 오류
3. 확인 이메일 수신

### 6.2 7일 후 확인
1. 이메일 수신: "데이터 삭제 완료"
2. 우리 데이터베이스에서 완전 제거

### 6.3 30일 후 확인
1. 백업에서도 완전 제거
2. 최종 확인 이메일 (선택적)

---

## 7. 데이터 복구 정책

### 7.1 복구 가능 기간
- **7일 이내**: 요청 시 계정 복구 가능
  - 방법: support@your-domain.com 으로 복구 요청
  - 조건: 신원 확인 필요
- **7일 이후**: 복구 불가능
  - 데이터 완전 삭제됨
  - 새 계정 생성 필요

### 7.2 복구 불가능한 경우
- Hard Delete 후 (7일 경과)
- 백업 삭제 후 (30일 경과)
- 법적 요구로 삭제된 경우

---

## 8. 제3자 서비스의 데이터

### 8.1 Google (YouTube)
본 서비스에서 계정을 삭제해도 **Google 계정 및 YouTube 데이터는 영향 없음**.

Google에서 데이터 삭제:
- [Google Takeout](https://takeout.google.com/) - 데이터 다운로드
- [Google 계정 삭제](https://myaccount.google.com/delete-account) - 계정 삭제

### 8.2 Meta (Facebook/Instagram)
본 서비스에서 계정을 삭제해도 **Facebook/Instagram 계정 및 데이터는 영향 없음**.

Meta에서 데이터 삭제:
- [Facebook 데이터 다운로드](https://www.facebook.com/dyi)
- [Instagram 데이터 다운로드](https://www.instagram.com/download/request/)
- [Facebook 계정 삭제](https://www.facebook.com/help/delete_account)

---

## 9. 자주 묻는 질문 (FAQ)

### Q1: 계정을 삭제하면 YouTube/Instagram의 댓글도 삭제되나요?
**A**: 아니요. 우리 서비스에서 **조회한 댓글 데이터**만 삭제됩니다. YouTube/Instagram의 원본 댓글은 영향을 받지 않습니다. 원본을 삭제하려면 해당 플랫폼에서 직접 삭제해야 합니다.

### Q2: 연동 해제와 계정 삭제의 차이는?
**A**:
- **연동 해제**: 특정 플랫폼(YouTube 또는 Instagram) 데이터만 삭제, 계정은 유지
- **계정 삭제**: 모든 데이터 및 계정 완전 삭제

### Q3: 삭제 후 복구 가능한가요?
**A**: 7일 이내에만 복구 요청 가능. 7일 후에는 완전 삭제되어 복구 불가능.

### Q4: 삭제 처리 기간은 얼마나 걸리나요?
**A**:
- 대시보드에서 삭제: 즉시 처리 (7일 후 완전 삭제)
- 이메일 요청: 7 영업일 이내 처리

### Q5: 백업 데이터는 언제 삭제되나요?
**A**: 계정 삭제 후 30일 이내에 모든 백업에서 제거됩니다.

### Q6: 삭제 확인을 어떻게 받나요?
**A**: 등록된 이메일로 확인 메일 발송. 로그인 시도 시 "계정 없음" 오류로도 확인 가능.

### Q7: 부분 삭제가 가능한가요?
**A**: 네. YouTube 또는 Instagram 연동만 개별적으로 해제 가능.

### Q8: GDPR/CCPA에 따른 삭제 요청은 어떻게 하나요?
**A**: 동일한 방법 (대시보드 또는 이메일). GDPR/CCPA 명시 시 우선 처리.

---

## 10. 연락처

데이터 삭제 관련 문의:
- **이메일**: support@your-domain.com
- **제목**: 데이터 삭제 문의 (Data Deletion Inquiry)
- **응답 시간**: 영업일 기준 48시간 이내

긴급 삭제 요청 (법적 사유):
- **이메일**: legal@your-domain.com
- **응답 시간**: 24시간 이내

---

## 11. 관련 링크

- [개인정보 처리방침](https://your-domain.com/privacy)
- [서비스 약관](https://your-domain.com/terms)
- [Google 개인정보 보호](https://policies.google.com/privacy)
- [Meta 데이터 정책](https://www.facebook.com/privacy/policy)

---

**최종 업데이트**: 2025년 1월 1일

본 정책은 GDPR, CCPA, 한국 개인정보보호법을 준수합니다.
