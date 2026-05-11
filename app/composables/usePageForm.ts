import type { DashboardPage } from './usePagesAdmin'

export type PageForm = {
  id?: string
  title: string
  permalink: string
  content: string
  status: string
  published_at: string
  sort: number | null
  seo: {
    title: string
    meta_description: string
    focus_keyphrase: string
  }
}

export const emptyPageForm = (): PageForm => ({
  title: '',
  permalink: '',
  content: '<p></p>',
  status: 'draft',
  published_at: '',
  sort: null,
  seo: {
    title: '',
    meta_description: '',
    focus_keyphrase: ''
  }
})

export const usePageForm = (onSaved?: () => unknown | Promise<unknown>) => {
  const { t } = useDashboardI18n()
  const pageForm = reactive<PageForm>(emptyPageForm())
  const saveError = ref('')
  const saveSuccess = ref('')
  const isSaving = ref(false)

  const statusOptions = computed(() => [
    { value: 'all' as const, label: t.value.filterAll },
    { value: 'draft' as const, label: t.value.draft },
    { value: 'in_review' as const, label: t.value.inReview },
    { value: 'published' as const, label: t.value.published }
  ])

  const statusLabel = (status?: string) => {
    if (status === 'published') {
      return t.value.published
    }

    if (status === 'in_review') {
      return t.value.inReview
    }

    return t.value.draft
  }

  const editPage = (page: DashboardPage) => {
    Object.assign(pageForm, {
      id: page.id,
      title: page.title || '',
      permalink: page.permalink || '',
      content: page.content || '<p></p>',
      status: page.status || 'draft',
      published_at: page.published_at || '',
      sort: page.sort ?? null,
      seo: {
        title: page.seo?.title || page.title || '',
        meta_description: page.seo?.meta_description || '',
        focus_keyphrase: page.seo?.focus_keyphrase || ''
      }
    })
    saveError.value = ''
    saveSuccess.value = ''
  }

  const newPage = () => {
    Object.assign(pageForm, emptyPageForm())
    saveError.value = ''
    saveSuccess.value = ''
  }

  const deletePage = async (id: string): Promise<boolean> => {
    saveError.value = ''
    saveSuccess.value = ''
    isSaving.value = true

    try {
      await $fetch(`/api/dashboard/pages/${id}`, { method: 'DELETE' })

      if (onSaved) {
        await onSaved()
      }

      return true
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }

      saveError.value = fetchError.data?.message || fetchError.statusMessage || t.value.deletePageError

      return false
    } finally {
      isSaving.value = false
    }
  }

  const savePage = async (): Promise<string | undefined> => {
    saveError.value = ''
    saveSuccess.value = ''
    isSaving.value = true

    try {
      const wasCreate = !pageForm.id
      const method = wasCreate ? 'POST' : 'PATCH'
      const url = wasCreate ? '/api/dashboard/pages' : `/api/dashboard/pages/${pageForm.id}`

      const response = await $fetch<{ data?: { id?: string } } | undefined>(url, {
        method,
        body: pageForm
      })

      const savedId = response?.data?.id || pageForm.id

      if (wasCreate && savedId) {
        pageForm.id = savedId
      }

      saveSuccess.value = wasCreate ? t.value.pageCreated : t.value.pageUpdated

      if (onSaved) {
        await onSaved()
      }

      return savedId
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }

      saveError.value = fetchError.data?.message || fetchError.statusMessage || t.value.savePageError

      return undefined
    } finally {
      isSaving.value = false
    }
  }

  return {
    pageForm,
    saveError,
    saveSuccess,
    isSaving,
    statusOptions,
    statusLabel,
    editPage,
    newPage,
    savePage,
    deletePage
  }
}
