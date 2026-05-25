// Dashboard list state for custom Forms. Mirrors useDashboardBlocks.
// Holds the lightweight list shape from /api/dashboard/forms; the
// editor pulls the full form (with fields) via useFormForm.

export type DashboardFormListRow = {
  id: string
  slug: string
  title: unknown // { en, ar } bilingual envelope
  isActive: boolean
  fieldCount: number
  submissionCount: number
  updatedAt: string
}

export const useDashboardForms = () => {
  const { t } = useDashboardI18n()
  const forms = useState<DashboardFormListRow[]>('dashboard-forms', () => [])
  const formsError = useState<string>('dashboard-forms-error', () => '')
  const isLoading = useState<boolean>('dashboard-forms-loading', () => false)

  const loadForms = async () => {
    formsError.value = ''
    isLoading.value = true
    try {
      const response = await $fetch<{ forms: DashboardFormListRow[] }>('/api/dashboard/forms')
      forms.value = response.forms
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      formsError.value = fetchError.data?.message || fetchError.statusMessage || t.value.readFormsError
    } finally {
      isLoading.value = false
    }
  }

  const deleteForm = async (id: string) => {
    try {
      await $fetch(`/api/dashboard/forms/${id}`, { method: 'DELETE' })
      forms.value = forms.value.filter(f => f.id !== id)
      return true
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      formsError.value = fetchError.data?.message || fetchError.statusMessage || t.value.deleteFormError
      return false
    }
  }

  return { forms, formsError, isLoading, loadForms, deleteForm }
}
