// Phase 5: published-post list for the public blog (used by useMaanContent.getPosts).
// Locale filter is best-effort: posts whose slug starts with `ar-` (or whose
// content/title contains Arabic script) belong to the Arabic locale.
//
// Layer 1: accepts `?category=` and `?placement=` query params (CSV or
// repeated) so the homepage + program pages can ask the API for exactly
// the posts they want to surface instead of "latest 3".

import { getQuery } from 'h3'
import { isPostPlacement } from '~/composables/useMaanTaxonomy'

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

/** Flatten repeated/CSV query params into a de-duplicated raw string list
 *  (no taxonomy validation — that's done DB-side for categories). */
const flattenParam = (raw: unknown): string[] => {
  const collect = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.flatMap(collect)
    if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
    return []
  }
  return Array.from(new Set(collect(raw)))
}

export default defineEventHandler(async (event): Promise<{ posts: PublicPostListItem[], total: number }> => {
  const query = getQuery(event)
  const locale = String(query.locale || 'en')
  const limit = String(query.limit || '6')
  const take = Math.max(1, Math.min(50, Number(limit) || 6))
  // 1-based page index for "Load More" pagination (S2). `page` is the
  // primary param; `offset` is accepted as an escape hatch and wins when
  // supplied. The locale split happens in-memory (no DB locale column —
  // see locked decision), so we page over the already-filtered list.
  const page = Math.max(1, Math.floor(Number(query.page) || 1))
  const offset = query.offset != null ? Math.max(0, Math.floor(Number(query.offset) || 0)) : (page - 1) * take

  // Categories are now validated against the dynamic Category table (S7)
  // instead of the static taxonomy list. Unknown slugs are dropped so a
  // deleted/renamed category can't be used to probe the post set.
  const validCategorySlugs = await getValidCategorySlugs(event)
  const categories = flattenParam(query.category ?? query.categories).filter(s => validCategorySlugs.has(s))
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
    // Widened window (S2): we filter locale in-memory, so the cap must hold
    // a full locale's worth of posts. Acceptable until volume nears ~500
    // per locale (open question Q1 tracks the real fix — a locale column).
    take: 500
  })

  // Locale split happens here rather than in the DB because the EN/AR
  // partition lives in the slug prefix + content, not a column. Keeps the
  // schema unchanged and matches the previous client-side filter exactly.
  const isAr = (slug: string, title: string) => slug.startsWith('ar-') || /[؀-ۿ]/.test(title)
  const filtered = rows.filter(p => (locale === 'ar' ? isAr(p.slug, p.title) : !isAr(p.slug, p.title)))

  return {
    total: filtered.length,
    posts: filtered.slice(offset, offset + take).map(p => ({
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
