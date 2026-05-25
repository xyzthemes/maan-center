-- Add staff permissions array to User.
--
-- Empty default ([]) ensures admins (role='admin') keep working — they
-- bypass the permissions check in server/utils/permissions.ts. Newly
-- created staff (role='staff') start with no permissions until the
-- admin grants them via the dashboard.

ALTER TABLE "User"
  ADD COLUMN "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
