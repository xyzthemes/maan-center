import { getQuery } from 'h3'

type DirectusPublicPage = {
  id: string
  title?: string
  permalink?: string
  content?: string
  published_at?: string
  seo?: {
    title?: string
    meta_description?: string
    focus_keyphrase?: string
  }
}

export type PublicPage = {
  id: string
  title: string
  permalink: string
  content: string
  publishedAt: string | null
  seo: {
    title?: string
    metaDescription?: string
    focusKeyphrase?: string
  }
}

export default defineEventHandler(async (event): Promise<{ page: PublicPage | null }> => {
  const config = useRuntimeConfig(event)
  const directusUrl = String(config.public.directus.url || '').replace(/\/$/, '')
  const { permalink } = getQuery(event) as { permalink?: string }

  if (!directusUrl || !permalink) {
    return { page: null }
  }

  try {
    const response = await $fetch<{ data?: DirectusPublicPage[] }>(`${directusUrl}/items/pages`, {
      query: {
        fields: 'id,title,permalink,content,published_at,seo',
        filter: JSON.stringify({
          status: { _eq: 'published' },
          permalink: { _eq: permalink }
        }),
        limit: 1
      }
    })

    const page = response.data?.[0]

    if (!page?.title || !page?.permalink) {
      return { page: null }
    }

    return {
      page: {
        id: page.id,
        title: page.title,
        permalink: page.permalink,
        content: page.content || '',
        publishedAt: page.published_at || null,
        seo: {
          title: page.seo?.title,
          metaDescription: page.seo?.meta_description,
          focusKeyphrase: page.seo?.focus_keyphrase
        }
      }
    }
  } catch {
    return { page: null }
  }
})
