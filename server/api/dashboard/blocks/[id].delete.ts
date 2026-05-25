// Layer 2 — delete a ContentBlock. Auth required.

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'blocks')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Block id is required.' })

  try {
    await prisma.contentBlock.delete({ where: { id } })
    return { success: true as const }
  } catch (e) {
    if (isPrismaError(e, 'P2025')) {
      throw createError({ statusCode: 404, statusMessage: 'Block not found.' })
    }
    throw e
  }
})
