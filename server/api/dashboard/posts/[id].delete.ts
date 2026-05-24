// Delete a post. Auth required.

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: 'admin' } })
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Post id is required.' })
  }

  try {
    await prisma.post.delete({ where: { id } })
    return { success: true as const }
  } catch (e) {
    if (isPrismaError(e, 'P2025')) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found.' })
    }
    throw e
  }
})
