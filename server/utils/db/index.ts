// `db` is the canonical shorthand for the Prisma client across server code.
// `prisma` itself is exported from ./client and auto-imported separately —
// re-exporting both here would create a duplicate-auto-import warning from Nitro.
export { prisma as db } from './client'
