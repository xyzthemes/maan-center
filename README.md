# Maan Special Education Center

A bilingual (EN + AR) Nuxt website, blog, and editor dashboard for a special education center.

## Stack

- **Nuxt 4** + **Nuxt UI** + **Nuxt SEO**
- **Prisma 7** (multi-file schema, `prisma-client` generator, `@prisma/adapter-pg`)
- **Postgres** on Fly.io (`maan-db`, region `cdg`)
- **Better Auth** (`@onmax/nuxt-better-auth` module + `admin` plugin) for dashboard sessions
- **Tigris** (Fly.io's S3-compatible object storage) for editor image uploads, served via Fly's anycast edge

> The Directus + Railway template that originally backed this repo was replaced by the stack above in commits `560e055..58fa54c` on the `prisma-switch` branch. See `MIGRATION.md` for the full migration log.

## Local Development

Install dependencies:

```bash
pnpm install
```

Bring up the Fly Postgres tunnel in a separate terminal — the database is flycast-only and not reachable from your laptop without it:

```bash
fly proxy 5432 -a maan-db
```

Then start Nuxt:

```bash
pnpm dev
```

The app expects the env vars in `.env.example` to be set. The Better Auth + Tigris credentials are written to `.env` when you provision the Fly resources via `fly postgres create` / `fly storage create`.

Useful scripts:

```bash
pnpm db:generate     # regenerate prisma/generated/client
pnpm db:migrate      # prisma migrate dev
pnpm db:studio       # open Prisma Studio against Fly Postgres
pnpm db:seed         # re-run the seed (see prisma/seed.ts)
pnpm typecheck       # nuxt typecheck
pnpm lint            # eslint .
```

## Build + Production

```bash
pnpm build
pnpm start
```

Production deployment target is deferred (`MIGRATION.md` Phase 3.5) — choices are (a) allocate a public IP for Fly Postgres so Railway can reach it, or (b) move the deploy to Fly.io so the flycast address works natively.
