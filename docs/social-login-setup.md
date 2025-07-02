# 소셜 로그인 및 Users 테이블 설정 가이드

## 1. Supabase 데이터베이스 설정

### 1-1. Users 테이블 생성
Supabase 대시보드의 SQL Editor에서 다음 스크립트를 실행하세요:

```sql
-- src/scripts/setup-users-table.sql 파일의 내용을 실행
```

### 1-2. RLS 정책 확인
다음 정책들이 올바르게 설정되어 있는지 확인:
- `Users can view own profile`
- `Users can update own profile` 
- `Users can insert own profile`
- `Admins can view all users`
- `Admins can update all users`

## 2. 소셜 로그인 Provider 설정

### 2-1. Google 설정
1. **Google Cloud Console**에서 OAuth 2.0 클라이언트 생성
2. **승인된 리디렉션 URI**에 추가:
   ```
   https://kbhwwigbfxqsupycweve.supabase.co/auth/v1/callback
   http://localhost:3001/auth/callback
   ```
3. **Supabase 대시보드** → Authentication → Providers → Google 활성화
4. Client ID와 Client Secret 입력

### 2-2. Kakao 설정
1. **Kakao Developers**에서 애플리케이션 생성
2. **Redirect URI**에 추가:
   ```
   https://kbhwwigbfxqsupycweve.supabase.co/auth/v1/callback
   http://localhost:3001/auth/callback
   ```
3. **Supabase 대시보드** → Authentication → Providers → Kakao 활성화
4. REST API 키 입력

## 3. 환경 변수 확인

`.env.local` 파일에 다음이 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kbhwwigbfxqsupycweve.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. 테스트 방법

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 브라우저에서 테스트:
   - `http://localhost:3001/auth/login`
   - `http://localhost:3001/auth/signup`

3. 소셜 로그인 버튼 클릭 후:
   - OAuth 인증 완료
   - `/auth/callback`으로 리다이렉트
   - 사용자 정보가 `users` 테이블에 저장
   - `/dashboard`로 리다이렉트

## 5. 데이터베이스 확인

소셜 로그인 후 Supabase 대시보드에서:
1. **Table Editor** → `users` 테이블
2. 새로 생성된 사용자 레코드 확인
3. 다음 필드들이 올바르게 저장되었는지 확인:
   - `id` (UUID)
   - `email`
   - `nickname`
   - `provider` (google/kakao)
   - `is_verified`
   - `role` (기본값: user)
   - `plan` (기본값: free)

## 6. 문제 해결

### 6-1. 사용자 정보가 저장되지 않는 경우
1. RLS 정책 확인
2. `auth/callback/route.ts` 로그 확인
3. Supabase 로그 확인

### 6-2. 리디렉트 오류
1. Redirect URI 설정 확인
2. 환경 변수 확인
3. 포트 번호 확인 (개발: 3001, 배포: 실제 도메인)

### 6-3. 권한 오류
1. RLS 정책 재설정
2. 사용자 역할 확인
3. Supabase 프로젝트 설정 확인

## 7. 추가 기능

### 7-1. 사용자 프로필 업데이트
```typescript
import { updateUserProfile } from '@/lib/user';

const result = await updateUserProfile({
  nickname: '새 닉네임',
  avatar_url: '새 아바타 URL'
});
```

### 7-2. 현재 사용자 정보 가져오기
```typescript
import { getCurrentUser } from '@/lib/user';

const user = await getCurrentUser();
```

### 7-3. 게시글/댓글 카운트 증가
```typescript
import { incrementUserCounts } from '@/lib/user';

await incrementUserCounts(userId, 'post'); // 게시글 카운트 증가
await incrementUserCounts(userId, 'comment'); // 댓글 카운트 증가
``` 