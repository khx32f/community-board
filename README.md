# 커뮤니티 게시판 (Community Board)

레딧 스타일 다크 테마 커뮤니티 게시판입니다.

## 기술 스택

- Next.js 16 (App Router + Turbopack)
- React 18, TypeScript, Tailwind CSS
- Supabase (Auth, Database, Storage)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local.example`을 참고하여 `.env.local` 파일을 생성하세요.

```bash
cp .env.local.example .env.local
```

`.env.local`에 다음 값을 설정합니다 (Supabase Dashboard → Settings → API에서 확인):

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> ⚠️ `.env.local`은 Git에 커밋하지 마세요. 이미 `.gitignore`에 포함되어 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 4. 빌드 및 프로덕션

```bash
npm run build
npm start
```

## 주요 문서

- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — 프로젝트 전체 컨텍스트
- [docs/ADMIN_MANUAL.md](./docs/ADMIN_MANUAL.md) — 관리자 매뉴얼

## 배포 (Vercel)

1. GitHub에 푸시
2. Vercel에서 프로젝트 연결
3. 환경 변수 설정: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Supabase Dashboard → Authentication → URL Configuration에서 Site URL 및 Redirect URLs 추가
