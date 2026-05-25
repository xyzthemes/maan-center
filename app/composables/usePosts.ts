export type DashboardPost = {
  id: string
  status?: string
  slug?: string
  title?: string
  description?: string
  content?: string
  published_at?: string
  date_updated?: string
  date_created?: string
  categories?: string[]
  placements?: string[]
  seo?: {
    title?: string
    meta_description?: string
    focus_keyphrase?: string
  }
}

export const usePosts = () => {
  const { t } = useDashboardI18n()
  const posts = useState<DashboardPost[]>('dashboard-posts', () => [])
  const postsError = useState<string>('dashboard-posts-error', () => '')
  const isLoading = useState<boolean>('dashboard-posts-loading', () => false)

  const loadPosts = async () => {
    postsError.value = ''
    isLoading.value = true

    try {
      const response = await $fetch<{ posts: DashboardPost[] }>('/api/dashboard/posts')

      posts.value = response.posts
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }

      postsError.value = fetchError.data?.message || fetchError.statusMessage || t.value.readPostsError
    } finally {
      isLoading.value = false
    }
  }

  return {
    posts,
    postsError,
    isLoading,
    loadPosts
  }
}
