type DirectusNavPage = {
  id: string
  title?: string
  permalink?: string
  sort?: number | null
}

export type NavPage = {
  id: string
  title: string
  permalink: string
}

const STATIC_PERMALINKS = new Set([
  '/',
  '/blog',
  '/contact',
  '/ar',
  '/ar/blog',
  '/ar/contact',
  '/dashboard',
  '/dashboard/login',
  '/ar/dashboard',
  '/ar/dashboard/login'
])

export default defineEventHandler(async (event): Promise<{ pages: NavPage[] }> => {
  const config = useRuntimeConfig(event)
  const directusUrl = String(config.public.directus.url || '').replace(/\/$/, '')

  if (!directusUrl) {
    return { pages: [] }
  }

  try {
    const response = await $fetch<{ data?: DirectusNavPage[] }>(`${directusUrl}/items/pages`, {
      query: {
        fields: 'id,title,permalink,sort',
        filter: JSON.stringify({ status: { _eq: 'published' } }),
        sort: 'sort,title',
        limit: 50
      }
    })

    const pages = (response.data || [])
      .filter(page => Boolean(page.title && page.permalink))
      .filter(page => !STATIC_PERMALINKS.has(page.permalink as string))
      .map(page => ({
        id: page.id,
        title: page.title as string,
        permalink: page.permalink as string
      }))

    return { pages }
  } catch {
    return { pages: [] }
  }
})
