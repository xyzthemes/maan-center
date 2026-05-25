// Server-side permission gate. Replaces the blanket
//   `requireUserSession(event, { user: { role: 'admin' } })`
// pattern with a scoped check that lets admins through unconditionally
// and otherwise verifies the user's permissions array.
//
// Usage in an API endpoint:
//   export default defineEventHandler(async (event) => {
//     await requirePermission(event, 'posts')
//     // …
//   })
//
// The Staff section uses `requireAdmin(event)` instead — there is no
// `staff` scope. Admins manage other admins; staff can never manage
// staff (no escalation path).

import type { H3Event } from 'h3'
import { createError } from 'h3'
import type { PermissionScope } from '~~/app/utils/permissions'

type StaffUser = { role?: string | null, permissions?: string[] | null }

export const requirePermission = async (event: H3Event, scope: PermissionScope) => {
  const session = await requireUserSession(event)
  const user = session.user as StaffUser

  if (user.role === 'admin') return session
  if (!user.permissions || !user.permissions.includes(scope)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You don\'t have access to this section.'
    })
  }
  return session
}

export const requireAdmin = async (event: H3Event) => {
  const session = await requireUserSession(event)
  if ((session.user as StaffUser).role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin only.' })
  }
  return session
}

/** Gate that admits a user who has ANY of the given scopes. Used by
 *  the upload endpoint, since image uploads serve every editing
 *  surface (posts, pages, blocks, forms). */
export const requireAnyPermission = async (event: H3Event, scopes: PermissionScope[]) => {
  const session = await requireUserSession(event)
  const user = session.user as StaffUser

  if (user.role === 'admin') return session
  const granted = new Set(user.permissions || [])
  if (!scopes.some(s => granted.has(s))) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You don\'t have access to this section.'
    })
  }
  return session
}
