// Layer 2 — list ContentBlocks for the dashboard. Optional type filter
// via `?type=`. Returns up to 200 rows ordered by recency.

import { getQuery } from 'h3'
// isBlockType + toDashboardBlock auto-imported from server/utils by Nitro.

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'blocks')

  const q = getQuery(event)
  const typeRaw = String(q.type || '')
  const where = typeRaw && isBlockType(typeRaw) ? { type: typeRaw } : {}

  const rows = await prisma.contentBlock.findMany({
    where,
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    take: 200
  })

  return { blocks: rows.map(toDashboardBlock) }
})
