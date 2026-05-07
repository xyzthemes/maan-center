type DirectusDashboardPost = {
  id: string
  status?: string
  slug?: string
  title?: string
  description?: string
  content?: string
  published_at?: string
  date_created?: string
  date_updated?: string
  seo?: {
    title?: string
    meta_description?: string
    focus_keyphrase?: string
    no_index?: boolean
    no_follow?: boolean
  }
}

export default defineEventHandler(async (event): Promise<{ posts: DirectusDashboardPost[] }> => {
  const response: { data?: DirectusDashboardPost[] } = await dashboardDirectusRequest<{ data?: DirectusDashboardPost[] }>(event, '/items/posts', {
    query: {
      fields: 'id,status,slug,title,description,content,published_at,date_created,date_updated,seo',
      sort: '-date_updated,-date_created',
      limit: 100
    }
  })

  return { posts: response.data || [] }
})
