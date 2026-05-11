export type DashboardSubmission = {
  id: string
  timestamp?: string
  form?: { id?: string, title?: string }
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

  const loadSubmissions = async () => {
    submissionsError.value = ''
    isLoading.value = true

    try {
      const response = await $fetch<{ submissions: DashboardSubmission[] }>('/api/dashboard/submissions')

      submissions.value = response.submissions
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }

      submissionsError.value = fetchError.data?.message || fetchError.statusMessage || t.value.readSubmissionsError
    } finally {
      isLoading.value = false
    }
  }

  return {
    submissions,
    submissionsError,
    isLoading,
    loadSubmissions
  }
}
