// Dashboard submissions — list + delete with optimistic local removal.
// The `form.title` arrives as a bilingual envelope (Workstream A);
// callers pickLocale on render.

export type DashboardSubmission = {
  id: string
  timestamp?: string
  /** Locale the submitter used. Drives the badge on each row. */
  locale?: string
  form?: { id?: string, slug?: string, title?: unknown }
  values: Array<{
    id: string
    name: string
    label: string
    value: string
  }>
}

export const useSubmissions = () => {
  const { t } = useDashboardI18n()
  const submissions = useState<DashboardSubmission[]>('dashboard-submissions', () => [])
  const submissionsError = useState<string>('dashboard-submissions-error', () => '')
  const isLoading = useState<boolean>('dashboard-submissions-loading', () => false)

  const loadSubmissions = async (formId?: string) => {
    submissionsError.value = ''
    isLoading.value = true
    try {
      const response = await $fetch<{ submissions: DashboardSubmission[] }>('/api/dashboard/submissions', {
        query: formId ? { formId } : undefined
      })
      submissions.value = response.submissions
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      submissionsError.value = fetchError.data?.message || fetchError.statusMessage || t.value.readSubmissionsError
    } finally {
      isLoading.value = false
    }
  }

  const deleteSubmission = async (id: string) => {
    try {
      await $fetch(`/api/dashboard/submissions/${id}`, { method: 'DELETE' })
      submissions.value = submissions.value.filter(s => s.id !== id)
      return true
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      submissionsError.value = fetchError.data?.message || fetchError.statusMessage || t.value.readSubmissionsError
      return false
    }
  }

  return {
    submissions,
    submissionsError,
    isLoading,
    loadSubmissions,
    deleteSubmission
  }
}
