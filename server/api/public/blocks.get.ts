// Layer 2 — Public read of published ContentBlocks.
//
// Filters: type (required), placement (optional), locale (optional).
// `locale='*'` rows always match — they're locale-agnostic. Request
// `locale='en'` returns en + * blocks; `locale='ar'` returns ar + *.
//
// Ordered by `sort` ascending, then `publishedAt` desc, then `createdAt`
// desc — admins can override ordering by setting `sort`; everything else
// falls back to publication recency.

import { getQuery } from 'h3'
import type { BlockType, BlockLocale } from '~~/server/utils/content-block-schemas'
// isBlockType + isBlockLocale are Nitro auto-imported from server/utils.
// Only the TYPE aliases need an explicit type-only import.

export type PublicBlock = {
  id: string
  type: BlockType
  locale: BlockLocale
  payload: unknown
  placements: string[]
  sort: number | null
  publishedAt: string | null
}

export default defineEventHandler(async (event): Promise<{ blocks: PublicBlock[] }> => {
  const q = getQuery(event)
  const typeRaw = String(q.type || '')
  if (!isBlockType(typeRaw)) {
    // Soft-fail with empty list rather than 400 — frontend treats the
    // public block lookup as best-effort and falls back to source data.
    return { blocks: [] }
  }

  const localeRaw = String(q.locale || '')
  const locale: BlockLocale | undefined = isBlockLocale(localeRaw) ? localeRaw : undefined

  // Accept both `?placement=` and `?placements=`, CSV or repeated.
  const collectStrings = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.flatMap(collectStrings)
    if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
    return []
  }
  const placements = Array.from(new Set(collectStrings(q.placement ?? q.placements)))

  const limit = Math.max(1, Math.min(100, Number(q.limit) || 50))

  const rows = await prisma.contentBlock.findMany({
    where: {
      status: 'published',
      type: typeRaw,
      ...(locale ? { OR: [{ locale }, { locale: '*' }] } : {}),
      ...(placements.length ? { placements: { hasSome: placements } } : {})
    },
    orderBy: [
      { sort: 'asc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit
  })

  return {
    blocks: rows.map(r => ({
      id: r.id,
      type: r.type as BlockType,
      locale: (isBlockLocale(r.locale) ? r.locale : '*'),
      payload: r.payload,
      placements: r.placements ?? [],
      sort: r.sort,
      publishedAt: r.publishedAt?.toISOString() ?? null
    }))
  }
})
