// Type-narrowed check for Prisma's well-known error codes
// (https://www.prisma.io/docs/orm/reference/error-reference).
// Lets route handlers branch on specific failures (P2025 "Record not found",
// P2002 "Unique constraint failed") without `as any` casts.

export const isPrismaError = (e: unknown, code: string): boolean =>
  typeof e === 'object'
  && e !== null
  && 'code' in e
  && (e as { code: unknown }).code === code
