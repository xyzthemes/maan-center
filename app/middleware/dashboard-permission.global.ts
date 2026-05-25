// Global middleware — enforces per-section permissions on every
// dashboard URL. Runs before the page renders.
//
// Behaviour:
//   - public site routes (no /dashboard/ prefix): pass through.
//   - admin role: pass through regardless of scope.
//   - /dashboard/staff: admin-only; staff get bounced to /dashboard/overview.
//   - other /dashboard sections: check `user.permissions` against the URL's
//     required scope; redirect to overview on miss.
//
// The /dashboard/overview route is always accessible to any logged-in
// staff member so the redirect target never bounces them in a loop.
// Login pages already use Better Auth's `auth: 'guest'` rule, so they
// resolve before this middleware ever runs.

import { scopeForUrl, canAccessScope } from '~/utils/permissions'

export default defineNuxtRouteMiddleware((to) => {
  const path = to.path
  if (!path.startsWith('/dashboard') && !path.startsWith('/ar/dashboard')) {
    return
  }

  // Login / forgot / reset pages live under /dashboard but are guest-only;
  // the route rules in nuxt.config.ts handle those before us.
  if (/\/dashboard\/(login|forgot-password|reset-password)/.test(path)) {
    return
  }

  const { user, isAdmin } = useDashboardUser()
  if (!user.value) {
    // useDashboardUser triggers a redirect via ensureUser elsewhere;
    // don't interfere here.
    return
  }
  if (isAdmin.value) return

  // Staff section — admin only.
  if (/\/dashboard\/staff(\/|$)/.test(path)) {
    return navigateTo(isArabicPath(path) ? '/ar/dashboard/overview' : '/dashboard/overview')
  }

  const scope = scopeForUrl(path)
  // No scope means the URL is always-accessible (overview, profile, etc.)
  if (!scope) return

  if (!canAccessScope(user.value as { role?: string, permissions?: string[] }, scope)) {
    return navigateTo(isArabicPath(path) ? '/ar/dashboard/overview' : '/dashboard/overview')
  }
})

const isArabicPath = (path: string) => path.startsWith('/ar/')
