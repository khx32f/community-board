# 작업 Context 요약 — 에이전트 전달용

> 새로운 에이전트가 이어서 작업할 수 있도록 현재 상태를 요약합니다.

---

## 1. 프로젝트 개요

- **프로젝트명**: community-board
- **목표**: 레딧 스타일 다크 테마 커뮤니티 게시판
- **스택**: Next.js 16, React 18, TypeScript, Tailwind, Supabase (Auth + DB + Storage)
- **상태**: 5단계 구현까지 완료

---

## 2. Supabase 연결 정보

| 항목 | 값 |
|------|-----|
| 프로젝트 ID | `.env.local` 또는 Supabase Dashboard에서 확인 |
| URL | `https://<your-project-ref>.supabase.co` |
| Dashboard | https://supabase.com/dashboard 에서 본인 프로젝트 선택 |

- 환경 변수: `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정

---

## 3. DB 스키마 요약

| 테이블 | 주요 컬럼 |
|--------|-----------|
| **profiles** | id, display_name, avatar_url, role(user\|admin) |
| **categories** | id, name, slug |
| **posts** | id, user_id, category_id, title, content, is_hidden |
| **comments** | id, post_id, parent_id(대댓글), user_id, content |
| **post_votes** | user_id, post_id, vote_type(1/-1) |

---

## 4. 구현 완료 기능 (5단계)

| 단계 | 내용 |
|------|------|
| **1** | categories, profiles.role, posts.is_hidden, comments.parent_id, Storage(avatars, post-images), 관리자 RLS |
| **2** | 다크/라이트 테마, 반응형(모바일 메뉴), 스켈레톤 로딩 |
| **3** | 아바타 업로드, 게시글 이미지 첨부, 카테고리 선택/필터 |
| **4** | 댓글 수정/삭제, 대댓글, 실시간 댓글(Realtime) |
| **5** | 무한 스크롤, 관리자 대시보드(/admin), 글 숨김/삭제 권한 |

---

## 5. 주요 경로

| 경로 | 설명 |
|------|------|
| `/` | 홈 (글 목록, 무한 스크롤, 카테고리 필터) |
| `/posts/[id]` | 글 상세 (댓글/대댓글, 수정/삭제/숨기기) |
| `/write` | 글쓰기 |
| `/search?q=` | 검색 |
| `/profile` | 내 정보 (아바타 업로드) |
| `/admin` | 관리자 대시보드 (role=admin만) |

---

## 6. 핵심 파일

| 파일 | 역할 |
|------|------|
| `src/lib/supabase/client.ts` | 클라이언트 Supabase |
| `src/lib/supabase/server.ts` | 서버 Supabase |
| `src/lib/supabase/middleware.ts` | 세션 + 보호 라우트 |
| `src/app/admin/page.tsx` | 관리자 대시보드 |
| `src/app/posts/[id]/CommentList.tsx` | 댓글/대댓글/Realtime |
| `src/components/PostListInfinite.tsx` | 무한 스크롤 |

---

## 7. 관리자 설정

```sql
UPDATE profiles SET role = 'admin' WHERE id = '사용자_UUID';
```

---

## 8. 실행 방법

```bash
npm install
npm run dev
# http://localhost:3000
```

---

## 9. 미구현/향후 고려사항

- OAuth (소셜 로그인)
- 관리자용 카테고리 UI (현재 DB 직접 수정)
- 사용자 차단/신고 등

---

## 10. 참고 문서

- **PROJECT_CONTEXT.md** — 전체 상세 컨텍스트
- **docs/ADMIN_MANUAL.md** — 관리자 매뉴얼
- **backups/** — 이전 백업 파일

---

*작성일: 2026-02-01*
