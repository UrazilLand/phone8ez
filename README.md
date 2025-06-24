# Phone8ez

모바일 폰 판매 전문가를 위한 구독형 지원 플랫폼

## 주요 기능

- DCinside 스타일 커뮤니티 게시판
- 자동화된 Excel 데이터 분석
- 구독 기반 대시보드
- 다크 모드 지원
- Clerk 기반 인증 시스템 (모달 기반)

## 기술 스택

- Frontend: Next.js (App Router), React, TypeScript, TailwindCSS
- Backend: NeonDB (PostgreSQL), Drizzle ORM
- Auth: Clerk (이메일/비밀번호 + 소셜 로그인, 모달 기반)
- 기타: zod, react-hook-form, react-hot-toast, Cloudinary

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Clerk 인증 시스템
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

## Clerk 설정

Clerk 인증 시스템 설정에 대한 자세한 가이드는 [CLERK_SETUP.md](./CLERK_SETUP.md)를 참조하세요.

### 주요 특징:
- ✅ 모달 기반 로그인/회원가입
- ✅ 소셜 로그인 지원
- ✅ 보안된 라우트 보호
- ✅ 한국어 UI 지원

## 라이선스

MIT
