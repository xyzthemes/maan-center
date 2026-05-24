// Phase 5: published-post list for the public blog (used by useMaanContent.getPosts).
// Locale filter is best-effort: posts whose slug starts with `ar-` (or whose
// content/title contains Arabic script) belong to the Arabic locale.

import { getQuery } from 'h3'

export type PublicPostListItem = {
  id: string
  slug: string
  title: string
  description: string | null
  image: string | null
  content: string | null
  publishedAt: string | null
  createdAt: string
  seo: unknown
}

export default defineEventHandler(async (event): Promise<{ posts: PublicPostListItem[] }> => {
  const { locale = 'en', limit = '6' } = getQuery(event) as { locale?: string, limit?: string }
  const take = Math.max(1, Math.min(50, Number(limit) || 6))

  const rows = await prisma.post.findMany({
    where: { status: 'published' },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 200
  })

  // Locale split happens here rather than in the DB because the EN/AR
  // partition lives in the slug prefix + content, not a column. Keeps the
  // schema unchanged and matches the previous client-side filter exactly.
  const isAr = (slug: string, title: string) => slug.startsWith('ar-') || /[؀-ۿ]/.test(title)
  const filtered = rows.filter(p => (locale === 'ar' ? isAr(p.slug, p.title) : !isAr(p.slug, p.title)))

  return {
    posts: filtered.slice(0, take).map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      image: p.image,
      content: p.content,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      seo: p.seo
    }))
  }
})
