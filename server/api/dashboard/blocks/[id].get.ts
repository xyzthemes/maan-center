// Layer 2 — read a single ContentBlock for the edit page. Auth required.

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: 'admin' } })
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Block id is required.' })

  const row = await prisma.contentBlock.findUnique({ where: { id } })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Block not found.' })

  return { data: toDashboardBlock(row) }
})
