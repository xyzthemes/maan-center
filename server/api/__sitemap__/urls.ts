// Phase 5: published-post URLs for the sitemap (Prisma).

import type { SitemapUrlInput } from '#sitemap/types'

const isArabicPost = (slug = '') => slug.startsWith('ar-')

const PROGRAM_IDS = ['autism', 'down-syndrome', 'learning-difficulties'] as const

const programUrls: SitemapUrlInput[] = PROGRAM_IDS.flatMap(id => [
  { loc: `/programs/${id}`, changefreq: 'monthly' as const, priority: 0.9 },
  { loc: `/ar/programs/${id}`, changefreq: 'monthly' as const, priority: 0.9 }
])

const staticUrls: SitemapUrlInput[] = [
  { loc: '/', changefreq: 'weekly', priority: 1 },
  { loc: '/ar', changefreq: 'weekly', priority: 1 },
  { loc: '/contact', changefreq: 'monthly', priority: 0.9 },
  { loc: '/ar/contact', changefreq: 'monthly', priority: 0.9 },
  { loc: '/blog', changefreq: 'weekly', priority: 0.8 },
  { loc: '/ar/blog', changefreq: 'weekly', priority: 0.8 },
  ...programUrls
]

export default defineEventHandler(async () => {
  try {
    const rows = await prisma.post.findMany({
      where: { status: 'published' },
      select: { slug: true, publishedAt: true, updatedAt: true },
      take: 200
    })

    const postUrls: SitemapUrlInput[] = rows.map(post => ({
      loc: isArabicPost(post.slug) ? `/ar/blog/${post.slug}` : `/blog/${post.slug}`,
      lastmod: (post.updatedAt ?? post.publishedAt)?.toISOString(),
      changefreq: 'monthly',
      priority: 0.7
    }))

    return [...staticUrls, ...postUrls]
  } catch {
    return staticUrls
  }
})
