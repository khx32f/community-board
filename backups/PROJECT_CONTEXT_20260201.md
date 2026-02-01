# 커뮤니티 게시판 프로젝트 컨텍스트 (백업)

> **백업 일시**: 2026-02-01
> **백업 시점**: Phase 2 UI 기반 완료 직후

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

---

## 4. 구현 단계 요약 (5단계 계획)

| 단계 | 상태 | 내용 |
|------|------|------|
| **1단계** | ✅ 완료 | DB/인프라: categories, role, is_hidden, parent_id, Storage 버킷 |
| **2단계** | ✅ 완료 | UI 기반: 테마 전환, 반응형, 스켈레톤 로딩 |
| **3단계** | ⏳ 대기 | 핵심 기능: 아바타 업로드, 이미지 첨부, 카테고리 선택 |
| **4단계** | ⏳ 대기 | 댓글 강화: 댓글 수정/삭제, 대댓글, 실시간 댓글 |
| **5단계** | ⏳ 대기 | 고급: 무한 스크롤, 관리자 대시보드, 글 숨김/삭제 권한 |

---

## 5. DB 스키마 (Phase 1 반영)

### profiles
- id, display_name, avatar_url, **role** (user|admin), created_at, updated_at

### categories (신규)
- id, name, slug, created_at
- 시드: 자유게시판, 질문, 정보공유, 후기

### posts
- id, user_id, **category_id**, title, content, **is_hidden**, created_at, updated_at

### comments
- id, post_id, **parent_id** (대댓글), user_id, content, created_at, updated_at

### Storage 버킷
- avatars (1MB), post-images (5MB)

---

## 6. 마이그레이션 이력

| 버전 | 이름 |
|------|------|
| 20260131152247 | community_board_profiles |
| 20260131152311 | community_board_posts_comments_votes |
| 20260201093907 | phase1_categories_roles_storage_nested_comments |
| 20260201093934 | phase1_storage_buckets |
| 20260201094018 | phase1_admin_posts_policies |

---

## 7. 프로젝트 구조 (Phase 2 기준)

```
src/
├── app/
│   ├── layout.tsx, page.tsx, loading.tsx, globals.css
│   ├── login/, signup/, write/, search/, profile/
│   └── posts/[id]/ (page, loading, PostActions, VoteButtons, CommentList, edit/)
├── components/
│   ├── Sidebar, Header, AppShell, ThemeToggle
│   └── Skeleton, PostListSkeleton, PostDetailSkeleton
└── lib/
    ├── ThemeProvider, utils
    └── supabase/ (client, server, middleware)
```

---

## 8. 복원 시 참고

- `PROJECT_CONTEXT.md` 최신 버전이 프로젝트 루트에 있음
- 이 백업은 특정 시점 스냅샷으로, 참고용
