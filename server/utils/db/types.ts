// Re-exports of Prisma's generated types. Route code MUST import from here
// (auto-imported by Nitro) and never from `~~/prisma/generated/client` directly.
// This seam means we can change the generator `output` path or rename the
// generated package without touching every route file.

// PrismaClient is both a runtime value (the constructor) and a type — declare
// the value form here so consumers can use it directly if they need to.
export { PrismaClient } from '~~/prisma/generated/client'

// Enums are both runtime values (the keyed object) and types
export { ContentStatus } from '~~/prisma/generated/client'

// Model types — add as routes start consuming them
export type {
  User,
  Session,
  Account,
  Verification,
  Post,
  Page,
  Form,
  FormField,
  FormBlock,
  FormSubmission,
  FormSubmissionValue
} from '~~/prisma/generated/client'
