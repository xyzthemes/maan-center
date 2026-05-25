// Phase 5: published-post list for the public blog (used by useMaanContent.getPosts).
// Locale filter is best-effort: posts whose slug starts with `ar-` (or whose
// content/title contains Arabic script) belong to the Arabic locale.
//
// Layer 1: accepts `?category=` and `?placement=` query params (CSV or
// repeated) so the homepage + program pages can ask the API for exactly
// the posts they want to surface instead of "latest 3".

import { getQuery } from 'h3'
import { isPostCategory, isPostPlacement } from '~/composables/useMaanTaxonomy'

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
  categories: string[]
  placements: string[]
}

/** Parse repeated or CSV query params into a clean list of valid taxonomy ids. */
const parseTaxonomyParam = (raw: unknown, isValid: (s: string) => boolean): string[] => {
  const collect = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.flatMap(collect)
    if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
    return []
  }
  return Array.from(new Set(collect(raw).filter(isValid)))
}

export default defineEventHandler(async (event): Promise<{ posts: PublicPostListItem[] }> => {
  const query = getQuery(event)
  const locale = String(query.locale || 'en')
  const limit = String(query.limit || '6')
  const take = Math.max(1, Math.min(50, Number(limit) || 6))

  const categories = parseTaxonomyParam(query.category ?? query.categories, isPostCategory)
  const placements = parseTaxonomyParam(query.placement ?? query.placements, isPostPlacement)

  const rows = await prisma.post.findMany({
    where: {
      status: 'published',
      // Prisma's array operators map to Postgres `&&` (hasSome) under
      // the hood, which is the GIN-indexed path we created in the
      // matching migration. `hasSome` returns rows where any of the
      // supplied values appear in the row's array column.
      ...(categories.length ? { categories: { hasSome: categories } } : {}),
      ...(placements.length ? { placements: { hasSome: placements } } : {})
    },
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
      seo: p.seo,
      categories: p.categories ?? [],
      placements: p.placements ?? []
    }))
  }
})
