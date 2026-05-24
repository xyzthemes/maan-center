// Re-exports of Prisma's generated types. Route code MUST import from here
// (auto-imported by Nitro) and never from `~~/prisma/generated/client` directly.
// This seam means we can change the generator `output` path or rename the
// generated package without touching every route file.

export type { PrismaClient } from '~~/prisma/generated/client'

// Model + enum re-exports are added as the schema grows. Keep this list
// to types actually consumed by app code — unused re-exports bloat the
// Nitro auto-import surface.
