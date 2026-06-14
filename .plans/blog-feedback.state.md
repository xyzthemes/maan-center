# Effort: blog-feedback — State Ledger

**Read first, update last, every session.** Ground truth for resumption.
Plan: `blog-feedback.md` · Briefs: `blog-feedback.sessions.md` ·
Protocol: `~/.claude/skills/effort-run/PROTOCOL.md`.

## Next up: C3 (Phase 3 checkpoint review)

## Session checklist

### Phase 1 — Critical bugs · branch `blog-feedback/p1-bugs` (from `main`)
- [x] S1 — Fix detail-page freeze + dedicated single-post API
- [x] S2 — Pagination / "Load More"
- [x] **C1** checkpoint review — **APPROVE** (lint+build re-verified green; code review clean; no prod-safety changes). Live UI smoke un-run: dev DB is Fly Postgres reachable only via `fly proxy` tunnel (not available here) → added to Human-verification checklist below.

### Phase 2 — Editor · branch `blog-feedback/p2-editor` (from p1 head)
- [x] S3 — Insert link + font sizing
- [x] S4 — Attachment (PDF) + media upload & insert
- [x] S5 — Auto-save drafts
- [x] **C2** checkpoint review — **APPROVE** (lint+build+frozen-install green; public article renders media via raw `v-html`/no sanitizer; XSS-escaped inserts; auto-save guards sound; 2 new TipTap deps pinned + lockfile clean; no prod-safety/schema changes). Non-blocking follow-ups: (a) upload trusts client MIME, no magic-byte sniff — bounded to authed editors, future hardening; (b) auto-save fires success toast every cycle — cosmetic, suppress in follow-up. Live UI smoke → Human-verification checklist.

### Phase 3 — Dynamic categories · branch `blog-feedback/p3-categories` (from p2 head)
- [x] S6 — Category model + migration + seed
- [x] S7 — Category CRUD API + DB-backed validation
- [x] S8 — Category management UI + wire selects
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
- 2026-06-14 (S1/S2 agent): committed `.plans/` and `.codegraph/` into branch
  `p1-bugs` (protocol treats these as untracked working files). CLEANUP AT PR
  ASSEMBLY (C7): add both to `.gitignore` and drop from the stack, or filter
  from the final PR so they don't ship. Not worth rewriting stacked history now.

## Human-verification checklist (live smoke; needs `fly proxy` DB tunnel + `pnpm dev`)
_Live UI smoke can't run in the agent environment (Fly Postgres unreachable without the tunnel). Run these before merging the final PR:_
- [ ] Phase 1: `/blog` + `/ar/blog` show >6 posts with working "Load More" to the end; a post ranked >6th opens (no freeze); an Arabic post opens; `/blog/does-not-exist` → clean 404.
- [ ] Phase 2: editor link add/edit/remove + font-size persist on the public article; PDF upload → inserted download link works; mp4/mp3 embed plays on the public article; oversized (>cap) + unknown-MIME upload rejected with clear message; auto-save fires ONE PATCH on pause (no storm while typing) + new post gains id & URL updates once.

## Handoff log (newest first)

### S8 — Category management UI + wire selects (2026-06-14, branch p3-categories)
- New page `app/pages/dashboard/categories/index.vue`: list + create/edit/delete
  via S7 routes; inline UModal CRUD (matches staff/blocks house style), bilingual
  EN/AR, RTL-safe (`dir` on slug/name inputs). Sidebar nav entry added in
  `dashboard.vue` (`i-lucide-tags`, scope `posts`, EN+AR `to`).
- New composable `app/composables/useCategories.ts`: cached `useState` list +
  `loadCategories`/create/update/delete; degrade-gracefully (fetch failure → empty
  list + error, never throws). Exports `categoryOptionsFor` + `labelForCategorySlug`
  (slug fallback). Types reuse `DashboardCategoryShape` from dashboard-shapes.
- Wired both selects off the DB list: `PostEditorForm.vue` `categoryOptions` (now
  `useCategories` + orphan-slug appended so deleted-category selections stay
  visible) and `posts/index.vue` `categoryFilterOptions` (`categoryOptionsFor`);
  chip label already fell back to raw slug. PLACEMENTS untouched (still
  `useMaanTaxonomy`). `useMaanTaxonomy.ts` itself unchanged.
- i18n: ~24 new keys (category mgmt + generic edit/delete) in BOTH locale blocks.
- Verify: `pnpm lint` clean (1 auto-fix), `pnpm build` green (categories route
  chunk emitted).
- Deferred to C3 (DB unreachable here): live CRUD create/rename/delete reflects in
  editor select + list filter + public list; delete a category in use → post keeps
  slug + shows raw-slug label (orphan path); new category appears immediately.
- No deviations.

### S7 — Category CRUD API + DB-backed validation (2026-06-14, branch p3-categories)
- Routes `server/api/dashboard/categories/`: `index.get` (list, sort/nameEn),
  `index.post` (create; P2002→409), `[id].patch` (update; P2025→404/P2002→409),
  `[id].delete` (non-cascading; P2025→404). All gated `requirePermission(event,
  'posts')`. Envelopes mirror posts routes (`{ categories }` / `{ data }` /
  `{ success }`). Added `Category` to `db/types.ts` + `toDashboardCategory`
  (snake_case `name_en/name_ar`) in `dashboard-shapes.ts`.
- New util `server/utils/category-validation.ts`: `getValidCategorySlugs(event)`
  (per-request cache on `event.context`) + `sanitizeCategoriesDb(event, raw)` —
  DB-backed, async, DROPS unknown slugs (same defensive contract as old static
  `sanitizeCategories`).
- Swapped call sites (grep `isPostCategory`+`sanitizeCategories`):
  1. `server/api/public/posts.get.ts` — `category` filter param now validated
     via `getValidCategorySlugs` (new `flattenParam` for raw parse). Dropped the
     `isPostCategory` import. PLACEMENTS unchanged (`isPostPlacement` kept).
  2. `server/api/dashboard/posts/index.post.ts` — `await sanitizeCategoriesDb`
     hoisted before `prisma.post.create`. Dropped `sanitizeCategories` import.
  3. `server/api/dashboard/posts/[id].patch.ts` — `await sanitizeCategoriesDb`
     hoisted before `prisma.post.update`. Dropped `sanitizeCategories` import.
  Untouched: `useMaanTaxonomy.ts` defs (still the label source for S8) +
  `PostEditorForm.vue:36` (comment only — refreshed wording). `sanitizePlacements`
  /`isPostPlacement` left static everywhere.
- Verify: `pnpm lint` clean, `pnpm build` green (4 category route chunks emitted).
- Deferred to C3 (DB unreachable here): live CRUD (create/rename/delete via curl
  or UI); create a post with a DB-only category slug → persists; filter public
  list by a DB category; delete a category in use → post keeps slug, next save
  drops it; unknown slug in filter param → ignored.
- No deviations.

### S6 — Category model + migration + seed (2026-06-14, branch p3-categories)
- `content.prisma`: added `Category { id, slug @unique, nameEn, nameAr, sort?,
  createdAt, updatedAt }`. `Post.categories String[]` + GIN index UNTOUCHED.
- Migration `prisma/migrations/20260614174515_add_category/migration.sql`:
  ADDITIVE only — `CREATE TABLE "Category"` + unique slug index + idempotent
  seed `INSERT ... ON CONFLICT ("slug") DO NOTHING` for the 6 taxonomy slugs
  (autism, down-syndrome, learning-difficulties, family-support, assessment,
  therapy) with EN/AR names + sort 1-6, deterministic `cat_*` ids. Does NOT
  alter `Post`. Safe to re-run under the Fly `release_command` migrate deploy.
- NOT applied locally (dev DB unreachable — Fly Postgres needs `fly proxy`).
  `pnpm db:generate` run → generated client now exports `prisma.category`.
- Local/dev seed: new standalone `prisma/seed-categories.ts` +
  `db:seed:categories` script (idempotent upsert by slug). Deviation: did NOT
  extend `prisma/seed.ts` — it is HISTORICAL/Directus-coupled and documents
  "do not extend"; a separate script is the correct equivalent.
- Verify: `pnpm db:generate` OK, `pnpm lint` clean, `pnpm build` green
  (Category present in generated client).
- Deferred to C3 (DB unreachable here): confirm migration applies on a fresh
  DB; 6 seed rows present after deploy; existing posts' slugs still resolve.

### S5 — Auto-save drafts (2026-06-14, branch p2-editor)
- `usePostForm.ts`: added opt-in `enableAutoSave()` + reactive `autoSaveStatus`
  ('idle'|'saving'|'saved'|'error'). Debounced 2.5s watcher on
  `JSON.stringify(postForm)` → `runAutoSave` calls existing `savePost`.
  Guards: skips while `isSaving` (no overlap); a `suspendAutoSave` flag (set via
  `withSuspendedAutoSave`) wraps `editPost`/`newPost` and the save itself so
  programmatic/load/id-mutation changes don't arm a save (no storm on open, no
  self-trigger loop). New posts need a non-empty title before the first save,
  then auto-save thereafter. `onScopeDispose` clears the pending timer.
- `dashboard/posts/[id].vue`: `onMounted(enableAutoSave)` (client-only; list page
  deliberately does NOT enable it); watch `postForm.id` → replace URL /new→/:id
  after first auto-save; passes `:auto-save-status` to the form.
- `PostEditorForm.vue`: new optional `autoSaveStatus` prop → bilingual indicator
  (Saving…/Saved/Error, role=status aria-live) beside the Save/Clear buttons.
- `useDashboardI18n.ts`: added autoSaving/autoSaved/autoSaveError (EN + AR).
- Verify: `pnpm lint` clean, `pnpm build` green.
- Deferred to C2: live smoke — edit existing post, pause → ONE PATCH + indicator
  Saving→Saved, no storm while typing; new post gains id + URL updates once.
  WATCH at C2: each auto-save also fires the existing saveSuccess toast (could be
  noisy every cycle) — consider suppressing the toast for auto- vs manual save.
- No deviations.

### S4 — Attachment + media upload & insert (2026-06-14, branch p2-editor)
- `upload.post.ts`: replaced flat ALLOWED_MIME/EXT map with one `FILE_SPEC`
  table (MIME → {ext, maxBytes}); caps images 5 MB / docs 25 MB / A/V 50 MB.
  Added pdf, doc/docx, xls/xlsx, ppt/pptx, txt, csv, video/{mp4,webm,ogg,mov},
  audio/{mp3,ogg,wav,webm}. Auth guard (requireAnyPermission) + size checks
  intact; unknown MIME still 400-rejected. Response now also returns
  contentType (consumed by editor to branch insert).
- `DashboardEditor.vue`: hidden file input now serves 3 kinds (image/file/media)
  via `pendingKind` + dynamic `accept`; added `file` (paperclip) and `media`
  (clapperboard) toolbar handlers reusing the upload flow. Inserts escaped
  `<a download class="maan-attachment">` for docs, `<video>`/`<audio>` for media.
- StarterKit has no media nodes, so inserted <video>/<audio> would be stripped on
  parse → added minimal `Video`/`Audio` TipTap `Node.create` extensions (added
  direct dep `@tiptap/core@3.22.4`) so embeds round-trip in saved HTML.
- escapeHtml() applied to url/filename before raw insertContent (XSS guard).
- Verify: `pnpm lint` clean, `pnpm build` green.
- Deferred to C2: live smoke — upload PDF → click inserted download link; embed a
  small mp4 + mp3 and confirm playback on the public article; oversized/unknown
  type rejected with clear message. NOTE public render must allow the media tags
  (article uses v-html of stored HTML — confirm at C2).
- No deviations.

### S3 — Insert link + font sizing (2026-06-14, branch p2-editor)
- R4 finding: `link` IS a built-in UEditor handler (default StarterKit) — added
  `{ kind: 'link', icon: 'i-lucide-link' }` to the toolbar, no dep. Font size is
  NOT exposed; added one direct dep `@tiptap/extension-text-style@3.22.4`
  (pinned to installed @tiptap core ver) and registered `[TextStyle, FontSize]`
  via UEditor `:extensions`. Both are SSR-safe schema extensions.
- `DashboardEditor.vue`: wrapped toolbar in a flex row + a `USelectMenu`
  font-size dropdown (Default/Small/Normal/Large/X-Large/Heading) calling
  `applyFontSize` → `chain().setFontSize(px)`/`unsetFontSize()`. Inserts inline
  `style="font-size:…"` on selection; renders on the public article HTML.
- Did NOT touch nuxt.config: TextStyle/FontSize add no prosemirror plugin, build
  green, so the documented `optimizeDeps.include` keyed-plugin mitigation isn't
  needed. Watch at C2 smoke just in case.
- Verify: `pnpm lint` clean, `pnpm build` green.
- Deferred to C2: live smoke — add/edit/remove a link, resize text, save, view
  on public article (link href + inline font-size persist).
- No deviations.

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
