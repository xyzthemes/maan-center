# Effort: blog-feedback — State Ledger

**Read first, update last, every session.** Ground truth for resumption.
Plan: `blog-feedback.md` · Briefs: `blog-feedback.sessions.md` ·
Protocol: `~/.claude/skills/effort-run/PROTOCOL.md`.

## Next up: C7 (Phase 7 — final checkpoint + assemble PR)

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
- [x] **C3** checkpoint review — REQUEST CHANGES → fixed (S8-fix `70ee108`) → **APPROVE on re-review**. Finding: `/dashboard/categories` was missing from `URL_TO_SCOPE` (page shell reachable by non-`posts` staff; server routes always gated → no data leak). Migration verified additive + schema-matched; validation/CRUD/auth/graceful-degradation clean; lint+build+frozen-install green.

### Phase 4 — Live preview · branch `blog-feedback/p4-preview` (from p3 head)
- [x] S9 — Draft live preview
- [x] **C4** checkpoint review — **APPROVE** (lint+build green; no deps/CI/schema changes). Security PASS: preview is auth-gated under dashboard middleware, fetches drafts via `/api/dashboard/posts`, no public/token leak; public published-post API unchanged. EN refactor (BlogArticleBody) no regression. AR-parity gap MINOR/acceptable (preview is a simplified render; body+RTL mirror published). Optional follow-up: pass AR locale to the date in `BlogArticleBody.vue`. Live smoke → Human-verification checklist.

### Phase 5 — Search & filter · branch `blog-feedback/p5-search` (from p4 head)
- [x] S10 — Search bar + category filter on blog index
- [x] **C5** checkpoint review — **APPROVE** (lint+build green; no dep/CI/schema changes). `q` is parameterized Prisma `contains` (no injection); `status:'published'` always enforced (no draft leak); `total` correct under q/category/locale/pagination combos; new public `categories.get.ts` exposes only slug+names; `take:500` window is a documented/acceptable limit (R2/Q1). Live smoke → Human-verification checklist.

### Phase 6 — Performance · branch `blog-feedback/p6-perf` (from p5 head)
- [x] S11 — Server-side WebP on upload (sharp)
- [x] S12 — @nuxt/image + responsive + mobile/RTL audit
- [x] **C6** checkpoint review — **APPROVE**. **R1 CLEARED via real `docker build` (linux/amd64): image builds, `sharp 0.35.1`/libvips ships as `@img/sharp-linux-x64` in the runner's fresh prod install.** Conversion gated to images only (alpha preserved, GIF passthrough), auth+size-cap before sharp; `@nuxt/image` config coherent (Tigris allow-listed); lint+build+frozen-install green; Dockerfile/CI/schema unchanged. LOW follow-up: wrap `sharp().toBuffer()` (upload.post.ts:102) in try/catch → corrupt image returns 4xx not 500. Live image smoke → Human-verification checklist.

### Phase 7 — Related + social · branch `blog-feedback/p7-related-social` (from p6 head)
- [x] S13 — Related posts by category
- [x] S14 — Social share buttons
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
- [ ] Phase 4: as a logged-in editor, open a `draft` and an `in_review` post's preview (`/dashboard/posts/<id>/preview`) → renders in the real public article layout (hero + prose); AR post previews RTL; confirm `/blog/<slug>` still returns a clean 404 for that unpublished draft (no public leak); confirm the published `/blog/<slug>` page is visually unchanged after the shared-component refactor.
- [ ] Phase 5: `/blog` + `/ar/blog` — type a title fragment → list narrows (debounced) + "Load More" still pages to the filtered end; pick a category → narrows + options match admin-managed categories; q+category combined → correct `total`/Load-More; a no-match query shows the empty state; AR inputs are RTL with Arabic labels; clearing filters restores the default 6 + Load More.
- [ ] Phase 6: upload a large JPEG/PNG → stored object is a smaller `.webp` + URL returned; PNG transparency round-trips; GIF stays animated GIF; blog hero images render via `<NuxtImg>` with responsive `srcset` + lazy in the DOM; blog detail reads well on a phone viewport in LTR + AR/RTL (eyeball long AR titles at 320px).
- [ ] Phase 3: `prisma migrate deploy` applies `add_category` on a fresh/staging DB + 6 seed rows present; existing posts' slugs still resolve to labels; category CRUD reflects in editor select + list filter + public `?category=` filter; deleting an in-use category → post keeps slug + shows raw-slug fallback; creating a post with a DB-only category persists. (Run `pnpm db:seed:categories` locally if seeding a dev DB by hand.)

## Handoff log (newest first)

### S14 — Social share buttons (2026-06-14, branch p7-related-social)
- New `app/components/BlogShareButtons.vue`: locked platforms via static
  share-intent URLs — X (`twitter.com/intent/tweet`), LinkedIn
  (`linkedin.com/sharing/share-offsite`), Telegram (`t.me/share/url`), Pinterest
  (`pinterest.com/pin/create/button` + optional `media` from post image), all
  `target="_blank" rel="noopener noreferrer"`, `encodeURIComponent` on url/title/
  image, per-platform aria-labels, `i-simple-icons-*` icons (verified present in
  the bundled @iconify-json/simple-icons). Instagram = NO web intent → gradient
  "copy link" button: `navigator.clipboard` guarded `import.meta.client`, 2s
  "Link copied!" confirmation. Bilingual EN/AR labels; flex-wrap row inherits the
  global RTL dir from `app.vue` (no per-component dir needed).
- Absolute URL SSR-safe via `useRequestURL().origin` (server reads request origin,
  client reads window) → no hardcoded domain; relative `url` prop resolved against
  it, absolute URLs passed through.
- Wired on BOTH detail pages, REPLACING the old `MaanArticleShare` (WhatsApp/FB) at
  the same spot: EN via `BlogArticleBody`'s `#body-footer` slot, AR via its inline
  share block. Both pass `:image="post.image"` for Pinterest media. `MaanArticleShare`
  left in the repo (no longer referenced by blog detail pages) — remove at C7 if desired.
- Dashboard preview (`posts/[id]/preview.vue`) uses `BlogArticleBody` but supplies
  its OWN slot content (no share row) → preview unaffected, no clipboard/SSR crash.
- Verify: `pnpm lint` clean, `pnpm build` green. No deps/CI/schema changes.
- Deferred to C7: live smoke — each intent opens with correct url+title; Instagram
  copies link + toast; EN + AR/RTL.
- No deviations.

### S13 — Related posts by category (2026-06-14, branch p7-related-social)
- `MaanPost` now carries optional `categories?: string[]`; `toMaanPost` maps
  `p.categories ?? []` (the API already returns it). Additive — no caller breaks.
- Both detail pages (`blog/[slug].vue`, `ar/blog/[slug].vue`) replaced naive
  "first 3" related with: if current post has categories → `getPosts(locale,
  { category: cats.join(','), limit: 4 })` (CSV → API `flattenParam` → `hasSome`,
  multi-category dedup is automatic server-side), exclude self, take 3; FALL BACK
  to `getPosts(locale, { limit: 4 })` latest when no cats or zero matches. `limit:4`
  so excluding self still yields 3. Each page uses its OWN locale (en/ar) — no
  hardcoded-locale regression. SSR-safe via existing `useAsyncData`.
- EN renders through `BlogArticleBody`'s `#aside` (unchanged markup); AR through its
  inline aside (unchanged markup) — only SELECTION logic + data source changed.
- Verify: `pnpm lint` clean, `pnpm build` green. No deps/CI/schema changes.
- Deferred to C7 (DB unreachable here): live smoke — related are topical + right
  locale, exclude self, fall back to latest when no category match.
- No deviations.

### S12 — @nuxt/image + responsive + mobile/RTL audit (2026-06-14, branch p6-perf)
- `pnpm add -D @nuxt/image` → 2.0.0; registered in `nuxt.config.ts` modules.
  Added `image: { domains: ['fly.storage.tigris.dev'], screens: {...} }` so the
  default IPX provider may transform remote Tigris blog images. SSR-safe.
- Swapped `<img>` → `<NuxtImg>` (sizes="100vw md:768px lg:760px", format="webp",
  loading="lazy") on the two blog HERO images: shared
  `app/components/BlogArticleBody.vue` (EN public + dashboard preview) and the
  AR detail page `app/pages/ar/blog/[slug].vue` (it has its own hero, not the
  shared component). Inline `<img>` inside post body `v-html` left as-is.
- FINDING: the blog INDEX pages (`blog/index.vue`, `ar/blog/index.vue`) have NO
  card images — they're text-only cards (badge + title + excerpt). Nothing to
  swap there despite the brief mention.
- Mobile/RTL audit: RTL is handled GLOBALLY in `app/app.vue`
  (`htmlAttrs.dir='rtl'` + `<UApp :dir>` for any `/ar` route) — AR detail page
  inherits it correctly, no per-page `dir` needed. Hero/prose spacing
  (`py-14 sm:py-20`, `text-4xl sm:text-5xl`) is consistent + reasonable on
  mobile; no obvious defects → no speculative changes. Human checklist item:
  eyeball long AR titles at 320px (text-4xl could be tight).
- R1 follow-up note for C6: `pnpm build` prints "[@nuxt/image] sharp binaries
  included for darwin-arm64 — deploy to same architecture." NOT a real risk:
  the Docker runner re-runs `pnpm install --frozen-lockfile --prod` on linux so
  the linux sharp binary is fetched fresh at build. VERIFY at C6 via Docker build.
- Verify: `pnpm lint` clean (1 auto-fix: image key ordering), `pnpm build` green,
  `pnpm install --frozen-lockfile` clean.
- Deferred to C6: live smoke — responsive `srcset` + lazy attrs present on blog
  hero; image served as WebP variant; phone viewport reads well LTR + RTL.
- No deviations.

### S11 — Server-side WebP on upload (sharp) (2026-06-14, branch p6-perf)
- `pnpm add sharp` → 0.35.1 as a REGULAR dependency (not dev). Lockfile updated;
  `pnpm install --frozen-lockfile` clean. Minor peer note: `nuxt-og-image` wants
  sharp `^0.34.0`, found 0.35.1 — backward-compatible, warning only.
- `upload.post.ts`: FILE_SPEC images now carry `image: true` (png/jpeg/webp/avif).
  In-handler, image types pipe through `sharp().rotate().resize(2048² inside,
  withoutEnlargement).webp({quality:80})` → stored as `.webp`, content-type
  `image/webp`. Transparency preserved (libvips carries alpha PNG/WebP/AVIF→WebP).
  Returned `size` is the CONVERTED byte length. Size cap still gates the ORIGINAL.
- GIF: deliberately NOT flagged `image` → passes through unconverted (safe option;
  avoids dropping animation). PDF/doc/video/audio untouched. Auth guard intact.
- R1 (Docker/sharp linux binary): NOT run here (Docker build is expensive). The
  runner stage does `pnpm install --frozen-lockfile --prod` on the linux Blacksmith
  runner (`node:22-bookworm-slim`), which resolves sharp's `@img/sharp-linux-x64`
  prebuilt at build → structurally satisfied. REAL R1 verification = Docker/Fly
  build at C6. Dockerfile NOT modified (no change needed).
- Verify: `pnpm lint` clean, `pnpm build` green (upload.post chunk emitted),
  `pnpm install --frozen-lockfile` clean. sharp loads locally (vips 8.18.3).
- Deferred to C6: live smoke — upload a big JPEG/PNG → stored object is smaller
  WebP + URL ends `.webp`; PNG transparency preserved; GIF stays GIF.
- No deviations.

### S10 — Search bar + category filter (2026-06-14, branch p5-search)
- Server `public/posts.get.ts`: added `q` param — case-insensitive Prisma
  `contains` (mode:'insensitive', PARAMETERIZED — no raw SQL) OR'd over title +
  description, in the DB `where` alongside the existing S7 category filter. Order:
  DB where (status+category+q) → take:500 → in-memory locale split → `total =
  filtered.length` → slice. So `total` is the count AFTER q+category+locale and
  "Load More" stops correctly under every filter combo.
- Client `useMaanContent.ts`: `q?` added to `GetPostsOptions`; threaded through
  `getPosts` + `getPostsPage` (only sent when set). Fallback array now suppressed
  when `q` is active too (q-miss reads as empty, not seeded posts).
- DB-backed public category options: dashboard categories route is auth-gated, so
  added a NEW public read-only `server/api/public/categories.get.ts` (slug +
  name_en/name_ar, no auth) + `getCategoryOptions(locale)` in `useMaanContent`
  (degrades to [] on failure). Public filter now tracks admin-managed categories
  without exposing the gated route or `useDashboardI18n`.
- UI both `blog/index.vue` + `ar/blog/index.vue`: UInput search (350ms setTimeout
  debounce, no VueUse dep — not installed) + USelectMenu category filter +
  Clear button; `reload()` resets to page 1 on any filter change; graceful empty
  state ("No articles match…" / "لا توجد مقالات…"). AR: `dir="rtl"` on inputs,
  Arabic labels. Default no-filter view unchanged (6 + Load More).
- Verify: `pnpm lint` clean, `pnpm build` green (`public/categories.get` chunk
  emitted). No deps/CI/schema/migration changes.
- Deferred to C5 (DB unreachable here): live smoke — search a title narrows +
  composes with Load More; category filter narrows + matches admin categories;
  q+category together page to the end with correct total; empty state on a no-match
  query; EN + AR/RTL.
- No deviations.

### S9 — Draft live preview (2026-06-14, branch p4-preview)
- Factored the public article hero + prose body out of `blog/[slug].vue` into a
  shared `app/components/BlogArticleBody.vue` (props `post: MaanPost`; `#body-footer`
  + `#aside` slots for page-specific share/author/CTA/related). Public page now
  renders via the component with IDENTICAL markup/classes → preview == published,
  no visual regression.
- New preview page `app/pages/dashboard/posts/[id]/preview.vue` (alias
  `/ar/dashboard/posts/:id/preview`, `dashboard` layout). Coexists with the
  `[id].vue` editor file (Nuxt allows file + dir sibling). Renders unpublished
  posts through `BlogArticleBody`.
- Fetches via auth-gated `usePosts().loadPosts()` (`/api/dashboard/posts`, which
  returns drafts) — NOT the public single-post route (published-only). Maps the
  DashboardPost → MaanPost mirroring `toMaanPost`; locale via the same `ar-` slug /
  Arabic-script heuristic used by the list + public API; `:dir` set rtl/ltr.
- Auth-gated confirmed: `/dashboard/posts` → `posts` in `URL_TO_SCOPE`; longest-prefix
  `scopeForUrl` covers `/dashboard/posts/:id/preview`. No public/token route exposes
  drafts.
- "Preview" button added to editor navbar (`dashboard/posts/[id].vue`, `#right`),
  `target="_blank"`, shown only once the post has a real id (post-auto-save).
  i18n: previewDraft/previewTitle/previewBadge added EN + AR.
- Verify: `pnpm lint` clean, `pnpm build` green (`preview-*.mjs` chunk emitted).
- Deferred to C4 (DB unreachable here): live smoke — preview a `draft` + `in_review`
  as a logged-in editor renders in the real article layout; `/blog/<slug>` still
  404s for that draft (no public leak); EN + AR/RTL render; published page unchanged.
- No deviations.

### S8-fix — category page scope guard (newest first)
- C3 corrective: `/dashboard/categories` had no `URL_TO_SCOPE` entry, so
  `scopeForUrl` returned undefined → page shell was always-accessible to staff
  lacking `posts`. Added `'/dashboard/categories': 'posts'` to `URL_TO_SCOPE`
  (`app/utils/permissions.ts`). No `/ar/` alias — `scopeForUrl` strips the `/ar/`
  prefix at runtime, matching the `/dashboard/posts` pattern (no `/ar/` keys exist).
- Fixed the now-inaccurate "reachable only through the sidebar" comment in
  `categories/index.vue` to state the middleware guards direct nav via URL_TO_SCOPE.
- Verify: `pnpm lint` clean, `pnpm build` green. No prod/CI/schema changes.

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
