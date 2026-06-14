# Effort: blog-feedback — State Ledger

**Read first, update last, every session.** Ground truth for resumption.
Plan: `blog-feedback.md` · Briefs: `blog-feedback.sessions.md` ·
Protocol: `~/.claude/skills/effort-run/PROTOCOL.md`.

## Next up: C2 (Phase 2 — editor checkpoint review)

## Session checklist

### Phase 1 — Critical bugs · branch `blog-feedback/p1-bugs` (from `main`)
- [x] S1 — Fix detail-page freeze + dedicated single-post API
- [x] S2 — Pagination / "Load More"
- [x] **C1** checkpoint review — **APPROVE** (lint+build re-verified green; code review clean; no prod-safety changes). Live UI smoke un-run: dev DB is Fly Postgres reachable only via `fly proxy` tunnel (not available here) → added to Human-verification checklist below.

### Phase 2 — Editor · branch `blog-feedback/p2-editor` (from p1 head)
- [x] S3 — Insert link + font sizing
- [x] S4 — Attachment (PDF) + media upload & insert
- [x] S5 — Auto-save drafts
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
- 2026-06-14 (S1/S2 agent): committed `.plans/` and `.codegraph/` into branch
  `p1-bugs` (protocol treats these as untracked working files). CLEANUP AT PR
  ASSEMBLY (C7): add both to `.gitignore` and drop from the stack, or filter
  from the final PR so they don't ship. Not worth rewriting stacked history now.

## Human-verification checklist (live smoke; needs `fly proxy` DB tunnel + `pnpm dev`)
_Live UI smoke can't run in the agent environment (Fly Postgres unreachable without the tunnel). Run these before merging the final PR:_
- [ ] Phase 1: `/blog` + `/ar/blog` show >6 posts with working "Load More" to the end; a post ranked >6th opens (no freeze); an Arabic post opens; `/blog/does-not-exist` → clean 404.

## Handoff log (newest first)

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
