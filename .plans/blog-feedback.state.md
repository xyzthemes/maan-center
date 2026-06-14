# Effort: blog-feedback — State Ledger

**Read first, update last, every session.** Ground truth for resumption.
Plan: `blog-feedback.md` · Briefs: `blog-feedback.sessions.md` ·
Protocol: `~/.claude/skills/effort-run/PROTOCOL.md`.

## Next up: C1 (checkpoint review)

## Session checklist

### Phase 1 — Critical bugs · branch `blog-feedback/p1-bugs` (from `main`)
- [x] S1 — Fix detail-page freeze + dedicated single-post API
- [x] S2 — Pagination / "Load More"
- [ ] **C1** checkpoint review

### Phase 2 — Editor · branch `blog-feedback/p2-editor` (from p1 head)
- [ ] S3 — Insert link + font sizing
- [ ] S4 — Attachment (PDF) + media upload & insert
- [ ] S5 — Auto-save drafts
- [ ] **C2** checkpoint review

### Phase 3 — Dynamic categories · branch `blog-feedback/p3-categories` (from p2 head)
- [ ] S6 — Category model + migration + seed
- [ ] S7 — Category CRUD API + DB-backed validation
- [ ] S8 — Category management UI + wire selects
- [ ] **C3** checkpoint review

### Phase 4 — Live preview · branch `blog-feedback/p4-preview` (from p3 head)
- [ ] S9 — Draft live preview
- [ ] **C4** checkpoint review

### Phase 5 — Search & filter · branch `blog-feedback/p5-search` (from p4 head)
- [ ] S10 — Search bar + category filter on blog index
- [ ] **C5** checkpoint review

### Phase 6 — Performance · branch `blog-feedback/p6-perf` (from p5 head)
- [ ] S11 — Server-side WebP on upload (sharp)
- [ ] S12 — @nuxt/image + responsive + mobile/RTL audit
- [ ] **C6** checkpoint review

### Phase 7 — Related + social · branch `blog-feedback/p7-related-social` (from p6 head)
- [ ] S13 — Related posts by category
- [ ] S14 — Social share buttons
- [ ] **C7** final checkpoint + assemble PR

## Open questions — RESOLVED to recommendations (autonomous run, 2026-06-14)
- [x] Q1 — `Post.locale` column → **deferred**; Phase-1 in-memory pagination.
- [x] Q2 — Pagination UX → **Load More** button.
- [x] Q3 — Attachment caps → **25 MB docs / 50 MB video** (images stay 5 MB).
- [x] Q4 — Preview → **authenticated dashboard route** `/dashboard/posts/[id]/preview`.

## Deviations
- 2026-06-14 (orchestrator): Q1–Q4 locked to their recommended options for the
  autonomous run rather than pausing for the user. Reversible if the user
  objects at the final PR.

## Handoff log (newest first)

### S2 — Pagination / "Load More" (2026-06-14, branch p1-bugs)
- `public/posts.get.ts`: accepts `page` (1-based) + `offset` escape hatch; DB
  `take` window 200 → 500; locale-filters in-memory, returns `{ posts, total }`
  for the page slice. Category/placement filters intact; legacy `limit` is now
  the per-page size. Default first view stays 6.
- `useMaanContent.ts`: added `page?` to `GetPostsOptions`; `getPosts` threads
  `page` (return shape unchanged — all legacy callers safe). New sibling
  `getPostsPage(locale, opts) → { posts, total }` (no fallback array, so an
  empty published list reads as total 0). Exported it.
- `blog/index.vue` + `ar/blog/index.vue`: initial SSR page via `getPostsPage`
  (PAGE_SIZE 6); reactive `posts`/`total`/`page`; "Load More" UButton appends the
  next page, hidden when `posts.length >= total`. AR label localized + RTL-safe.
- Confirmed legacy `getPosts` call sites unchanged: homepage featured/items,
  programs related, blog [slug] related — no regression to placement queries.
- Verify: `pnpm lint` clean, `pnpm build` green.
- Deferred to C1: dev smoke — seed >6 posts/locale, page to the end in both locales.
- No deviations.

### S1 — detail-page freeze + dedicated single-post API (2026-06-14, branch p1-bugs)
- Added `server/api/public/posts/[slug].get.ts`: `findUnique` by slug, 400 if
  missing param, clean 404 unless `status === 'published'`; returns `{ post }`
  shaped like `PublicPostListItem` (type imported from `../posts.get`).
- Rewrote `getPostBySlug` (`useMaanContent.ts`) to `$fetch` that route directly
  (dropped the `getPosts(locale)` dependency — the freeze cause); maps via
  existing `toMaanPost(res.post, locale)`; returns `undefined` on 404.
- `blog/[slug].vue`: now passes `'en'` to `getPostBySlug` (was defaulting). AR page
  already passed `'ar'` + had the 404 guard — confirmed, left as-is.
- S1d symmetry confirmed: EN related uses `getPosts('en')`, AR uses `getPosts('ar')`
  — each page references its own locale. Correct; no change.
- Verify: `pnpm lint` clean, `pnpm build` green (new `posts/_slug_.get` chunk emitted).
- Deferred to C1: dev-server UI smoke (>6th-ranked post, AR post, non-existent slug).
- No deviations.
```
