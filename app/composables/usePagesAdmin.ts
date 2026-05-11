export type DashboardPage = {
  id: string
  status?: string
  title?: string
  permalink?: string
  content?: string
  published_at?: string
  date_updated?: string
  date_created?: string
  sort?: number | null
  seo?: {
    title?: string
    meta_description?: string
    focus_keyphrase?: string
  }
}

export const usePagesAdmin = () => {
  const { t } = useDashboardI18n()
  const pages = useState<DashboardPage[]>('dashboard-pages', () => [])
  const pagesError = useState<string>('dashboard-pages-error', () => '')
  const isLoading = useState<boolean>('dashboard-pages-loading', () => false)

  const loadPages = async () => {
    pagesError.value = ''
    isLoading.value = true

    try {
      const response = await $fetch<{ pages: DashboardPage[] }>('/api/dashboard/pages')

      pages.value = response.pages
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }

      pagesError.value = fetchError.data?.message || fetchError.statusMessage || t.value.readPagesError
    } finally {
      isLoading.value = false
    }
  }

  return {
    pages,
    pagesError,
    isLoading,
    loadPages
  }
}
