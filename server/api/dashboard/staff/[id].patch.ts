// Update a staff member's name, role, or permissions.
//
// Safety rails (server-side; the UI duplicates them client-side):
//   - Can't demote yourself — admins must ask a peer to lower them.
//   - Can't demote the last admin — would lock the dashboard.
// Both return 409 with copy the dashboard surfaces directly in a toast.

import { createError, getRouterParam, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'User id is required.' })

  const payload = parseStaffUpdatePayload(await readBody(event))

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) throw createError({ statusCode: 404, statusMessage: 'User not found.' })

  const isSelf = session.user.id === id

  // Demotion safety rails — check whenever role would change to non-admin.
  if (payload.role && payload.role !== 'admin' && target.role === 'admin') {
    if (isSelf) {
      throw createError({ statusCode: 409, statusMessage: 'You can\'t demote your own role.' })
    }
    const adminCount = await prisma.user.count({ where: { role: 'admin' } })
    if (adminCount <= 1) {
      throw createError({ statusCode: 409, statusMessage: 'There must be at least one admin.' })
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.role !== undefined && { role: payload.role }),
      ...(payload.permissions !== undefined && { permissions: payload.permissions })
    },
    include: {
      sessions: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } }
    }
  })

  return { data: toDashboardStaff(updated) }
})
