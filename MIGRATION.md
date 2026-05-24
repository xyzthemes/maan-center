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
- **Lower running cost**: one Postgres instance (Neon/Railway) instead of a Directus service + its database.

## Non-goals

- No frontend redesign. The dashboard, public site, blog, contact form continue to look and behave exactly as they do today.
- No new entities or features. We migrate the schema we have. Net-new features wait until the migration lands.
- No public-content rewrite. The blog reads from the new database, but we don't change article content.

## Target stack

| Concern | Today (Directus) | After migration |
|---|---|---|
| Database | Directus's Postgres (managed by Directus) | Postgres on Neon (managed by us) |
| ORM / query layer | `$fetch` → Directus REST | Prisma 7 with `@prisma/adapter-pg` |
| Auth | Directus sessions + cookies | Better Auth (`@onmax/nuxt-better-auth` module) |
| Roles / permissions | Directus policies + `/permissions` rows | Better Auth `admin` plugin OR custom `role` field on `User` |
| File uploads (future) | Directus `/assets/{id}` | Vercel Blob / Cloudflare R2 (deferred) |
| Public REST consumers | `nuxt-directus` module | Internal Nitro routes only — no public REST surface |

## Phase plan (six phases, ~2–3 sessions of work)

Each phase ships independently. After every phase, the app still builds, lints, and types cleanly. Don't merge mid-phase.

### Phase 1 — Prisma + Postgres scaffold

Owner-action items:
- [ ] Provision a **Fly.io Legacy Postgres** cluster: `fly postgres create --name maan-db --region <region>`. Capture the `DATABASE_URL` from `fly postgres attach` or `fly secrets list`.
- [ ] Add the `DATABASE_URL` to local `.env` (for migrations + seed) and to Railway env vars (for production runtime). The connection string typically looks like `postgres://<user>:<pass>@<app>.internal:5432/<db>?sslmode=disable` when the Nuxt app also runs on Fly, or the public proxy URL otherwise.

Code-side:
- Install deps: `prisma@^7`, `@prisma/client@^7`, `@prisma/adapter-pg@^7`, `pg`.
- Add `prisma.config.ts` at the repo root pointing to `prisma/schema/`.
- Add scripts to `package.json`: `db:generate`, `db:migrate`, `db:studio`, `db:seed`.
- Bootstrap `prisma/schema/base.prisma` with the `prisma-client` generator + `datasource db` block.
- Create `server/utils/db/client.ts` — a singleton `PrismaClient` with `PrismaPg` adapter and a `pool.on('error')` handler (required for Neon's auto-suspend behavior).
- Create `server/utils/db/types.ts` re-exporting Prisma's generated types.
- Create `server/utils/db/index.ts` re-exporting `prisma` for Nitro auto-import.
- Add `prisma/generated/` to `.gitignore`.

Verification:
- `pnpm db:generate` succeeds, types appear in `prisma/generated/`.
- In a throwaway Nitro route, `await prisma.$queryRaw\`SELECT 1\`` returns `[ { '?column?': 1 } ]`.
- `pnpm exec nuxt typecheck` clean.

### Phase 2 — Schema + initial migration

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

Verification:
- `pnpm db:migrate dev --name init` against a clean Neon branch succeeds.
- `prisma/migrations/<timestamp>_init/migration.sql` committed.

### Phase 3 — Data dump + seed from Directus

Move the existing content over so we don't lose any work:

- Write `prisma/seed.ts` that fetches `posts`, `pages`, `forms`, `form_fields`, `form_submissions` from the current Directus instance using the existing MCP token, and `prisma.<model>.upsert`s them into the new database.
- Map Directus ids → keep them as the Prisma ids (they're UUIDs already; no remapping needed). This means relations and external bookmarks/permalinks still resolve.
- One-off `seed:users` step: create User rows for the four Directus users we know about (`writer@example.com`, etc.). Better Auth needs them to exist with hashed passwords; either prompt password reset on first sign-in or set temporary passwords and email the team.
- Run `pnpm db:seed` against the Neon database.

Verification:
- `SELECT count(*) FROM "Post"` matches the Directus post count (we have ~30 today).
- `SELECT count(*) FROM "Page"` matches.
- `SELECT count(*) FROM "FormSubmission"` matches.
- Spot-check that one post's `content` field is identical byte-for-byte to its Directus equivalent.

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

### Phase 6 — Drop Directus

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
| **Data loss during seed** | Phase 3 seeds into a *separate* Neon database. Original Directus stays running until Phase 6. Roll back by checking out `main`. |
| **Sessions invalidated on auth swap** | Phase 4 forces re-login. Coordinate with the team — send an email before the deploy. Better Auth supports `passwordReset` flow if seeded passwords are temporary. |
| **Permalink collisions** | Both Directus pages collection and Prisma `Page.permalink` use unique strings. Seed enforces unique constraint; duplicates surface immediately. |
| **Image references in post `content`** | Directus assets URLs point at `/assets/{file-id}`. If any post body contains such URLs, they break when Directus is shut down. Audit `Post.content` in Phase 5 — likely zero hits because posts were imported as HTML from the Blogger site. |
| **Bilingual content (`/ar/*` pages)** | The current schema mixes EN + AR rows differentiated by `permalink` prefix. Prisma schema preserves this verbatim. No code change needed. |
| **Form submissions during cutover** | Phase 4 + 5 ship together for forms — Better Auth and Prisma must both be live before `/api/forms/submit.post.ts` switches over. Otherwise, a submission could be lost. |

## Decisions made (locked in for this migration)

1. **Postgres host: Fly.io Legacy Postgres.** Provisioned via `fly postgres create`. Single instance for now; we can clone for staging/PR-preview environments later if needed.
2. **Auth: Better Auth with the `admin` plugin.** Code-defined roles, no Directus-style permission rule tables.
3. **Existing user passwords: temporary seeded passwords + email reset.** Phase 3 seeds users with random temporary passwords; Phase 4 ships with a "Set your password" flow triggered on first sign-in (Better Auth's `passwordReset` flow with an emailed token). The Directus accounts (`writer@example.com`, `example@email.com`, etc.) receive an email at cutover.
4. **Cutover window: approved.** Phase 4 (auth swap) and Phase 6 (drop Directus) ship together at the end of the migration window. Brief team notice ("you'll be prompted to set a new password on next sign-in") before deployment.

Each phase ends in a commit on `prisma-switch`. When the branch is ready for production, we either fast-forward to `main` or open a PR for review.

## Effort estimate

| Phase | Solo coding time | Test/verify time |
|---|---|---|
| 1. Prisma scaffold | 30–45 min | 15 min |
| 2. Schema + initial migration | 1–1.5 hr | 30 min |
| 3. Data dump + seed | 45 min | 30 min (data spot-checks) |
| 4. Auth swap (Better Auth) | 1.5–2 hr | 1 hr (end-to-end login flows) |
| 5. Server endpoint swap | 2–3 hr | 1 hr |
| 6. Drop Directus | 30 min | 15 min |
| **Total** | **~6–8 hr** | **~3.5 hr** |

Realistically: **2–3 working sessions**, with the auth swap (Phase 4) being the longest single piece.

## Skill references for the migration

- `prisma-nuxt-setup` — the canonical pattern this migration follows.
- `prisma-cli` — for `prisma migrate`, `prisma generate`, seeding.
- `prisma-postgres` — if we go with Prisma's hosted Postgres instead of Neon.
- `prisma-client-api` — query patterns once we start writing server routes against Prisma.
- `better-auth-best-practices` — Better Auth server config + session management.
- `nuxt-better-auth` — `@onmax/nuxt-better-auth` module integration.
- `create-auth-skill` — if we hit edge cases not covered by the other auth skills.

## Out of scope (explicit)

These came up while writing this plan and were deliberately deferred:

- **File / image uploads.** Posts and pages are HTML-only today and the rich-text editor doesn't ship image upload. When that becomes a real requirement, we add Vercel Blob or Cloudflare R2 behind a `server/api/upload.post.ts` route. Until then, Directus's `/assets/{id}` endpoint isn't replaced — and we don't need to, because nothing references it.
- **Public REST surface.** The current `nuxt-directus` module gave us a public REST API for free (whether we wanted it or not). After the migration there's no public REST — every external read goes through our own Nitro routes (`/api/pages/by-permalink`, `/api/pages/navigation`, etc.).
- **Audit log.** Directus has a `directus_activity` table that records every mutation. We don't currently use it. If we want one later, Better Auth has a session log and Prisma supports middleware-style hooks for change capture — but adding this now expands scope without solving a known problem.

Phase 1 is unblocked and ready to start.
