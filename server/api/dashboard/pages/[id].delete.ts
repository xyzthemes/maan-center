// Phase 5: delete a page via Prisma. Auth required.

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Page id is required.' })
  }

  try {
    await prisma.page.delete({ where: { id } })
    return { success: true as const }
  } catch (e) {
    if (isPrismaError(e, 'P2025')) {
      throw createError({ statusCode: 404, statusMessage: 'Page not found.' })
    }
    throw e
  }
})
