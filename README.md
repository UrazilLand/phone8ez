# Phone8ez

모바일 폰 판매 전문가를 위한 구독형 지원 플랫폼

## 주요 기능

- DCinside 스타일 커뮤니티 게시판
- 자동화된 Excel 데이터 분석
- 구독 기반 대시보드
- 다크 모드 지원
- Supabase 기반 인증 시스템

## 기술 스택

- Frontend: Next.js (App Router), React, TypeScript, TailwindCSS
- Backend: Supabase (PostgreSQL)
- Auth: Supabase Auth (이메일/비밀번호)
- 기타: zod, react-hook-form, react-hot-toast

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
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase 서비스 롤 키 (서버 사이드에서만 사용)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성하세요.
2. 프로젝트 설정에서 URL과 API 키를 복사하세요.
3. Authentication > Settings에서 이메일 템플릿을 한국어로 설정하세요.
4. `.env.local` 파일에 환경변수를 설정하세요.

### 주요 특징:
- ✅ 이메일/비밀번호 로그인/회원가입
- ✅ 이메일 인증
- ✅ 비밀번호 재설정
- ✅ 보안된 라우트 보호
- ✅ 한국어 UI 지원

## 라이선스

MIT
