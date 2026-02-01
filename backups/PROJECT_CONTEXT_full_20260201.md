# 커뮤니티 게시판 프로젝트 컨텍스트 (전체 백업)

> **백업 일시**: 2026-02-01
> **원본**: PROJECT_CONTEXT.md (Phase 2 완료 시점)

---

# 커뮤니티 게시판 프로젝트 컨텍스트

> 이 문서는 프로젝트의 현재 상태를 기록하여 지속적인 작업이 가능하도록 합니다.

---

## 1. 프로젝트 개요

- **프로젝트명**: community-board
- **목표**: 레딧 스타일 다크 테마 커뮤니티 게시판
- **생성일**: 2026-01-31

---

## 2. 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16.1.6 | App Router + Turbopack |
| React | 18.3.1 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 3.4.1 | 스타일링 |
| Supabase | 2.47.10 | 백엔드 (Auth + Database) |
| @supabase/ssr | 0.5.2 | 서버/클라이언트 세션 관리 |

---

## 3. Supabase 프로젝트 정보

| 항목 | 값 |
|------|-----|
| **프로젝트명** | `community-board` |
| **프로젝트 ID** | `.env.local` 또는 Supabase Dashboard에서 확인 |
| **URL** | `https://<your-project-ref>.supabase.co` |
| **리전** | 프로젝트 설정에 따름 |
| **Dashboard** | https://supabase.com/dashboard 에서 본인 프로젝트 선택 |

### 환경 변수 (.env.local)

> ⚠️ 실제 키는 `.env.local`에만 저장하고 Git에 커밋하지 마세요.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 4. 데이터베이스 스키마

### 4.1 profiles
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK, FK → auth.users) | 사용자 ID |
| display_name | text | 표시 이름 |
| avatar_url | text | 아바타 URL |
| role | text | `user` \| `admin` (기본: user) |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

- **RLS**: 본인만 SELECT/UPDATE
- **트리거**: `on_auth_user_created` → 가입 시 자동 생성

### 4.2 categories (신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 카테고리 ID |
| name | text | 표시 이름 |
| slug | text | URL용 식별자 |
| created_at | timestamptz | 생성일 |

- **RLS**: 전체 SELECT, 관리자만 INSERT/UPDATE
- **시드**: 자유게시판, 질문, 정보공유, 후기

### 4.3 posts
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 게시글 ID |
| user_id | uuid (FK → auth.users) | 작성자 ID |
| category_id | uuid (FK → categories) | 카테고리 (nullable) |
| title | text | 제목 |
| content | text | 내용 |
| is_hidden | boolean | 숨김 여부 (관리자용) |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

- **RLS**: is_hidden=false만 SELECT (본인/관리자 제외), INSERT 인증필요, UPDATE/DELETE 본인 또는 관리자
- **인덱스**: `created_at DESC`, `user_id`, `category_id`, `is_hidden`

### 4.4 comments
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 댓글 ID |
| post_id | uuid (FK → posts) | 게시글 ID |
| parent_id | uuid (FK → comments) | 부모 댓글 (대댓글용, nullable) |
| user_id | uuid (FK → auth.users) | 작성자 ID |
| content | text | 내용 |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

- **RLS**: 전체 SELECT, 인증 사용자 INSERT, 본인만 UPDATE/DELETE
- **인덱스**: `post_id`, `parent_id`

### 4.5 post_votes
| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_id | uuid (PK, FK → auth.users) | 투표자 ID |
| post_id | uuid (PK, FK → posts) | 게시글 ID |
| vote_type | smallint | 1(좋아요), -1(싫어요) |
| created_at | timestamptz | 생성일 |

- **RLS**: 전체 SELECT, 본인만 INSERT/UPDATE/DELETE
- **인덱스**: `post_id`

---

## 5. 프로젝트 구조

```
d:\cursor_book\30_community_board\
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃 (ThemeProvider + AppShell)
│   │   ├── page.tsx            # 홈 (글 목록)
│   │   ├── loading.tsx         # 홈 스켈레톤
│   │   ├── globals.css         # 다크 테마 CSS 변수
│   │   ├── login/
│   │   │   └── page.tsx        # 로그인 페이지
│   │   ├── signup/
│   │   │   └── page.tsx        # 회원가입 페이지
│   │   ├── write/
│   │   │   └── page.tsx        # 글쓰기 페이지
│   │   ├── search/
│   │   │   └── page.tsx        # 검색 페이지
│   │   ├── profile/
│   │   │   ├── page.tsx        # 내 정보 페이지
│   │   │   └── ProfileForm.tsx # 프로필 수정 폼
│   │   └── posts/
│   │       └── [id]/
│   │           ├── page.tsx        # 글 상세
│   │           ├── PostActions.tsx # 수정/삭제 버튼
│   │           ├── VoteButtons.tsx # 좋아요/싫어요
│   │           ├── CommentList.tsx # 댓글 목록/작성
│   │           └── edit/
│   │               └── page.tsx    # 글 수정 페이지
│   ├── components/
│   │   ├── Sidebar.tsx         # 사이드바 (반응형: 모바일 드로어)
│   │   ├── Header.tsx          # 헤더 (검색, 글쓰기, 테마 토글)
│   │   ├── AppShell.tsx        # 레이아웃 쉘 (모바일 메뉴 상태)
│   │   ├── ThemeToggle.tsx     # 다크/라이트 전환 버튼
│   │   ├── Skeleton.tsx        # 스켈레톤 기본 컴포넌트
│   │   ├── PostListSkeleton.tsx
│   │   └── PostDetailSkeleton.tsx
│   ├── lib/
│   │   ├── ThemeProvider.tsx   # 테마 컨텍스트
│   │   ├── utils.ts            # cn() 등 유틸
│   │   └── supabase/
│   │       ├── client.ts       # 클라이언트용 Supabase
│   │       ├── server.ts       # 서버용 Supabase
│   │       └── middleware.ts   # 세션 + 보호 라우트
│   └── middleware.ts           # Next.js 미들웨어
├── .env.local                  # Supabase 연결 정보
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── PROJECT_CONTEXT.md          # 이 문서
```

---

## 6. 구현된 기능

| 기능 | 경로 | 상태 | 설명 |
|------|------|------|------|
| 회원가입 | `/signup` | ✅ | 이메일/비밀번호 + 표시이름 |
| 로그인 | `/login` | ✅ | 이메일/비밀번호, redirect 지원 |
| 로그아웃 | 사이드바 | ✅ | 클라이언트에서 처리 |
| 글 목록 | `/` | ✅ | 최신순 20개 |
| 글쓰기 | `/write` | ✅ | 로그인 필요 |
| 글 상세 | `/posts/[id]` | ✅ | 작성자 표시, 수정됨 표시 |
| 글 수정 | `/posts/[id]/edit` | ✅ | 본인만 |
| 글 삭제 | 글 상세 페이지 | ✅ | 본인만 |
| 댓글 | 글 상세 페이지 | ✅ | 작성/목록 |
| 좋아요/싫어요 | 글 상세 페이지 | ✅ | upsert/delete |
| 글 검색 | `/search?q=` | ✅ | title, content ilike |
| 내 정보 | `/profile` | ✅ | 프로필 조회/수정, 내 글 목록 |

---

## 7. 인증 흐름

1. **회원가입**: `/signup` → `supabase.auth.signUp()` → 프로필 자동 생성 (트리거)
2. **로그인**: `/login` → `supabase.auth.signInWithPassword()`
3. **로그아웃**: 사이드바 버튼 → `supabase.auth.signOut()`
4. **보호 라우트**: `/write`, `/profile` → middleware에서 리다이렉트

---

## 8. 테마 시스템 (Phase 2)

### 다크/라이트 전환
- **globals.css**: `:root` (다크), `.light` (라이트) CSS 변수
- **ThemeProvider**: localStorage + `prefers-color-scheme` 기반 초기값
- **ThemeToggle**: 헤더 우측 해/달 아이콘 버튼
- 초기 로드 시 깜빡임 방지용 인라인 스크립트

### 반응형
- **md 이상**: 좌측 고정 사이드바(224px)
- **md 미만**: 햄버거 메뉴 → 슬라이드 드로어
- 메인 패딩: `p-4` (모바일), `p-6` (데스크톱)

### 스켈레톤 로딩
- `Skeleton`: 공통 펄스 애니메이션 컴포넌트
- `PostListSkeleton`, `PostDetailSkeleton`
- `loading.tsx`: `/`, `/search`, `/posts/[id]` Suspense 로딩 UI

---

## 9. 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 접속
http://localhost:3000
```

---

## 10. Supabase 추가 설정 (선택)

### 이메일 확인 비활성화 (테스트용)

1. Supabase Dashboard → Authentication → Providers → Email
2. "Confirm email" 토글 OFF
3. Save

---

## 11. Storage 버킷 (Phase 1)

| 버킷 | 용도 | public | 제한 |
|------|------|--------|------|
| avatars | 프로필 아바타 | O | 1MB, image/* |
| post-images | 게시글 이미지 | O | 5MB, image/* |

- **avatars**: `{user_id}/파일명` 경로로 본인만 업로드
- **post-images**: 인증 사용자 업로드 허용

---

## 12. 마이그레이션 이력

| 버전 | 이름 |
|------|------|
| 20260131152247 | community_board_profiles |
| 20260131152311 | community_board_posts_comments_votes |
| 20260201093907 | phase1_categories_roles_storage_nested_comments |
| 20260201093934 | phase1_storage_buckets |
| 20260201094018 | phase1_admin_posts_policies |

---

## 13. 향후 작업 시 참고사항

- **OAuth 미구현**: 요청에 따라 이메일/비밀번호만 사용
- **Phase 1 완료**: categories, role, is_hidden, parent_id, Storage 버킷, 관리자 정책
- **Phase 2 완료**: 테마 전환, 반응형, 스켈레톤 로딩

---

## 14. 주요 파일 요약

| 파일 | 역할 |
|------|------|
| `src/lib/supabase/client.ts` | 클라이언트 컴포넌트용 Supabase 클라이언트 |
| `src/lib/supabase/server.ts` | 서버 컴포넌트용 Supabase 클라이언트 |
| `src/lib/supabase/middleware.ts` | 세션 갱신 + 보호 라우트 처리 |
| `src/components/Sidebar.tsx` | 로그인 상태에 따라 메뉴 변경 |
| `src/app/posts/[id]/VoteButtons.tsx` | 좋아요/싫어요 로직 |

---

*마지막 업데이트: 2026-02-01 (Phase 2 UI 기반 완료)*
