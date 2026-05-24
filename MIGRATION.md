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

  Auto-injected env vars are in `.env`: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION=auto`, `AWS_ENDPOINT_URL_S3=https://fly.storage.tigris.dev`, `BUCKET_NAME=maan-media`. Public CDN URL pattern: `https://pub-maan-media.fly.storage.tigris.dev/<key>`.

- [ ] Sync `DATABASE_URL` + the five Tigris env vars to the Railway production environment (deferred until Phase 5 / deploy time — Phase 1's code-side scaffolding doesn't need production runtime).

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

### Phase 4 — Auth swap

Replace Directus session cookies with Better Auth. This is the highest-risk phase — the team will need to re-authenticate.

- Install `@onmax/nuxt-better-auth` and the Better Auth core.
- Configure Better Auth in `server/utils/auth.ts` with the Prisma adapter pointing at our new `prisma` client.
- Replace `server/api/dashboard/login.post.ts` with Better Auth's `signIn` flow (or use Better Auth's prebuilt `/api/auth/*` handler).
- Replace `server/api/dashboard/logout.post.ts` with Better Auth's `signOut`.
- Replace `server/api/dashboard/me.get.ts` with Better Auth's `getSession`.
- Replace the `getDashboardAccessToken` / `dashboardDirectusRequest` plumbing in `server/utils/dashboard-directus.ts` with a `requireAuth(event)` helper that returns the current session.
- Replace `loadMe` in `useDashboardUser.ts` with Better Auth's `useUserSession()` composable (provided by `@onmax/nuxt-better-auth`).
- Use Better Auth's **`admin` plugin** for role gating. The plugin provides built-in `Admin`, `Manager`, `Writer` roles with permission helpers and a `requireRole(...)` server utility — no custom middleware needed. We'll map the existing Directus role names (`Content Admin` → `admin`, `Writer` → `user` with elevated permissions, etc.) during the seed.

Verification:
- Sign in at `/dashboard/login` with the seeded `writer@example.com` account.
- Reach `/dashboard/posts` and see the post list (now coming from Prisma).
- Sign out, then verify protected routes 302 to `/dashboard/login`.

### Phase 5 — Server endpoint swap

This is mechanical but touches every API route. One PR-able commit per collection keeps reviews tight.

| Today | After |
|---|---|
| `dashboardDirectusRequest(event, '/items/posts', { ... })` | `prisma.post.findMany({ where: { ... } })` |
| `dashboardDirectusRequest(event, '/items/posts', { method: 'POST', body: ... })` | `prisma.post.create({ data: ... })` |
| `dashboardDirectusRequest(event, '/items/posts/{id}', { method: 'PATCH', body: ... })` | `prisma.post.update({ where: { id }, data: ... })` |
| `dashboardDirectusRequest(event, '/items/posts/{id}', { method: 'DELETE' })` | `prisma.post.delete({ where: { id } })` |

Files to migrate, in order:
1. `server/api/dashboard/posts/*.ts` (5 files)
2. `server/api/dashboard/pages/*.ts` (4 files)
3. `server/api/dashboard/submissions.get.ts`
4. `server/api/pages/navigation.get.ts` + `server/api/pages/by-permalink.get.ts` (public)
5. `server/api/forms/submit.post.ts` (writes a public submission)
6. `server/api/__sitemap__/urls.ts` (reads posts for sitemap)
7. `app/composables/useMaanContent.ts` — switch from `useDirectusItems()` to `$fetch('/api/pages/...')` or use Nitro's `useRequestFetch` to call our own routes during SSR.
8. `app/composables/useMaanForms.ts` — same swap.

Verification per file:
- `pnpm exec nuxt typecheck` clean.
- The corresponding dashboard/public route loads and shows the right data.
- For mutating endpoints (POST/PATCH/DELETE), end-to-end test the dashboard flow: create a page, edit it, delete it.

### Phase 6 — Image uploads via Tigris (rich-text editor wiring)

The Tigris bucket and the `uploadObject` helper exist from Phase 1; this phase wires them into the dashboard.

Code-side:
- Add `server/api/upload.post.ts` — authenticated (Better Auth `requireRole(['admin', 'writer'])`). Accepts a `multipart/form-data` file. Generates a key like `posts/${ulid()}-${slugify(originalName)}`. Calls `uploadObject`. Returns `{ url }`.
- Enable the image button in the dashboard `UEditor` (currently `:image="false"` in both `PostEditorForm.vue` and `PageEditorForm.vue`). Wire the upload to `/api/upload.post.ts` and insert the returned URL as an `<img>` into the editor.
- Add an `alt` text prompt before the URL is inserted (accessibility — a11y audits flag image-without-alt).
- Optional: add a content-size cap (e.g. 5 MB) and a MIME-type allowlist (`image/png`, `image/jpeg`, `image/webp`, `image/avif`) at the API route. Reject anything else with a 400.

Verification:
- Sign in as a writer, open a post, click the editor's image button, pick a 200KB PNG, confirm it appears inline.
- Hit the returned public URL directly in a browser and confirm it serves with `cache-control: public, max-age=31536000` (Tigris default).
- Try uploading a 10MB file and confirm the 400 response.
- Try uploading without an admin session — confirm 401.

### Phase 7 — Drop Directus

Once the dashboard and public site work entirely off Prisma:

- Remove `nuxt-directus` from `nuxt.config.ts` modules.
- Remove `nuxt-directus` from `package.json` dependencies.
- Delete `server/utils/dashboard-directus.ts`.
- Remove `NUXT_PUBLIC_DIRECTUS_URL` and `DIRECTUS_SERVER_TOKEN` from `.env.example`, `README.md`, `nuxt.config.ts` `runtimeConfig`.
- Delete the Directus type definitions (`DirectusPost`, `DirectusPage`, `DirectusForm`, etc.) — replaced by Prisma's generated types.
- Optional: rename the existing `DashboardPost` / `DashboardPage` composable types to just `Post` / `Page` since there's no longer ambiguity.

Verification:
- `grep -r "directus\|Directus" app/ server/ --include='*.ts' --include='*.vue'` returns zero matches outside of comments.
- The Railway Directus service can be shut down without breaking the app.

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| **Data loss during seed** | Phase 3 seeds into the new Fly Postgres database. Original Directus stays running until Phase 7. Roll back by checking out `main`. |
| **Sessions invalidated on auth swap** | Phase 4 forces re-login. Coordinate with the team — send an email before the deploy. Better Auth supports `passwordReset` flow if seeded passwords are temporary. |
| **Permalink collisions** | Both Directus pages collection and Prisma `Page.permalink` use unique strings. Seed enforces unique constraint; duplicates surface immediately. |
| **Image references in post `content`** | Directus assets URLs point at `/assets/{file-id}`. If any post body contains such URLs, they break when Directus is shut down. Audit `Post.content` in Phase 5 — likely zero hits because posts were imported as HTML from the Blogger site. |
| **Bilingual content (`/ar/*` pages)** | The current schema mixes EN + AR rows differentiated by `permalink` prefix. Prisma schema preserves this verbatim. No code change needed. |
| **Form submissions during cutover** | Phase 4 + 5 ship together for forms — Better Auth and Prisma must both be live before `/api/forms/submit.post.ts` switches over. Otherwise, a submission could be lost. |
| **Fly Postgres only reachable via flycast or proxy** | Local dev uses `fly proxy 5432 -a maan-db`. Production reachability from Railway needs a Phase-3.5 decision: allocate a public IP (`fly ips allocate-v4`) or move the deploy to Fly. Blocks Phase 5 going to production; doesn't block any earlier phase. |

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
