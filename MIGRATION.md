# Directus → Prisma + Better Auth migration

> Branch: `prisma-switch` (off `main@2b4283f`).
> Scope: replace Directus as the data + auth backend with Prisma 7 (Postgres) + Better Auth, while keeping the existing Nuxt 4 frontend and dashboard untouched at the page level.

## Why migrate

Directus has been load-bearing for two things in this project:

1. **Data store** — `posts`, `pages`, `forms`, `form_fields`, `form_submissions`, `directus_users`, `directus_files`.
2. **Auth + RBAC** — session cookies, role-based permission rules per collection.

The custom Nuxt dashboard already replaced Directus's admin UI, so we no longer use Directus's most valuable feature (the admin app). What remains is essentially "a Postgres database with REST and auth bolted on" — and we've been fighting both:

- **Permissions friction**: the recent Content Admin policy fix required reverse-engineering the `/access` junction and bulk-inserting permission rows.
- **Schema drift**: every collection change is an admin-UI click or a one-off REST call (we added `pages.content` that way).
- **Type drift**: hand-typed `DirectusPost`, `DirectusPage`, etc. in TypeScript can silently diverge from the actual Directus schema.

Prisma + Better Auth replaces these with:

- **Schema-as-code** (`prisma/schema/*.prisma`) + migrations checked into git.
- **End-to-end types** generated from the schema, imported via `server/utils/db/types.ts`.
- **Auth library** with explicit, code-defined session + role logic — no admin UI permission rules to chase down.
- **Lower running cost**: one Postgres instance (Fly.io) + one Tigris bucket instead of a Directus service + its database.

## Non-goals

- No frontend redesign. The dashboard, public site, blog, contact form continue to look and behave exactly as they do today.
- No new entities or features. We migrate the schema we have. Net-new features wait until the migration lands.
- No public-content rewrite. The blog reads from the new database, but we don't change article content.

## Target stack

| Concern | Today (Directus) | After migration |
|---|---|---|
| Database | Directus's Postgres (managed by Directus) | Postgres on Fly.io (managed by us, `maan` org) |
| ORM / query layer | `$fetch` → Directus REST | Prisma 7 with `@prisma/adapter-pg` |
| Auth | Directus sessions + cookies | Better Auth (`@onmax/nuxt-better-auth` module) |
| Roles / permissions | Directus policies + `/permissions` rows | Better Auth `admin` plugin OR custom `role` field on `User` |
| File uploads + CDN | Directus `/assets/{id}` | **Fly.io Tigris** (S3-compatible bucket, public URL doubles as CDN) |
| Public REST consumers | `nuxt-directus` module | Internal Nitro routes only — no public REST surface |

## Phase plan (seven phases, ~2–3 sessions of work)

Each phase ships independently. After every phase, the app still builds, lints, and types cleanly. Don't merge mid-phase.

### Phase 1 — Prisma + Postgres + Tigris scaffold ✅

Owner-action items:
- [x] Provisioned a **Fly.io Legacy Postgres** cluster in the `maan` org (`maan-db`, region `cdg`, single instance, shared-cpu-1x, 1 GB volume).

  ```bash
  fly postgres create --org maan --name maan-db --region cdg \
    --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 1
  ```

  Connection string is in `.env` as `DATABASE_URL` (proxy-friendly) and `DATABASE_URL_FLYCAST` (Fly-internal).

  **Important — connectivity model.** Fly Postgres only exposes a flycast address (`maan-db.flycast:5432`) by default — reachable only inside Fly's WireGuard mesh. Apps on Railway, Vercel, your local dev can't connect without help.

  - **Local dev / migrations**: run `fly proxy 5432 -a maan-db` in a background terminal. The proxy tunnels `localhost:5432` to the cluster; `DATABASE_URL` in `.env` already points at `localhost`.
  - **Production reachability** (Phase 3.5, decision deferred): either (a) `fly ips allocate-v4 -a maan-db` to expose 5432 publicly (relies on password auth + Fly network ACLs), or (b) move the Nuxt deployment from Railway to Fly so it can use the flycast address natively. (b) is the cleaner long-term answer; (a) ships faster.

- [x] Provisioned a **Tigris** bucket in the same org (`maan-media`, public read).

  ```bash
  fly storage create --org maan --name maan-media --public --yes
  ```

  Auto-injected env vars are in `.env`: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION=auto`, `AWS_ENDPOINT_URL_S3=https://fly.storage.tigris.dev`, `BUCKET_NAME=maan-media`. Public CDN URL pattern: `https://maan-media.fly.storage.tigris.dev/<key>`. (Phase 6 corrected this — the earlier `pub-<bucket>.fly.storage.tigris.dev` prefix is no longer routed by Tigris and resolves to a non-existent bucket.)

- [x] Production env vars set as Fly secrets on `maan-app` (Phase 3.5; no more Railway). See Phase 3.5 below.

Code-side:
- Install deps: `prisma@^7`, `@prisma/client@^7`, `@prisma/adapter-pg@^7`, `pg`, `@aws-sdk/client-s3` (Tigris-compatible).
- Add `prisma.config.ts` at the repo root pointing to `prisma/schema/`.
- Add scripts to `package.json`: `db:generate`, `db:migrate`, `db:studio`, `db:seed`.
- Bootstrap `prisma/schema/base.prisma` with the `prisma-client` generator + `datasource db` block.
- Create `server/utils/db/client.ts` — a singleton `PrismaClient` with `PrismaPg` adapter and a `pool.on('error')` handler (good hygiene; protects against any transient connection drops).
- Create `server/utils/db/types.ts` re-exporting Prisma's generated types.
- Create `server/utils/db/index.ts` re-exporting `prisma` for Nitro auto-import.
- Create `server/utils/storage/tigris.ts` — singleton `S3Client` pointing at the Tigris endpoint, plus a small `uploadObject({ key, body, contentType })` helper that returns the public CDN URL.
- Add `prisma/generated/` to `.gitignore`.

Verification (all passed at commit `560e055`):
- ✅ `pnpm db:generate` succeeded; client written to `prisma/generated/`.
- ✅ Smoke test (`.tmp/smoke-prisma.ts`) ran through `client.ts`'s singleton + `PrismaPg` + `pg.Pool` against `localhost:5432` (via `fly proxy 5432 -a maan-db`) and returned `PostgreSQL 17.7` from the Paris cluster.
- ⏳ Tigris `uploadObject` smoke test deferred until Phase 6 (the helper compiles + types clean, but exercising it without an upload route is busywork).
- ✅ `pnpm exec nuxt typecheck` clean.
- ✅ `pnpm lint` clean (only pre-existing `v-html` warnings).

### Phase 2 — Schema + initial migration ✅

Translate the Directus collections we actually use into Prisma models, split across domain files:

```
prisma/schema/
├── base.prisma            # generator + datasource
├── auth.prisma            # User, Session, Account, Verification (Better Auth shape)
├── content.prisma         # Post, Page, Seo embed
└── forms.prisma           # Form, FormField, FormSubmission, FormSubmissionValue
```

Models (rough sketch — final shape lives in the schema):

- **`User`** — id, email, name, role enum (`Manager` | `Admin` | `Writer`), createdAt, updatedAt. Plus Better Auth's `emailVerified`, `image`, etc.
- **`Session`**, **`Account`**, **`Verification`** — Better Auth standard shapes.
- **`Post`** — id, slug (unique), title, description, content (text), status (`Draft` | `InReview` | `Published`), publishedAt, dateCreated, dateUpdated, seo (`Seo` embed). Optional `authorId` relation to User.
- **`Page`** — id, title, permalink (unique), content, status, publishedAt, sort, seo. Same Seo shape.
- **`Form`** — id, key, title, fields[].
- **`FormField`** — id, formId, name, label, type, required, order.
- **`FormSubmission`** — id, formId, timestamp, values[].
- **`FormSubmissionValue`** — id, submissionId, fieldId, value.
- **`Seo`** — composite type (Prisma `type` / Postgres `jsonb` decision below).

Open schema decisions to confirm before writing the first migration:
- **`Seo` as embedded JSON vs. relation?** Embedded JSON (`Json` column) matches the current Directus shape and is fewer joins. Recommendation: **embedded `Json`** for now; we can normalize later.
- **Status as enum vs. string?** Enum is stricter and indexable. Recommendation: **Postgres enum** (`Draft` | `InReview` | `Published`).
- **`Form` schema fidelity** — Directus's forms are extensible; do we need every field type (text, email, textarea, dropdown, checkbox)? Recommendation: store `type` as a string for now, validate in code.

Verification (all passed):
- ✅ `pnpm db:migrate dev --name init` against the Fly Postgres cluster succeeded.
- ✅ `prisma/migrations/20260524072851_init/migration.sql` committed (219 lines).
- ✅ Postgres has 10 tables (User, Session, Account, Verification, Post, Page, Form, FormField, FormSubmission, FormSubmissionValue) + the `ContentStatus` enum with `draft`/`in_review`/`published`.
- ✅ `server/utils/db/types.ts` re-exports `PrismaClient`, `ContentStatus`, and all 10 model types — auto-imported via Nitro.
- ✅ `pnpm exec nuxt typecheck` clean.

### Phase 3 — Data dump + seed from Directus ✅

Move the existing content over so we don't lose any work:

- [x] `prisma/seed.ts` fetches `posts`, `pages`, `forms`, `form_fields`, `form_submissions`, `form_submission_values`, and `/users` from the current Directus instance using the MCP-config token (reused via the same auth pattern as `.tmp/blogger-import/directus.mjs`).
- [x] All collections upsert by Directus id (UUIDs preserved). Re-running the seed is idempotent.
- [x] Resumable: every Directus fetch retries 502/503/504 + network errors with exponential backoff (8 attempts, capped at 30s). Each collection is wrapped in its own try/catch so a thrown error per-phase doesn't abort the run.
- [x] Users seeded with `Account.password = NULL`; plaintext temp passwords printed to stdout for the operator only (never written to the DB). Phase 4 cutover emails a Better Auth `passwordReset` link instead.
- [x] Service-token bot users (no email) are skipped — Better Auth requires an email, and post-cutover the public site reads through Prisma without a bot account.

Verification (`pnpm tsx .tmp/verify-seed.ts`, all passed):
- ✅ `User` = 4 (matches Directus's 4 emailed users; 1 email-less Frontend Bot intentionally skipped).
- ✅ `Post` = 28 (matches Directus).
- ✅ `Page` = 10 (matches Directus).
- ✅ `Form` = 2, `FormField` = 7, `FormSubmission` = 2, `FormSubmissionValue` = 7 (all match Directus).
- ✅ Byte-for-byte spot-check on post `149eacf7-fe52-4e49-a013-f8514ad962ab` (`ar-supporting-communication-through-play`): title + 491-byte `content` field identical.

Notes:
- `FormSubmissionValue` denormalizes `name`/`label` from the related field at seed time so historical submissions survive later field deletions — Directus stores the FK only, so the seed reads each field once (cached) to populate the snapshot columns.
- The seed had to be run twice during this phase: the first run discovered that Directus's column is `form_submission` (not `submission`), so the second pass picked up the 7 submission values that the first skipped. The upsert-by-id design made this safe.

### Phase 3.5 — Production host: Fly.io ✅

Decided in favor of (b) — move the Nuxt deploy off Railway onto Fly so the `maan-db.flycast` address works natively. Railway's role in the stack is now zero.

What landed:
- [x] `fly apps create maan-app -o maan` — fresh app, region `cdg`, co-located with `maan-db`.
- [x] `fly postgres attach maan-db --app maan-app` — provisioned a separate `maan_app` database + user (left unused). Manually overrode `DATABASE_URL` to point at the **seeded** `postgres` database via flycast with `?sslmode=disable` so the existing data (28 posts, 10 pages, 5 form blocks, 7 form fields, 7 submissions, etc.) lives in production from the first deploy.
- [x] Fly secrets set on `maan-app`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=https://maan-app.fly.dev`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `BUCKET_NAME=maan-media`. `AWS_REGION` + `AWS_ENDPOINT_URL_S3` live in `fly.toml`'s `[env]` (not secret).
- [x] **Dockerfile** — multi-stage Node 22 alpine build. `pnpm db:generate` runs in the builder stage so `prisma/generated/` ships into the runner. Placeholder `BETTER_AUTH_SECRET` + `BETTER_AUTH_URL` env vars in the builder satisfy `@onmax/nuxt-better-auth`'s build-time check; Fly secrets override at boot. `NODE_OPTIONS=--max-old-space-size=4096` clears the Nitro server build's OOM at 2 GB. The runner image is 249 MB and reinstalls production-only deps because Nitro doesn't bundle pg/adapter-pg/aws-sdk.
- [x] **`fly.toml`** — Docker build, `primary_region = "cdg"`, `release_command = "node node_modules/prisma/build/index.js migrate deploy"`, http_service on internal port 3000 with `force_https`, `auto_stop_machines = "stop"`, `min_machines_running = 1` (avoid cold-start on every first hit), `shared-cpu-1x` + 512 MB.
- [x] **`.dockerignore`** — keeps the build context small; explicitly excludes `.env`, `.tmp/`, `.remember/`, `.claude/`, `.vscode/`.
- [x] **Removed Railway**: `railway.json` deleted; `RAILWAY_PUBLIC_DOMAIN` fallback gone from `nuxt.config.ts`; README rewritten with the Fly deploy story (build, secrets, custom domains).

Production verification (`https://maan-app.fly.dev`, all passed):
- ✅ `GET /api/auth/ok` → `{"ok":true}`.
- ✅ `GET /api/public/posts?locale=en&limit=2` → 2 posts (Building Confident Routines, How Early Assessment Guides Support).
- ✅ `GET /api/pages/navigation` → 3 published nav pages.
- ✅ `GET /api/__sitemap__/urls` → 10 URLs (4 static + 6 published post URLs).
- ✅ All seven public surfaces serve `200`: `/`, `/blog`, `/contact`, `/ar`, `/ar/blog`, `/ar/contact`, `/dashboard/login`.
- ✅ `GET /api/dashboard/posts` unauthed → `401`.
- ✅ `GET /dashboard/posts` unauthed → `302 → /dashboard/login?redirect=…`.

Notes / follow-ups:
- ✅ Custom domain wired: `maan.center` (canonical) + `www.maan.center` (301 → apex). Certs issued by Let's Encrypt via `fly certs add`. Three secrets carry the canonical URL: `BETTER_AUTH_URL` (server-side, for sign-in cookies + redirect URLs), `NUXT_SITE_URL` (server-side, picked up by `@nuxtjs/seo`'s `site.url`), and `NUXT_PUBLIC_SITE_URL` (public runtime config, hydrates to the client and drives the Better Auth client's baseURL — without this the Better Auth client tries to fetch `http://127.0.0.1:3000/api/auth/*` because the build-time fallback in `nuxt.config.ts` got baked into the SSR payload default). `server/middleware/redirect-www.ts` handles the www redirect at the app layer (Fly's load balancer doesn't do HTTP redirects natively).
- ✅ Least-privilege DB user: created `maan_runtime` (non-superuser), reassigned ownership of all 12 public-schema tables to it (so `prisma migrate deploy` can still ALTER them), updated `DATABASE_URL` secret. The `postgres` superuser is no longer the app's runtime identity. See `.tmp/setup-least-privilege.ts` for the one-time provisioning script.
- ✅ Dropped the auto-attached `maan_app` database (was empty) and the auto-created `maan_app` superuser (leftover from `fly postgres attach`). Cluster now has just `postgres`/`maan_runtime`/`flypgadmin`/`repmgr` users. The Fly attachment metadata record still exists (`fly postgres detach` requires interactive stdin) — cosmetic, doesn't affect runtime.
- ✅ Base image swapped from `node:22-alpine` to `node:22-bookworm-slim` to clear the IDE-flagged "high vulnerability". The Debian-slim base has different CVE surface and is the more common production choice anyway.

### Phase 4 — Auth swap ✅

Replaced Directus session cookies with Better Auth. The team will need to re-authenticate at cutover (Phase 7 deploy).

What landed:
- [x] Installed `better-auth@1.6.11` and `@onmax/nuxt-better-auth@0.0.2-alpha.32`.
- [x] `server/auth.config.ts` wires the Prisma adapter to our singleton client and enables the `admin` plugin for role gating.
- [x] `app/auth.config.ts` mirrors the admin plugin client-side so `user.role` reads through `useUserSession()`.
- [x] Deleted `server/api/dashboard/{login.post,logout.post,me.get}.ts` — Better Auth's `/api/auth/*` handler now owns sign-in, sign-out, session reads.
- [x] `nuxt.config.ts` registers the module + redirect config + `routeRules` for `/dashboard/**` (and `/ar/dashboard/**`) — including `guest` mode on `/dashboard/login` so authed users skip the form.
- [x] `useDashboardUser.ts` now wraps `useUserSession()`; layout consumers (`userName`, `userRole`, `ensureUser`, `logout`) keep the same shape.
- [x] `app/pages/dashboard/login.vue` uses `useSignIn('email')` with safe `?redirect=` handling.
- [x] `server/utils/dashboard-directus.ts` slimmed to just `dashboardDirectusRequest` (now using the static `DIRECTUS_SERVER_TOKEN`) — Phase 5 will replace each call site with Prisma; this file is deleted in Phase 7.
- [x] `.env` + `.env.example` add `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`.

Verification (all passed against `http://localhost:3000` with a throwaway `phase4-test@local.test` user, cleaned up after):
- ✅ `GET /api/auth/ok` → `{ ok: true }` (module wired).
- ✅ Sign-in with correct password → 200, sets `better-auth.session_token` + `better-auth.session_data` cookies, returns the user with `role: "user"`.
- ✅ Sign-in with wrong password → `INVALID_EMAIL_OR_PASSWORD`.
- ✅ `GET /api/auth/get-session` with cookie → full session + user payload; without cookie → `null`.
- ✅ `GET /dashboard/posts` unauthenticated → `302 → /dashboard/login?redirect=%2Fdashboard%2Fposts` (preserveRedirect works).
- ✅ `GET /dashboard/login` while authed → `302 → /dashboard` (guest-only route works).
- ✅ `POST /api/auth/sign-out` (with `Content-Type` + `Origin` headers) → clears cookies → `get-session` returns `null` → `/dashboard/posts` redirects back to login.
- ✅ `pnpm exec nuxt typecheck` clean.

Bridge state until Phase 5:
- The dashboard data routes (`/api/dashboard/posts/*`, `pages/*`, `submissions.get.ts`) still call `dashboardDirectusRequest`, now using the static `DIRECTUS_SERVER_TOKEN` (Frontend Bot) instead of a per-user cookie that no longer exists. Reads will succeed only for items the bot has read permission for; writes will 403. Phase 5 replaces these with `prisma.*` calls and adds `requireUserSession(event)` to each route.
- Existing seeded users still have `Account.password = NULL`. No sign-in is possible until either (a) Phase 5+ ships a "Set your password" flow backed by Better Auth's `passwordReset`, or (b) the operator uses the throwaway `.tmp/set-password.ts` helper to bootstrap a test user.

### Phase 5 — Server endpoint swap ✅

Every API route that touched Directus now talks to Prisma. The public composables fetch from internal Nitro routes instead of `useDirectusItems()`.

What landed:
- [x] **Schema extension**: added `FormBlock` model + `add_form_block` migration so Directus's `block_form` content (5 rows of editor-controlled headline/tagline for home/contact/blog surfaces, EN+AR) carries over. Extended `prisma/seed.ts` and re-seeded.
- [x] `server/utils/dashboard-shapes.ts` — serialization helpers that map Prisma rows back to the snake_case wire shape the existing dashboard composables consume (`published_at`, `date_updated`, `seo.meta_description`, …). Keeps Phase 5 a backend-only change; Phase 7 cleanup can rename to camelCase.
- [x] **Dashboard data routes** (all gated by `requireUserSession`):
  - `posts/index.get.ts`, `posts/index.post.ts`, `posts/[id].patch.ts`, `posts/[id].delete.ts` (new — parity with pages)
  - `pages/index.get.ts`, `pages/index.post.ts`, `pages/[id].patch.ts`, `pages/[id].delete.ts`
  - `submissions.get.ts` — joins `Form` + `FormSubmissionValue`
- [x] **Public data routes**:
  - `/api/pages/navigation` → `prisma.page.findMany({ status: 'published' })`
  - `/api/pages/by-permalink` → `prisma.page.findFirst(...)`
  - `/api/public/posts?locale=en|ar&limit=N` (new — used by `useMaanContent.getPosts`)
  - `/api/public/forms/[id]` (new) + `/api/public/form-blocks/[id]` (new)
  - `/api/forms/submit` — writes `FormSubmission` + nested `FormSubmissionValue[]` with denormalized name/label snapshots, validates via the form's `FormField[]`
  - `/api/__sitemap__/urls` — published posts from Prisma
- [x] **Composables**: `useMaanContent` + `useMaanForms` now `$fetch` from the internal API. Same `MaanPost` / `MaanSeo` / `MaanForm` / `MaanFormBlock` types — pages don't need changes.
- [x] **Deleted** `server/utils/dashboard-directus.ts` — every caller is gone. `nuxt-directus` module + `DIRECTUS_SERVER_TOKEN` config remain until Phase 7's cleanup.

Verification (`pnpm dev` against `localhost:3000`, all passed):
- ✅ `pnpm exec nuxt typecheck` clean.
- ✅ `GET /api/public/posts?locale=en&limit=2` → 2 posts; `?locale=ar` → 2 AR posts.
- ✅ `GET /api/pages/navigation` → 3 published pages (excludes static permalinks).
- ✅ `GET /api/pages/by-permalink?permalink=/about-us` → full page payload with normalized SEO.
- ✅ `GET /api/public/form-blocks/185eca12-…` → block with headline + nested form + 5 fields.
- ✅ `GET /api/__sitemap__/urls` → 4 static URLs + post URLs.
- ✅ `GET /api/dashboard/posts` unauth → `401`.
- ✅ `GET /api/dashboard/posts` authed → 28 posts; `/api/dashboard/pages` → 10; `/api/dashboard/submissions` → 2 with form/values joined.
- ✅ POST `/api/dashboard/posts` → 200 (created); PATCH `/{id}` → 200 (edited); DELETE `/{id}` → `{ success: true }`.
- ✅ POST `/api/forms/submit` for the Family Enquiry form (id `36493b64-…`) wrote a real `FormSubmission` + 5 values; cleaned up after.

Out of scope, deferred to Phase 7:
- Removing `nuxt-directus`, `NUXT_PUBLIC_DIRECTUS_URL`, `DIRECTUS_SERVER_TOKEN`.
- Renaming `DashboardPost`/`DashboardPage` to `Post`/`Page` and flipping the response wire shape from snake_case to camelCase.
- Tightening `requireUserSession(event, { user: { role: 'admin' } })` per route now that we know which writer/admin roles correspond to which actions.

### Phase 6 — Image uploads via Tigris (rich-text editor wiring) ✅

The Tigris bucket and `uploadObject` helper landed in Phase 1; this phase wires them into the dashboard editor.

What landed:
- [x] `server/api/upload.post.ts` — authenticated upload route. Validates a 5 MB cap (413 on oversize) and a MIME allowlist (`png`/`jpeg`/`webp`/`avif`/`gif`; rejects others with 400). Generates a clean key `posts/<8-char-uuid-suffix>-<slugified-stem>.<ext>` and calls `uploadObject`. Returns `{ url, key, size, contentType }`.
- [x] `app/components/DashboardEditor.vue` — shared wrapper around Nuxt UI's `UEditor`. Adds an image button (`kind: 'image'` in the toolbar) and a custom `image` handler that prompts for alt text, POSTs the file as `multipart/form-data` to `/api/upload`, then inserts `<img src="..." alt="...">` via Tiptap's `setImage` command. Hidden `<input type="file">` is driven by the handler.
- [x] `PostEditorForm.vue` + `PageEditorForm.vue` — replaced their inline `UEditor` + toolbar with `<DashboardEditor v-model="form.content">`. Both pages now share the same toolbar config; no behavior drift between them.
- [x] **Fixed**: corrected the Tigris public URL pattern in `server/utils/storage/tigris.ts`. Phase 1's documented `pub-<bucket>.fly.storage.tigris.dev` is no longer routed by Tigris (it resolves to a missing bucket named `pub-maan-media`). The working pattern is `https://<bucket>.fly.storage.tigris.dev/<key>`. Also re-applied `fly storage update maan-media --public` because the bucket was returning `AccessDenied` despite Phase 1's intent.

Verification (against `localhost:3000` with a throwaway test user, all passed):
- ✅ `pnpm exec nuxt typecheck` clean.
- ✅ `POST /api/upload` without session → `401`.
- ✅ `POST /api/upload` with session + valid 85-byte PNG → `201` + `{ url, key, size: 85, contentType: 'image/png' }`.
- ✅ `GET` on the returned URL → `200` with `cache-control: public, max-age=31536000, immutable` and `content-type: image/png` (Tigris CDN delivered).
- ✅ `POST` of a `text/plain` file → `400 Unsupported MIME type: text/plain`.
- ✅ `POST` of a 6 MB PNG → `413 File too large (6.0 MB). Max 5 MB`.

Out of scope, deferred to Phase 7:
- Tightening `requireUserSession(event)` on the upload route to `{ user: { role: ['admin', 'writer'] } }` once the seeded users have proper roles assigned.
- A "Hero image" picker on the post/page form (separate from inline editor images — `Post.image` is already a column).
- Drag-and-drop into the editor (currently click-the-button only).

Notes:
- The auto-injected Tigris key for the bucket is **write-scoped**: it can `PutObject` and `HeadObject` but cannot `ListObjectsV2`, `DeleteObject`, `GetBucketAcl`, or `PutBucketPolicy`. Smart default; means smoke-test objects can't be cleaned up programmatically (they're 85 bytes each, irrelevant to production).

### Phase 7 — Drop Directus ✅

The dashboard and public site run entirely off Prisma; this phase cuts the last threads.

What landed:
- [x] `nuxt-directus` removed from `nuxt.config.ts` modules and from `package.json` dependencies (`pnpm remove nuxt-directus`).
- [x] `directusToken` + `public.directus.url` removed from `nuxt.config.ts` `runtimeConfig`; the `directusUrl`/`directusToken` env-var reads at the top of the file also gone.
- [x] `NUXT_PUBLIC_DIRECTUS_URL` / `DIRECTUS_SERVER_TOKEN` removed from `.env.example` (Phase 5 already removed them from `.env`).
- [x] `README.md` rewritten — stack section now lists Nuxt 4 + Prisma 7 + Fly Postgres + Better Auth + Tigris; removed the Railway template variables block; added a pointer to MIGRATION.md and the `fly proxy` requirement for local dev.
- [x] `server/utils/dashboard-directus.ts` — already deleted in Phase 5.
- [x] Component rename: `MaanDirectusForm.vue` → `MaanForm.vue`; updated four consumers (`/`, `/blog`, `/contact`, `/ar/contact`).
- [x] Stale `// Directus` comments either removed (`server/api/dashboard/posts/[id].delete.ts`) or kept as deliberate historical context (`dashboard-shapes.ts`, `useMaanContent.ts` — they explain why the wire shape is still snake_case).
- [x] `prisma/seed.ts` header marked **HISTORICAL** — it's the one-time data-migration script and will stop working when the Directus service is shut down. Stays in the repo for traceability; future seed work belongs in a new script.

Verification (`pnpm dev` against `localhost:3000`, all passed):
- ✅ `pnpm exec nuxt typecheck` clean.
- ✅ `grep -rE "directus|Directus" app/ server/ --include='*.ts' --include='*.vue'` returns zero non-comment matches.
- ✅ `grep "nuxt-directus" package.json` returns nothing.
- ✅ All seven public surfaces serve `200`: `/`, `/blog`, `/contact`, `/ar`, `/ar/blog`, `/ar/contact`, `/dashboard/login`.
- ✅ `/blog` renders the post listing (Prisma-sourced) with the correct `<title>` and hero `<h1>`.
- ✅ Homepage renders the form-block headline "Family Resources / Receive practical guidance…" from `FormBlock` (Prisma-sourced).
- ✅ Railway's Directus service can now be shut down without breaking the app.

Deliberately out of scope (could land later but don't need to ship before retiring Directus):
- Renaming `DashboardPost`/`DashboardPage` → `Post`/`Page` and flipping the response wire shape from snake_case to camelCase. Bigger touch surface; not required for correctness.
- Tightening `requireUserSession(event)` to `{ user: { role: ... } }` per route, once we decide writer/admin granularity.
- Deleting the email-less Frontend Bot User row left over from Phase 3 (inert; was excluded from auth migration on purpose).
- ~~Production hosting decision (Phase 3.5)~~: resolved — see Phase 3.5 above. App lives at `https://maan.center`.

### Decommissioning Railway

After Phase 3.5 landed and DNS pointed at Fly, Railway became dead weight. The following needs to happen at <https://railway.app> manually (no flyctl-equivalent):

1. Confirm DNS no longer points at Railway: `dig +short A maan.center` should return `66.241.124.39` (Fly), not `66.33.22.105` (Railway's ASN AS400940).
2. In the Railway project that hosted the legacy Nuxt deploy: **Settings → Danger → Delete service**. The deploy stops billing immediately.
3. Same for the Directus service — `directus-cms-production-76ca.up.railway.app` per `.vscode/mcp.json`. After this `prisma/seed.ts` will hard-fail; that's expected since the script was historical (see its header comment).
4. Any Railway Postgres database the old deploys used can be deleted once #2 + #3 are gone.
5. Remove `maan-directus` from `.vscode/mcp.json` (the MCP server config Claude was using to grep Directus during the migration).
6. The Railway project itself can be archived/deleted from the workspace.

Once Railway is empty, the only third-party surfaces left in the stack are Fly.io (Postgres + app + Tigris) and the domain registrar.

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| **Data loss during seed** | Phase 3 seeds into the new Fly Postgres database. Original Directus stays running until Phase 7. Roll back by checking out `main`. |
| **Sessions invalidated on auth swap** | Phase 4 forces re-login. Coordinate with the team — send an email before the deploy. Better Auth supports `passwordReset` flow if seeded passwords are temporary. |
| **Permalink collisions** | Both Directus pages collection and Prisma `Page.permalink` use unique strings. Seed enforces unique constraint; duplicates surface immediately. |
| **Image references in post `content`** | Directus assets URLs point at `/assets/{file-id}`. If any post body contains such URLs, they break when Directus is shut down. Audit `Post.content` in Phase 5 — likely zero hits because posts were imported as HTML from the Blogger site. |
| **Bilingual content (`/ar/*` pages)** | The current schema mixes EN + AR rows differentiated by `permalink` prefix. Prisma schema preserves this verbatim. No code change needed. |
| **Form submissions during cutover** | Phase 4 + 5 ship together for forms — Better Auth and Prisma must both be live before `/api/forms/submit.post.ts` switches over. Otherwise, a submission could be lost. |
| **Fly Postgres only reachable via flycast or proxy** | Resolved (Phase 3.5): production app deploys to Fly as `maan-app` co-located with `maan-db` in `cdg` and reaches the DB via flycast natively. Local dev uses `fly proxy 5432 -a maan-db`. |

## Decisions made (locked in for this migration)

1. **Postgres host: Fly.io Legacy Postgres** in the `maan` org. Provisioned via `fly postgres create --org maan`. Single instance for now; we can fork for staging/PR-preview environments later via `fly postgres fork`.
2. **Object storage / CDN: Fly.io Tigris** in the `maan` org. Provisioned via `fly storage create --org maan`. S3-compatible API + global edge cache out of the box; the public bucket URL is the CDN URL. Used for rich-text editor image uploads.
3. **Auth: Better Auth with the `admin` plugin.** Code-defined roles, no Directus-style permission rule tables.
4. **Existing user passwords: temporary seeded passwords + email reset.** Phase 3 seeds users with random temporary passwords; Phase 4 ships with a "Set your password" flow triggered on first sign-in (Better Auth's `passwordReset` flow with an emailed token). The Directus accounts (`writer@example.com`, `example@email.com`, etc.) receive an email at cutover.
5. **Cutover window: approved.** Phase 4 (auth swap) and Phase 7 (drop Directus) ship together at the end of the migration window. Brief team notice ("you'll be prompted to set a new password on next sign-in") before deployment.

Each phase ends in a commit on `prisma-switch`. When the branch is ready for production, we either fast-forward to `main` or open a PR for review.

## Effort estimate

| Phase | Solo coding time | Test/verify time |
|---|---|---|
| 1. Prisma + Postgres + Tigris scaffold | 45–60 min | 20 min |
| 2. Schema + initial migration | 1–1.5 hr | 30 min |
| 3. Data dump + seed | 45 min | 30 min (data spot-checks) |
| 4. Auth swap (Better Auth) | 1.5–2 hr | 1 hr (end-to-end login flows) |
| 5. Server endpoint swap | 2–3 hr | 1 hr |
| 6. Image uploads via Tigris | 45–60 min | 30 min |
| 7. Drop Directus | 30 min | 15 min |
| **Total** | **~7.5–9.5 hr** | **~4.25 hr** |

Realistically: **2–3 working sessions**, with the auth swap (Phase 4) still the longest single piece.

## Skill references for the migration

- `prisma-nuxt-setup` — the canonical pattern this migration follows.
- `prisma-cli` — for `prisma migrate`, `prisma generate`, seeding.
- `prisma-postgres` — if we ever swap Fly.io Postgres for Prisma's hosted Postgres.
- `prisma-client-api` — query patterns once we start writing server routes against Prisma.
- `better-auth-best-practices` — Better Auth server config + session management.
- `nuxt-better-auth` — `@onmax/nuxt-better-auth` module integration.
- `create-auth-skill` — if we hit edge cases not covered by the other auth skills.

## Out of scope (explicit)

These came up while writing this plan and were deliberately deferred:

- **Public REST surface.** The current `nuxt-directus` module gave us a public REST API for free (whether we wanted it or not). After the migration there's no public REST — every external read goes through our own Nitro routes (`/api/pages/by-permalink`, `/api/pages/navigation`, etc.).
- **Audit log.** Directus has a `directus_activity` table that records every mutation. We don't currently use it. If we want one later, Better Auth has a session log and Prisma supports middleware-style hooks for change capture — but adding this now expands scope without solving a known problem.
- **Image transformations** (resize, crop, format-conversion on-the-fly). Tigris serves what we upload — no Imgix-style URL params. If editors upload a 4MB original, that's what the public URL serves. Phase 6 enforces a content-size cap but doesn't transform. If we need transformations later, the cleanest add is a Cloudflare Image Resizing layer in front of the Tigris URL, or a `sharp`-based `/api/img.get.ts` route that streams resized variants from origin.

Phase 1 is unblocked and ready to start.
