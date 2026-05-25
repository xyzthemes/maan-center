# Multi-stage Dockerfile for Nuxt 4 + Prisma 7 on Fly.io.
#
# Why this shape:
# - `prisma generate` runs in the builder stage so the generated client (we
#   emit to `prisma/generated/`, not `node_modules/.prisma`) makes it into the
#   final image. Skipping this step gives cryptic "PrismaClient initialization
#   failed" errors at runtime.
# - The runner stage uses pnpm to install production deps fresh — we don't
#   ship the full builder node_modules because it includes dev dependencies.
# - Nitro's `node-server` preset emits a self-contained .output/ tree, but we
#   still need node_modules at runtime for Prisma's pg adapter + AWS SDK
#   (those are external deps not bundled by Rollup).

FROM node:22-bookworm-slim AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client into ./prisma/generated/ (see prisma/schema/base.prisma).
RUN pnpm db:generate
# `@onmax/nuxt-better-auth` validates BETTER_AUTH_SECRET at build time, not just
# runtime. The real secret comes from Fly secrets and overrides this at boot —
# this placeholder only satisfies the build-time check.
ENV BETTER_AUTH_SECRET=build-time-placeholder-overridden-at-runtime-by-fly-secrets
ENV BETTER_AUTH_URL=https://placeholder.invalid
# Nitro's server build (Rollup + Vite + tree-shaking the entire Nuxt+Prisma+
# better-auth surface) blows past Node's default 2 GB heap. We've watched it
# creep up as the codebase grew (4 GB used to be comfortable, then OOM'd at
# the redesign merge that added the CMS + forms + theme + staff layers).
# 6 GB gives Nitro room to grow before the next time. Fly's default remote
# builder has ~8 GB so this still fits.
ENV NODE_OPTIONS=--max-old-space-size=6144
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Production node_modules — runtime needs pg + adapter-pg + aws-sdk + better-auth
# which Nitro doesn't bundle.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile --prod

# The Prisma generator output (queryCompiler runtime).
COPY --from=builder /app/prisma/generated ./prisma/generated

# Schema + migrations + prisma.config.ts — needed so the release_command
# (`prisma migrate deploy`) can find the schema in the one-off release machine.
COPY --from=builder /app/prisma/schema ./prisma/schema
COPY --from=builder /app/prisma/migrations ./prisma/migrations
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Nitro's compiled output.
COPY --from=builder /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
