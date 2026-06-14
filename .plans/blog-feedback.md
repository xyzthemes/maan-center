# Effort: blog-feedback — Master Plan

Address the Maan client's review feedback on the public **"Scientific Reference"
blog** (المرجع العلمي) and the **admin dashboard article editor**. Phased,
**bugs first**.

Source feedback (Arabic) + initial draft analysis:
`/Users/baker/.claude/plans/the-client-provided-feedback-moonlit-dewdrop.md`.

Stack facts: Nuxt 4 + Prisma 7 (split schema under `prisma/schema/`), Postgres on
Fly.io, Tigris (S3) for assets, Better Auth, `@nuxt/ui` v4 (TipTap `UEditor`),
pnpm, Docker build `node:22-bookworm-slim`. Blog is **Prisma-backed, not Nuxt
Content**. EN/AR partition is a runtime heuristic (slug prefix `ar-` / Arabic
script), **not** a DB column.

---

## Locked decisions (dated)

- **2026-06-14** Categories → build an **admin-managed dynamic `Category` table**
  (CRUD), keep storage as `Post.categories String[]` of slugs (preserves the GIN
  index + `hasSome` query path); swap the static `isPostCategory` validation for
  a DB-backed check. Seed the table from the existing 6 taxonomy entries.
- **2026-06-14** Images → **server-side WebP conversion on upload (sharp)** +
  **`@nuxt/image`** for responsive front-end rendering.
- **2026-06-14** Social platforms → **X, LinkedIn, Telegram, Pinterest** via
  static share-intent URLs; **Instagram** has no web share intent → "copy link".
- **2026-06-14** Phase-1 pagination uses an **in-memory window** (server already
  fetches `take: 200`; raise to ~500, filter by locale, return `total` +
  `slice`). **Do NOT add a `Post.locale` column in Phase 1** — the team already
  weighed and deferred it (see note in `dashboard/posts/index.vue:23`). Revisit
  only if post volume approaches the window cap (Task 11 / open question Q1).
- **2026-06-14** The detail-page "freeze" is fixed by a **dedicated single-post
  API route** (`findUnique` by slug), not by widening the list limit — decouples
  detail lookups from the list's `limit`/`locale` defaults permanently.
- **2026-06-14** Branch strategy: **stacked** (each phase branches from the
  previous phase head; default branch never moves; one final PR). Nothing may
  break the Fly deploy.

---

## Tasks & acceptance criteria

### Phase 1 — Critical bugs (urgent; ship first)

**T1. Fix "click article → page freezes / blank".**
Root cause: `blog/[slug].vue:6` calls `getPostBySlug(slug)` with no locale →
defaults `'en'` + `getPosts` default `limit: 6` → any post past #6 (or any AR
post) not in the set → `undefined` → broken render.
- *Accept:* a published post ranked >6th and an Arabic post both open their full
  detail page from the listing; a non-existent slug returns a clean 404 (not a
  hang). New `GET /api/public/posts/[slug]` returns one published post by slug.
  `getPostBySlug` calls it directly (no list dependency). EN related-posts locale
  bug (`blog/[slug].vue:16` hardcoded `'en'`) fixed.

**T2. Show all articles + pagination / "Load More".**
- *Accept:* `/blog` and `/ar/blog` can reach every published post of their locale
  via Load-More (or `UPagination`); server returns `total`; default page still
  shows 6. No regression to placement/category filtered queries.

### Phase 2 — Rich-text editor

**T3. Insert link + font sizing** in `DashboardEditor.vue` toolbar (TipTap `Link`
+ `TextStyle`/`FontSize`).
- *Accept:* author can add/edit/remove a link on selected text and change font
  size; both persist in saved HTML and render on the public article.

**T4. Insert attachment (PDF/book download) + media (video/audio).**
Extend `upload.post.ts` `ALLOWED_MIME` + size caps; add toolbar handlers that
insert a styled `<a download>` for files and `<video>`/`<audio>` for media.
- *Accept:* uploading a PDF inserts a working download link from the Tigris URL;
  video/audio embeds play on the public article. Disallowed types rejected with
  a clear message.

**T5. Auto-save drafts.**
Debounced auto-PATCH from the editor when the form is dirty and has an id
(status stays as-is), with a "Saving…/Saved" indicator. Reuse
`usePostForm.savePost` (POST/PATCH at `usePostForm.ts:91-98`).
- *Accept:* editing an existing post auto-persists within a few seconds of
  inactivity without a manual Save; a brand-new post saves once (gaining an id)
  then auto-saves thereafter; indicator reflects state; no save storms.

### Phase 3 — Dynamic categories

**T6. `Category` model + migration + seed** (from the 6 current taxonomy ids,
preserving slugs `autism`, `down-syndrome`, …, with `nameEn`/`nameAr`).
- *Accept:* migration applies cleanly; seed creates 6 rows; existing posts'
  `categories` slugs still resolve.

**T7. Category CRUD API + DB-backed validation.**
`server/api/dashboard/categories/` (GET/POST/PATCH/DELETE, `requirePermission
'posts'`); replace `isPostCategory` usage in `public/posts.get.ts` + post
create/update with a DB lookup.
- *Accept:* CRUD works behind auth; unknown slugs still dropped; public filter
  validates against DB categories.

**T8. Category management UI + wire selects to API.**
New dashboard page; `PostEditorForm` category multi-select + dashboard list
filter load options from the API instead of the static composable.
- *Accept:* admin creates/renames/deletes a category; it appears in the editor
  select and list filter and filters the public list; deletion is safe (orphan
  slugs handled gracefully).

### Phase 4 — Live preview

**T9. Draft live preview.**
Authenticated preview rendering unpublished posts in the real blog detail layout
(preview route or `?preview` flag), plus a "Preview" button in the editor.
- *Accept:* a `draft`/`in_review` post renders exactly like the published article
  for a logged-in editor while staying invisible to the public.

### Phase 5 — Search & filter (front-end)

**T10. Search bar + category filter on the blog index.**
`q` param in `public/posts.get.ts` (title/description `contains`, case-insensitive)
+ reuse existing `category` param; UI controls on `/blog` and `/ar/blog`.
- *Accept:* searching a title and filtering by category narrows results and
  composes with pagination; empty state is graceful.

### Phase 6 — Performance & responsive

**T11. Server-side WebP on upload (sharp).** Convert/compress in `upload.post.ts`
before `uploadObject`.
- *Accept:* uploading a large JPEG/PNG stores a smaller `.webp`; returned URL is
  the WebP; transparency preserved; build still succeeds in Docker (sharp linux
  binary present).

**T12. `@nuxt/image` + responsive rendering + mobile/RTL reading audit.**
Install/configure module (Tigris remote allow-list); swap blog `<img>` →
`<NuxtImg>`/`<NuxtPicture>`; verify mobile typography + Arabic RTL on the detail
page.
- *Accept:* blog images render with responsive `srcset` + lazy loading; detail
  page reads comfortably on a phone viewport in both LTR and RTL.

### Phase 7 — Related posts + social sharing

**T13. Related posts by category.** Replace naive "first 3" with 3 posts sharing
the current post's categories, latest as fallback; fix locale.
- *Accept:* related row shows topically-related posts in the right locale; never
  shows the current post; degrades to latest when no category match.

**T14. Social share buttons.** Icon row on EN + AR detail pages: X, LinkedIn,
Telegram, Pinterest (share-intent URLs) + Instagram copy-link.
- *Accept:* each button opens the correct share intent with the post URL+title;
  Instagram copies the link; works in both locales.

---

## Risks

- **R1 (sharp in Docker):** sharp needs its linux/glibc binary at build/runtime.
  `node:22-bookworm-slim` + pnpm should pull the prebuilt binary, but verify the
  Fly image builds and runtime conversion works before relying on T11.
- **R2 (locale window cap):** Phase-1 in-memory pagination assumes <~500
  published posts per locale. Acceptable now; Q1 tracks the real fix.
- **R3 (category migration):** swapping static→DB validation touches public API +
  both create/update routes + UI; a missed call site silently drops categories.
  T7 must grep every `isPostCategory`/`sanitizeCategories` use site.
- **R4 (TipTap extension availability):** `Link`/`TextStyle`/`FontSize` come
  transitively via `@nuxt/ui`; if not exposed through `UEditor`'s API, may need a
  direct `@tiptap/*` dep — confirm in T3 before building the toolbar.
- **R5 (RTL/bilingual):** every new UI string + the share/preview surfaces must
  ship EN+AR and respect RTL (`rtl-arabic-nuxt` conventions).

---

## Open questions (recommended option each)

- **Q1 — DB `Post.locale` column?** Recommended: **defer** (do Phase-1 in-memory
  pagination now); add the column only if post volume grows. The dashboard list
  already infers locale heuristically and notes the deferral.
- **Q2 — Pagination UX:** "Load More" button vs numbered `UPagination`?
  Recommended: **Load More** (simpler, mobile-friendly, matches "older articles"
  framing); revisit if the client wants page numbers.
- **Q3 — Attachment size cap:** images stay 5 MB; what cap for PDFs/docs?
  Recommended: **25 MB** for documents, **50 MB** for video, with a clear error.
- **Q4 — Preview mechanism:** dedicated `/dashboard/posts/[id]/preview` route vs
  `?preview=token` on the public route? Recommended: **authenticated dashboard
  preview route** reusing the blog detail layout component (no public token to
  leak).
```
