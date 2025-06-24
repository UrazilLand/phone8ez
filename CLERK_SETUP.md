# Clerk 인증 시스템 설정 가이드 (최신 버전)

## 1. Clerk 계정 생성 및 설정

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 접속하여 계정을 생성합니다.
2. 새 애플리케이션을 생성합니다.
3. 애플리케이션 이름을 "Phone8ez"로 설정합니다.

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 추가하세요:

```env
# Clerk 환경 변수 (실제 키로 교체하세요)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### 키 값 찾는 방법:
1. Clerk Dashboard에서 애플리케이션을 선택
2. "API Keys" 섹션으로 이동
3. "Publishable Key"와 "Secret Key"를 복사하여 환경 변수에 붙여넣기

## 3. 구현된 기능

### ✅ 완료된 기능:
- **미들웨어**: `clerkMiddleware()` 사용
- **레이아웃**: `<ClerkProvider>` 래핑
- **헤더**: `<SignInButton>`, `<SignUpButton>`, `<UserButton>` 사용
- **대시보드**: `<SignedIn>`, `<SignedOut>`, `<RedirectToSignIn>` 사용
- **모달 기반 인증**: 별도 페이지 없이 모달로 로그인/회원가입

### 🔧 주요 컴포넌트:
- `src/middleware.ts`: Clerk 미들웨어 설정
- `src/app/layout.tsx`: ClerkProvider 래핑
- `src/components/layout/Header.tsx`: 인증 버튼들
- `src/app/dashboard/page.tsx`: 보호된 페이지

## 4. 소셜 로그인 설정 (선택사항)

### Google 로그인 설정:
1. Clerk Dashboard에서 "User & Authentication" > "Social Connections"로 이동
2. Google을 활성화
3. Google Cloud Console에서 OAuth 2.0 클라이언트 ID와 시크릿을 생성
4. Clerk에 클라이언트 ID와 시크릿을 입력

### 기타 소셜 로그인:
- GitHub, Discord, Twitter 등 다양한 소셜 로그인을 설정할 수 있습니다.

## 5. 이메일 템플릿 커스터마이징

1. Clerk Dashboard에서 "User & Authentication" > "Email Templates"로 이동
2. 각 이메일 템플릿을 한국어로 커스터마이징할 수 있습니다.

## 6. 보안 설정

1. **비밀번호 정책**: 최소 길이, 특수문자 요구사항 등 설정
2. **세션 관리**: 세션 만료 시간, 동시 로그인 제한 등 설정
3. **2FA 설정**: 이중 인증 활성화

## 7. 웹훅 설정 (선택사항)

사용자 이벤트를 외부 시스템에 전송하려면:
1. Clerk Dashboard에서 "Webhooks"로 이동
2. 엔드포인트 URL 설정 (예: `https://yourdomain.com/api/webhook/clerk`)
3. 필요한 이벤트 선택 (사용자 생성, 로그인 등)

## 8. 테스트

설정 완료 후 다음을 테스트하세요:
- [ ] 회원가입 기능 (모달)
- [ ] 로그인 기능 (모달)
- [ ] 로그아웃 기능
- [ ] 비밀번호 재설정
- [ ] 이메일 인증
- [ ] 소셜 로그인 (설정한 경우)
- [ ] 보호된 페이지 접근 제한

## 9. 프로덕션 배포

프로덕션 환경에서는:
1. 테스트 키를 프로덕션 키로 변경
2. 도메인을 Clerk Dashboard에 추가
3. HTTPS 설정 확인
4. 환경 변수를 서버에 설정

## 10. 주요 변경사항 (최신 버전)

### ✅ 올바른 구현:
- `clerkMiddleware()` 사용 (미들웨어)
- `<ClerkProvider>` 래핑 (레이아웃)
- `<SignInButton>`, `<SignUpButton>` 모달 사용
- `<SignedIn>`, `<SignedOut>` 조건부 렌더링

### ❌ 사용하지 않는 것:
- `authMiddleware()` (구버전)
- 별도 로그인/회원가입 페이지
- `_app.tsx` 또는 pages 구조

## 문제 해결

### 일반적인 문제:
1. **환경 변수 로드 안됨**: `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. **CORS 에러**: Clerk Dashboard에서 허용된 도메인 설정 확인
3. **모달이 열리지 않음**: Clerk 키가 올바르게 설정되었는지 확인

### 지원:
- [Clerk 공식 문서](https://clerk.com/docs)
- [Clerk Discord 커뮤니티](https://discord.gg/clerk) 