# Effort: blog-feedback — Session Briefs

Protocol: `~/.claude/skills/effort-run/PROTOCOL.md` (canonical; this repo has no
`docs/AGENT-SESSIONS.md`). Read it for the trio rules, the ≤30% context budget,
session lifecycle, the merge rule, and checkpoint reviews. **Do not restate it
here.** Always-allowed reads each session: `blog-feedback.md` + this file's brief
+ `blog-feedback.state.md`. Branch strategy: **stacked** (each phase from the
previous phase head; never push/merge default).

## Large-files table (measured line counts — grep-then-ranged read, never whole)

| Lines | File |
|---|---|
| 343 | app/pages/dashboard/posts/index.vue |
| 282 | server/utils/dashboard-shapes.ts |
| 273 | app/composables/useMaanContent.ts |
| 214 | app/components/PostEditorForm.vue |
| 189 | app/pages/ar/blog/[slug].vue |
| 188 | app/pages/blog/[slug].vue |
| 156 | app/composables/useMaanTaxonomy.ts |
| 149 | app/components/DashboardEditor.vue |
| 141 | app/composables/usePostForm.ts |
| 132 | nuxt.config.ts |
| 131 | app/pages/dashboard/posts/[id].vue |
| 130 | prisma/schema/content.prisma |
| 110 | app/pages/blog/index.vue |
| 104 | app/pages/ar/blog/index.vue |

Files ≤100 lines (read whole if needed): `server/api/public/posts.get.ts` (80),
`server/api/upload.post.ts` (75), `server/utils/storage/tigris.ts` (63),
`server/api/dashboard/posts/index.post.ts` (59), `[id].patch.ts` (66),
`[id].delete.ts` (22), `index.get.ts` (13), `usePosts.ts` (49).

Verify commands (quiet): `pnpm lint` and `pnpm build` (or `pnpm dev` for live
smoke). `pnpm db:generate` after any schema change; migration via the Prisma
skill / `pnpm prisma migrate dev`.

---

## Phase 1 — Critical bugs  ·  branch `blog-feedback/p1-bugs` (from `main`)

### S1 — Fix detail-page freeze + dedicated single-post API
Reads (~620): `useMaanContent.ts` lines 200-273 (getPosts/getPostBySlug) + 1-60
(types/imports); `blog/[slug].vue` whole (188); `ar/blog/[slug].vue` lines 1-30 +
related block; `public/posts.get.ts` whole (80).
Do:
1. Create `server/api/public/posts/[slug].get.ts`: `prisma.post.findUnique({
   where: { slug } })`, return null/404 unless `status: 'published'`; shape it
   like `PublicPostListItem` (reuse the type/mapping from `posts.get.ts`).
2. Rewrite `getPostBySlug` (`useMaanContent.ts:247`) to `$fetch` that route
   directly — drop the `getPosts(locale)` dependency entirely.
3. In `blog/[slug].vue` + `ar/blog/[slug].vue`: pass locale through; on missing
   post `throw createError({ statusCode: 404 })`.
4. Fix `blog/[slug].vue:16` related query hardcoded `'en'` → current locale.
Verify: `pnpm build`; dev smoke — open a >6th post + an AR post + a bad slug.
Read budget: ~650 lines.

### S2 — Pagination / "Load More" across all posts
Reads (~420): `public/posts.get.ts` whole (80); `useMaanContent.ts:209-245`
(getPosts + GetPostsOptions); `blog/index.vue` whole (110); `ar/blog/index.vue`
whole (104).
Do:
1. `public/posts.get.ts`: accept `page`/`offset`; raise the `take` window to ~500;
   apply locale filter, compute `total = filtered.length`, return `{ posts, total
   }` for the requested page slice. Keep category/placement filters intact.
2. `getPosts`: thread `page` through; expose total (return shape or sibling
   helper) so the page can decide "has more".
3. `blog/index.vue` + `ar/blog/index.vue`: add a **Load More** button (Q2) that
   appends the next page; hide it when `loaded >= total`. Default first view = 6.
Verify: `pnpm build`; dev smoke — seed >6 posts/locale, page to the end.
Read budget: ~430 lines.

**Checkpoint C1** (independent review): re-run build; live-smoke S1+S2 in both
locales; confirm no regression to homepage/program placement rows (they call
`getPosts(..., { placement })`). Restore any seeded test rows.

---

## Phase 2 — Editor  ·  branch `blog-feedback/p2-editor` (from p1 head)

### S3 — Insert link + font sizing
Reads (~210): `DashboardEditor.vue` whole (149). Confirm TipTap `Link` +
`TextStyle`/`FontSize` are reachable through `UEditor` (use the **nuxt-ui MCP**:
`get-component`/`get-example` for Editor) before coding (R4).
Do: add a `link` toolbar item + URL prompt/popover handler (model the existing
custom `image` handler at lines 36-50); add a font-size control (dropdown). If an
extension isn't exposed, add the minimal `@tiptap/*` dep and register it.
Verify: `pnpm build`; dev smoke — add a link + resize text, save, view article.
Read budget: ~300 lines (incl. MCP doc snippets).

### S4 — Attachment (PDF) + media (video/audio) upload & insert
Reads (~290): `upload.post.ts` whole (75); `tigris.ts` whole (63);
`DashboardEditor.vue` lines 36-103 (handlers + onFilePicked) + 106-149 (template).
Do:
1. `upload.post.ts`: add `application/pdf` (+ common doc types) and `video/*`
   `audio/*` to `ALLOWED_MIME`/`EXT_BY_MIME`; per-type size caps (Q3: 25 MB docs,
   50 MB av); keep the slugified-key scheme.
2. `DashboardEditor.vue`: add toolbar handlers inserting `<a download>` for files
   and `<video controls>`/`<audio controls>` for media (reuse the hidden-input
   upload flow).
Verify: `pnpm build`; dev smoke — upload a PDF → click the inserted download
link; embed a small mp4/mp3.
Read budget: ~330 lines.

### S5 — Auto-save drafts
Reads (~360): `usePostForm.ts` whole (141); `PostEditorForm.vue` lines 1-50 +
182-214 (save/clear buttons); `dashboard/posts/[id].vue` whole (131);
`usePosts.ts` whole (49).
Do: add a debounced watcher (~2-3 s) on `postForm` that calls `savePost` when
dirty **and** the post has an id; new posts save once to gain an id then
auto-save; add a reactive "Saving…/Saved/Error" indicator surfaced in
`PostEditorForm`. Guard against overlapping/looping saves.
Verify: `pnpm build`; dev smoke — edit, pause, confirm a single PATCH fires and
indicator updates; no save storm while typing.
Read budget: ~370 lines.

**Checkpoint C2**: re-run build/lint; live-smoke link, font size, PDF download,
media embed, auto-save (watch network for save storms); EN+AR editor surfaces.

---

## Phase 3 — Dynamic categories  ·  branch `blog-feedback/p3-categories` (from p2 head)

### S6 — Category model + migration + seed
Reads (~190): `content.prisma` lines 1-49 (enum + Post); `useMaanTaxonomy.ts`
lines 41-50 (POST_CATEGORIES); a recent migration dir name for the timestamp
convention.
Do: add `Category { id, slug @unique, nameEn, nameAr, sort?, timestamps }` in
`content.prisma`; `pnpm db:generate`; create + apply a migration; seed the 6
existing categories (slugs unchanged). Keep `Post.categories String[]` as-is.
Verify: migration applies; `pnpm prisma migrate status` clean; seed rows present.
Read budget: ~250 lines.

### S7 — Category CRUD API + DB-backed validation
Reads (~250): `dashboard/posts/index.post.ts` (59), `[id].patch.ts` (66) as route
templates; `public/posts.get.ts` (80); `useMaanTaxonomy.ts:102-156` (validation
helpers). **Grep `isPostCategory` + `sanitizeCategories` across repo** (R3) and
list every call site in the handoff.
Do: add `server/api/dashboard/categories/` (GET/POST/PATCH/DELETE,
`requirePermission 'posts'`); add a server util that validates category slugs
against the DB (cache per request); swap static validation at all grepped call
sites.
Verify: `pnpm build`; curl/dev CRUD; create a post with a DB-only category.
Read budget: ~300 lines.

### S8 — Category management UI + wire selects to API
Reads (~430): `PostEditorForm.vue` lines 17-40 + 117-134 (category select);
`dashboard/posts/index.vue` lines 1-110 (filter options/anchors via grep);
`usePostForm.ts` (if option source lives there). Model the new page on existing
`dashboard/posts/*` pages.
Do: add a categories management page under `app/pages/dashboard/`; replace the
static `taxonomyCategories` option source in the editor select + list filter with
an API-loaded composable (e.g. `useCategories`). Bilingual labels, RTL-safe (R5).
Verify: `pnpm build`; dev smoke — create/rename/delete category; reflected in
editor + filter + public list.
Read budget: ~480 lines.

**Checkpoint C3**: re-run build/lint; verify migration + seed on a fresh DB;
confirm existing posts keep their categories; full category CRUD live; grep proof
that no `isPostCategory` call site was missed.

---

## Phase 4 — Live preview  ·  branch `blog-feedback/p4-preview` (from p3 head)

### S9 — Draft live preview
Reads (~420): `blog/[slug].vue` whole (188) to extract/reuse the detail layout;
`dashboard/posts/[id].vue` whole (131); `usePostForm.ts:1-40` (form shape).
Do: add an authenticated dashboard preview (Q4: `/dashboard/posts/[id]/preview`)
that renders the current form/post HTML in the real article layout (factor the
detail body into a shared component if cheap); add a "Preview" button in the
editor. Unpublished stays public-invisible.
Verify: `pnpm build`; dev smoke — preview a draft as a logged-in editor; confirm
public `/blog/<slug>` still 404s for that draft.
Read budget: ~430 lines.

**Checkpoint C4**: build/lint; live-smoke preview for draft + in_review; confirm
no public leak of unpublished content.

---

## Phase 5 — Search & filter  ·  branch `blog-feedback/p5-search` (from p4 head)

### S10 — Search bar + category filter on blog index
Reads (~370): `public/posts.get.ts` whole (80); `useMaanContent.ts:209-245`;
`blog/index.vue` whole (110); `ar/blog/index.vue` whole (104).
Do: add `q` param to `public/posts.get.ts` (title/description `contains`,
insensitive) combined with existing `category`; thread `q`/`category` through
`getPosts`; add a search input + category select to both index pages; compose
with S2 pagination. RTL-safe.
Verify: `pnpm build`; dev smoke — search a title, filter a category, page through.
Read budget: ~380 lines.

**Checkpoint C5**: build/lint; live-smoke search + filter + pagination together,
both locales.

---

## Phase 6 — Performance  ·  branch `blog-feedback/p6-perf` (from p5 head)

### S11 — Server-side WebP on upload (sharp)
Reads (~140): `upload.post.ts` whole (75; note S4 changes); `tigris.ts` whole
(63); `Dockerfile` deps/builder stages (R1).
Do: add `sharp` dep; in `upload.post.ts`, for image MIME types convert/compress to
WebP before `uploadObject` (preserve transparency; skip non-images from S4); store
`.webp` key + return its URL.
Verify: `pnpm build`; **confirm Docker image builds** (sharp linux binary) — note
result in handoff; dev smoke — upload a big JPEG → stored object is smaller WebP.
Read budget: ~200 lines.

### S12 — @nuxt/image + responsive rendering + mobile/RTL audit
Reads (~430): `nuxt.config.ts` whole (132); `blog/[slug].vue:100-130` (img);
`blog/index.vue` + `ar/blog/index.vue` card image markup; `ar/blog/[slug].vue` img.
Do: install + configure `@nuxt/image` (Tigris domain/provider allow-list); swap
blog `<img>` → `<NuxtImg>`/`<NuxtPicture>` with sizes; audit detail-page mobile
typography + Arabic RTL.
Verify: `pnpm build`; dev smoke — responsive `srcset` + lazy load present; phone
viewport reads well LTR + RTL.
Read budget: ~450 lines.

**Checkpoint C6**: build/lint; **Docker build green** (sharp); Lighthouse/Network
spot-check that blog images are WebP + responsive; mobile + RTL pass.

---

## Phase 7 — Related + social  ·  branch `blog-feedback/p7-related-social` (from p6 head)

### S13 — Related posts by category
Reads (~360): `blog/[slug].vue` related block (lines ~14-30, 130-188);
`ar/blog/[slug].vue` related block; `public/posts.get.ts` whole (80);
`useMaanContent.ts:209-245`.
Do: replace "first 3" with 3 posts sharing the current post's categories (reuse
the `category` filter param), latest as fallback, excluding current; correct
locale both pages.
Verify: `pnpm build`; dev smoke — related row is topical + right locale, excludes
self, falls back to latest.
Read budget: ~370 lines.

### S14 — Social share buttons
Reads (~400): `blog/[slug].vue` template (footer region) + `ar/blog/[slug].vue`;
an existing small presentational component for style conventions.
Do: add a share-row component (X, LinkedIn, Telegram, Pinterest share-intent URLs
from post URL+title; Instagram = copy-link). Use on EN + AR detail pages.
Bilingual labels, RTL-safe.
Verify: `pnpm build`; dev smoke — each intent opens correctly; Instagram copies
link; both locales.
Read budget: ~420 lines.

**Checkpoint C7 (final)**: full build/lint + Docker build; live-smoke every phase's
deferred manual items; DB hygiene (restore seeds, record end-state); assemble the
single PR `main..blog-feedback/p7-related-social` with per-phase diffs reviewable.
```
