import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '~~/prisma/generated/client'

// Singleton Prisma client. Survives Nuxt HMR via globalThis caching —
// without this, every save during `nuxt dev` would leak a fresh Pool
// and exhaust Postgres connections after a few edits.

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined
}

// pg Pool tuned for the Fly Postgres flycast/proxy connection.
// - max: 10 — modest cap; Fly's smallest tier has ~100 conn limit
// - idleTimeoutMillis: 10s — drop stale conns before the host's idle timeout
// - keepAlive: true — surfaces dead conns earlier instead of silently hanging
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000
})

// CRITICAL: absorb idle-connection errors. Without this, a server-side
// connection termination emits an unhandled error event and can crash Node.
// The pool rebuilds the connection on the next query.
pool.on('error', (err: Error) => {
  console.warn('[pg-pool] Idle client error:', err.message)
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaPg(pool)
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
