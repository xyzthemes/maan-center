type DashboardUser = {
  id: string
  email?: string
  first_name?: string
  last_name?: string
  role?: { id?: string, name?: string } | string
}

export const useDashboardUser = () => {
  const { loginPath, t } = useDashboardI18n()
  const user = useState<DashboardUser | undefined>('dashboard-user', () => undefined)
  const authError = useState<string>('dashboard-auth-error', () => '')

  const loadMe = async () => {
    const response = await $fetch<{ user?: DashboardUser }>('/api/dashboard/me')

    user.value = response.user
  }

  const logout = async () => {
    await $fetch('/api/dashboard/logout', { method: 'POST' })
    user.value = undefined
    await navigateTo(loginPath.value)
  }

  const userName = computed(() => {
    const parts = [user.value?.first_name, user.value?.last_name].filter(Boolean).join(' ')

    return parts || user.value?.email || t.value.managerFallback
  })
  const userRole = computed(() => typeof user.value?.role === 'string' ? user.value.role : user.value?.role?.name)

  const ensureUser = async () => {
    if (user.value) {
      return
    }

    try {
      await loadMe()
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }

      authError.value = fetchError.data?.message || fetchError.statusMessage || t.value.authError
      await navigateTo(loginPath.value)
    }
  }

  return {
    user,
    userName,
    userRole,
    authError,
    loadMe,
    ensureUser,
    logout
  }
}
