// Read one staff member for the edit page.

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'User id is required.' })

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      sessions: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } }
    }
  })
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found.' })

  return { data: toDashboardStaff(user) }
})
