// Layer 3 — Dashboard CRUD for SiteSettings (one composable per key
// gets cumbersome; this is generic and the editor switches on key).

export type DashboardSettingRow = {
  locale: string
  value: unknown
  updatedAt: string | null
}

export type DashboardSettingResponse = {
  key: string
  locales: string[]
  rows: DashboardSettingRow[]
}

export const useDashboardSettings = () => {
  const { t } = useDashboardI18n()
  const isLoading = ref(false)
  const error = ref('')

  const load = async (key: string): Promise<DashboardSettingResponse | null> => {
    error.value = ''
    isLoading.value = true
    try {
      const res = await $fetch<DashboardSettingResponse>(`/api/dashboard/settings/${key}`)
      return res
    } catch (e) {
      const err = e as { data?: { message?: string }, statusMessage?: string }
      error.value = err.data?.message || err.statusMessage || t.value.readSettingsError
      return null
    } finally {
      isLoading.value = false
    }
  }

  const save = async (key: string, locale: string, value: unknown): Promise<boolean> => {
    error.value = ''
    isLoading.value = true
    try {
      await $fetch(`/api/dashboard/settings/${key}`, {
        method: 'PUT',
        body: { locale, value }
      })
      return true
    } catch (e) {
      const err = e as { data?: { message?: string }, statusMessage?: string }
      error.value = err.data?.message || err.statusMessage || t.value.saveSettingError
      return false
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, load, save }
}
