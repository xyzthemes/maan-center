// Hard-delete a staff member. Cascade on Session + Account is defined
// at the schema level, so login state evaporates with the user.
//
// Refuses:
//   - Self-delete — admins must ask a peer to remove them.
//   - Last admin — would lock the dashboard for everyone.

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'User id is required.' })

  if (session.user.id === id) {
    throw createError({ statusCode: 409, statusMessage: 'You can\'t delete your own account.' })
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) throw createError({ statusCode: 404, statusMessage: 'User not found.' })

  if (target.role === 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } })
    if (adminCount <= 1) {
      throw createError({ statusCode: 409, statusMessage: 'There must be at least one admin.' })
    }
  }

  try {
    await prisma.user.delete({ where: { id } })
    return { data: { id } }
  } catch (e) {
    if (isPrismaError(e, 'P2025')) {
      throw createError({ statusCode: 404, statusMessage: 'User not found.' })
    }
    throw e
  }
})
