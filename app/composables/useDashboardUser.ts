// Phase 4: thin wrapper around Better Auth's useUserSession() that preserves
// the existing call shape (userName / userRole / ensureUser / logout) used by
// the dashboard layout. Once pages migrate to useUserSession directly, this
// composable can go away.

export const useDashboardUser = () => {
  const { loginPath, t } = useDashboardI18n()
  const { user, loggedIn, ready, signOut, fetchSession } = useUserSession()
  const authError = useState<string>('dashboard-auth-error', () => '')

  const userName = computed(() => user.value?.name || user.value?.email || t.value.managerFallback)
  const userRole = computed(() => (user.value as { role?: string } | null)?.role ?? undefined)

  const ensureUser = async () => {
    if (!ready.value) {
      await fetchSession()
    }
    if (!loggedIn.value) {
      authError.value = t.value.authError
      await navigateTo(loginPath.value)
    }
  }

  const logout = async () => {
    await signOut()
    await navigateTo(loginPath.value)
  }

  return {
    user,
    userName,
    userRole,
    authError,
    ensureUser,
    logout
  }
}
