// Per-section permission scopes — the only role tier check the
// dashboard exposes to admins is "Admin (full access)" vs "Staff
// (scoped)". For staff users, this enum decides which sidebar entries
// they see and which APIs they can call.
//
// Adding a new section to the dashboard? Add the scope here AND wire
// up the matching API endpoints with `requirePermission(event, scope)`
// (see server/utils/permissions.ts). The middleware + sidebar filter
// read this list directly so no extra files need touching.

export const PERMISSION_SCOPES = [
  'posts',
  'pages',
  'blocks',
  'forms',
  'submissions',
  'settings'
] as const

export type PermissionScope = typeof PERMISSION_SCOPES[number]

export const isPermissionScope = (v: unknown): v is PermissionScope =>
  typeof v === 'string' && (PERMISSION_SCOPES as readonly string[]).includes(v)

/** Drop unknown values, dedupe. Use at every server boundary that
 *  accepts a permissions array from the client. */
export const sanitizePermissions = (raw: unknown): PermissionScope[] => {
  if (!Array.isArray(raw)) return []
  return [...new Set(raw.filter(isPermissionScope))]
}

/** Sidebar URL → scope map. Used by the global dashboard-permission
 *  middleware and the sidebar nav filter. Longest-prefix match wins,
 *  so `/dashboard/posts/123` resolves to `posts`. */
export const URL_TO_SCOPE: Record<string, PermissionScope> = {
  '/dashboard/posts': 'posts',
  '/dashboard/pages': 'pages',
  '/dashboard/blocks': 'blocks',
  '/dashboard/forms': 'forms',
  '/dashboard/submissions': 'submissions',
  '/dashboard/settings': 'settings'
}

/** Returns the scope a URL belongs to, or undefined if the URL is
 *  always-accessible (overview, login, etc.) or admin-only (staff). */
export const scopeForUrl = (path: string): PermissionScope | undefined => {
  // Normalize away the /ar locale prefix so the map can stay short.
  const normalized = path.startsWith('/ar/') ? path.slice(3) : path
  let best: { len: number, scope: PermissionScope } | undefined
  for (const [prefix, scope] of Object.entries(URL_TO_SCOPE)) {
    if (normalized === prefix || normalized.startsWith(prefix + '/')) {
      if (!best || prefix.length > best.len) {
        best = { len: prefix.length, scope }
      }
    }
  }
  return best?.scope
}

/** True iff the current user can access a given scope. Admin bypasses. */
export const canAccessScope = (
  user: { role?: string | null, permissions?: string[] | null } | null | undefined,
  scope: PermissionScope
): boolean => {
  if (!user) return false
  if (user.role === 'admin') return true
  return (user.permissions || []).includes(scope)
}
