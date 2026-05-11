import type { DashboardPost } from './usePosts'

export type PostForm = {
  id?: string
  title: string
  slug: string
  description: string
  content: string
  status: string
  published_at: string
  seo: {
    title: string
    meta_description: string
    focus_keyphrase: string
  }
}

export const emptyPostForm = (): PostForm => ({
  title: '',
  slug: '',
  description: '',
  content: '<p></p>',
  status: 'draft',
  published_at: '',
  seo: {
    title: '',
    meta_description: '',
    focus_keyphrase: ''
  }
})

export const usePostForm = (onSaved?: () => unknown | Promise<unknown>) => {
  const { t } = useDashboardI18n()
  const postForm = reactive<PostForm>(emptyPostForm())
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

  const editPost = (post: DashboardPost) => {
    Object.assign(postForm, {
      id: post.id,
      title: post.title || '',
      slug: post.slug || '',
      description: post.description || '',
      content: post.content || '<p></p>',
      status: post.status || 'draft',
      published_at: post.published_at || '',
      seo: {
        title: post.seo?.title || post.title || '',
        meta_description: post.seo?.meta_description || post.description || '',
        focus_keyphrase: post.seo?.focus_keyphrase || ''
      }
    })
    saveError.value = ''
    saveSuccess.value = ''
  }

  const newPost = () => {
    Object.assign(postForm, emptyPostForm())
    saveError.value = ''
    saveSuccess.value = ''
  }

  const savePost = async (): Promise<string | undefined> => {
    saveError.value = ''
    saveSuccess.value = ''
    isSaving.value = true

    try {
      const wasCreate = !postForm.id
      const method = wasCreate ? 'POST' : 'PATCH'
      const url = wasCreate ? '/api/dashboard/posts' : `/api/dashboard/posts/${postForm.id}`

      const response = await $fetch<{ data?: { id?: string } } | undefined>(url, {
        method,
        body: postForm
      })

      const savedId = response?.data?.id || postForm.id

      if (wasCreate && savedId) {
        postForm.id = savedId
      }

      saveSuccess.value = wasCreate ? t.value.postCreated : t.value.postUpdated

      if (onSaved) {
        await onSaved()
      }

      return savedId
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }

      saveError.value = fetchError.data?.message || fetchError.statusMessage || t.value.savePostError

      return undefined
    } finally {
      isSaving.value = false
    }
  }

  return {
    postForm,
    saveError,
    saveSuccess,
    isSaving,
    statusOptions,
    statusLabel,
    editPost,
    newPost,
    savePost
  }
}
