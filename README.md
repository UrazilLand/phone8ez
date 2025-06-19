# Phone8ez

모바일 폰 판매 전문가를 위한 구독형 지원 플랫폼

## 주요 기능

- DCinside 스타일 커뮤니티 게시판
- 자동화된 Excel 데이터 분석
- 구독 기반 대시보드
- 다크 모드 지원

## 기술 스택

- Frontend: Next.js (App Router), React, TypeScript, TailwindCSS
- Backend: NeonDB (PostgreSQL), Drizzle ORM
- Auth: NextAuth (이메일/비밀번호 + 소셜 로그인)
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
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## 라이선스

MIT
