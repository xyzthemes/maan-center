// Lift the ban — clears banned + banReason + banExpires.

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'User id is required.' })

  const updated = await prisma.user.update({
    where: { id },
    data: { banned: false, banReason: null, banExpires: null },
    include: {
      sessions: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } }
    }
  })

  return { data: toDashboardStaff(updated) }
})
