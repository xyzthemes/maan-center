import type { SitemapUrlInput } from '#sitemap/types'

type DirectusPost = {
  slug?: string
  status?: string
  published_at?: string
  date_updated?: string
}

const isArabicPost = (slug = '') => slug.startsWith('ar-')
const staticUrls: SitemapUrlInput[] = [
  { loc: '/', changefreq: 'weekly', priority: 1 },
  { loc: '/ar', changefreq: 'weekly', priority: 1 },
  { loc: '/blog', changefreq: 'weekly', priority: 0.8 },
  { loc: '/ar/blog', changefreq: 'weekly', priority: 0.8 }
]

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const directusUrl = String(config.public.directus.url || '').replace(/\/$/, '')

  if (!directusUrl) {
    const fallbackPostUrls = [
      '/blog/building-confident-routines-at-home',
      '/blog/how-early-assessment-guides-support',
      '/blog/supporting-communication-through-play',
      '/ar/blog/ar-building-confident-routines-at-home',
      '/ar/blog/ar-how-early-assessment-guides-support',
      '/ar/blog/ar-supporting-communication-through-play'
    ].map(loc => ({
      loc,
      changefreq: 'monthly',
      priority: 0.7
    } satisfies SitemapUrlInput))

    return [...staticUrls, ...fallbackPostUrls]
  }

  try {
    const response = await $fetch<{ data?: DirectusPost[] }>(`${directusUrl}/items/posts`, {
      query: {
        filter: { status: { _eq: 'published' } },
        fields: ['slug', 'status', 'published_at', 'date_updated'],
        limit: 100
      }
    })

    const postUrls = (response.data || [])
      .filter(post => post.slug)
      .map((post) => {
        const slug = post.slug as string

        return {
          loc: isArabicPost(slug) ? `/ar/blog/${slug}` : `/blog/${slug}`,
          lastmod: post.date_updated || post.published_at,
          changefreq: 'monthly',
          priority: 0.7
        } satisfies SitemapUrlInput
      })

    return [...staticUrls, ...postUrls]
  } catch {
    const fallbackPostUrls = [
      '/blog/building-confident-routines-at-home',
      '/blog/how-early-assessment-guides-support',
      '/blog/supporting-communication-through-play',
      '/ar/blog/ar-building-confident-routines-at-home',
      '/ar/blog/ar-how-early-assessment-guides-support',
      '/ar/blog/ar-supporting-communication-through-play'
    ].map(loc => ({
      loc,
      changefreq: 'monthly',
      priority: 0.7
    } satisfies SitemapUrlInput))

    return [...staticUrls, ...fallbackPostUrls]
  }
})
