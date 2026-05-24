// Phase 5: fetch a published page by permalink (Prisma).
// Used by `useMaanContent.getPageSeo` and the catch-all `/[...slug].vue` route.

import { getQuery } from 'h3'

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

type StoredSeo = {
  title?: string
  meta_description?: string
  focus_keyphrase?: string
}

export default defineEventHandler(async (event): Promise<{ page: PublicPage | null }> => {
  const { permalink } = getQuery(event) as { permalink?: string }
  if (!permalink) return { page: null }

  try {
    const page = await prisma.page.findFirst({
      where: { status: 'published', permalink }
    })
    if (!page) return { page: null }

    const seo = (page.seo ?? {}) as StoredSeo
    return {
      page: {
        id: page.id,
        title: page.title,
        permalink: page.permalink,
        content: page.content ?? '',
        publishedAt: page.publishedAt?.toISOString() ?? null,
        seo: {
          title: seo.title,
          metaDescription: seo.meta_description,
          focusKeyphrase: seo.focus_keyphrase
        }
      }
    }
  } catch {
    return { page: null }
  }
})
