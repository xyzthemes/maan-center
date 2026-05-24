# Maan Special Education Center

A bilingual (EN + AR) Nuxt website, blog, and editor dashboard for a special education center.

## Stack

- **Nuxt 4** + **Nuxt UI** + **Nuxt SEO**
- **Prisma 7** (multi-file schema, `prisma-client` generator, `@prisma/adapter-pg`)
- **Postgres** on Fly.io (`maan-db`, region `cdg`)
- **Better Auth** (`@onmax/nuxt-better-auth` module + `admin` plugin) for dashboard sessions
- **Tigris** (Fly.io's S3-compatible object storage) for editor image uploads
- **Fly.io** hosts the app (`maan-app`, region `cdg`)

> The Directus + Railway template that originally backed this repo was replaced by the stack above in commits `560e055..f1c1a49` on the `prisma-switch` branch. See `MIGRATION.md` for the full migration log.

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
pnpm db:seed         # one-off: re-pull from the legacy Directus instance (HISTORICAL)
pnpm typecheck       # nuxt typecheck
pnpm lint            # eslint .
```

## Production deploy (Fly.io)

The app deploys to Fly.io as `maan-app`. Canonical URL: <https://maan.center>. `www.maan.center` 301-redirects to the apex (see `server/middleware/redirect-www.ts`). The platform URL <https://maan-app.fly.dev> stays reachable too.

```bash
fly deploy           # build + push image, run release_command (prisma migrate deploy), flip traffic
fly logs -a maan-app # tail production logs
fly status -a maan-app
fly ssh console -a maan-app
```

The deploy is configured by:

- `fly.toml` — app name, region (`cdg`, co-located with the database), VM size, autoscaling, and the `release_command` that runs `prisma migrate deploy` before traffic flips.
- `Dockerfile` — multi-stage build that generates the Prisma client, builds Nitro's `node-server` output, and produces a slim runner image. Note: the build stage carries a placeholder `BETTER_AUTH_SECRET` because `@onmax/nuxt-better-auth` enforces presence of the env var at build time; the real secret comes from Fly secrets and overrides it at boot.
- `.dockerignore` — keeps the build context small and avoids leaking local `.env` into the image.

Production secrets (set with `fly secrets set --app maan-app KEY=value`):

```
DATABASE_URL          # postgres://...@maan-db.flycast:5432/postgres?sslmode=disable
BETTER_AUTH_SECRET    # 32+ chars; openssl rand -base64 32
BETTER_AUTH_URL       # https://maan-app.fly.dev or custom domain
AWS_ACCESS_KEY_ID     # Tigris key (from fly storage create maan-media)
AWS_SECRET_ACCESS_KEY # Tigris secret
BUCKET_NAME           # maan-media
```

`AWS_REGION` and `AWS_ENDPOINT_URL_S3` are non-secret and set in `fly.toml`'s `[env]`.

The Fly Postgres `flycast` address does not speak TLS — `?sslmode=disable` on `DATABASE_URL` is required. The connection itself is inside Fly's private WireGuard mesh and never leaves it.

### Custom domain

Current setup: `maan.center` (canonical) + `www.maan.center` (301 → apex).

DNS at the registrar:

| Type | Host | Value |
|---|---|---|
| A | `@` | `66.241.124.39` (Fly shared IPv4) |
| AAAA | `@` | `2a09:8280:1::11a:7075:0` (Fly dedicated IPv6 for `maan-app`) |
| A | `www` | `66.241.124.39` |
| AAAA | `www` | `2a09:8280:1::11a:7075:0` |

If `maan-app`'s IPs change, get the fresh values with `fly ips list -a maan-app`. To add another host:

```bash
fly certs add <new-host> -a maan-app
fly certs check <new-host> -a maan-app   # poll until Status: Issued
```

Then point DNS at the IPs above and update `BETTER_AUTH_URL` + `NUXT_SITE_URL` secrets if you want the new host to become canonical.
