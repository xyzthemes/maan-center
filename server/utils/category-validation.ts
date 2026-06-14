// S7: DB-backed category-slug validation. Replaces the static
// `isPostCategory`/`sanitizeCategories` taxonomy check (which validated
// against a hard-coded list in `useMaanTaxonomy`) with a lookup against the
// dynamic `Category` table. Same DEFENSIVE contract as the old static
// helpers: unknown slugs are DROPPED, never stored — so a renamed or deleted
// category can't inject stale/invalid data into `Post.categories`.
//
// A per-request cache (keyed on the H3 event context) means a single
// create/update/list request hits the `Category` table at most once even
// though both the body validation and any filter validation ask for the set.

import type { H3Event } from 'h3'

const CACHE_KEY = '__categorySlugSet'

/**
 * Returns the set of valid category slugs from the DB, cached for the life
 * of the request. Subsequent calls within the same request reuse the result.
 */
export const getValidCategorySlugs = async (event: H3Event): Promise<ReadonlySet<string>> => {
  const ctx = event.context as Record<string, unknown>
  const cached = ctx[CACHE_KEY] as ReadonlySet<string> | undefined
  if (cached) return cached

  const rows = await prisma.category.findMany({ select: { slug: true } })
  const set = new Set(rows.map(r => r.slug))
  ctx[CACHE_KEY] = set
  return set
}

/**
 * Filter an incoming list, returning only slugs that exist in the `Category`
 * table, de-duplicated and order-preserving. Mirrors the old
 * `sanitizeCategories(raw)` contract (drop unknowns) but DB-backed + async.
 */
export const sanitizeCategoriesDb = async (event: H3Event, raw: unknown): Promise<string[]> => {
  if (!Array.isArray(raw)) return []
  const valid = await getValidCategorySlugs(event)
  const out = new Set<string>()
  for (const v of raw) {
    if (typeof v === 'string' && valid.has(v)) out.add(v)
  }
  return Array.from(out)
}
