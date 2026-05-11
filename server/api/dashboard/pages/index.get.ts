type DirectusDashboardPage = {
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

export default defineEventHandler(async (event): Promise<{ pages: DirectusDashboardPage[] }> => {
  const response: { data?: DirectusDashboardPage[] } = await dashboardDirectusRequest<{ data?: DirectusDashboardPage[] }>(event, '/items/pages', {
    query: {
      fields: 'id,status,title,permalink,content,published_at,date_updated,date_created,sort,seo',
      sort: 'sort,-date_updated,-date_created',
      limit: 200
    }
  })

  return {
    pages: response.data || []
  }
})
