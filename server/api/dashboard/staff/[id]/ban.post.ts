// Ban a staff member. Writes the Better Auth admin-plugin columns
// directly via Prisma — simpler than going through the auth.api roundtrip,
// and Better Auth's session check reads the same columns either way.
//
// Refuses to ban yourself or the last admin.

import { createError, getRouterParam, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'User id is required.' })

  if (session.user.id === id) {
    throw createError({ statusCode: 409, statusMessage: 'You can\'t ban your own account.' })
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) throw createError({ statusCode: 404, statusMessage: 'User not found.' })

  if (target.role === 'admin') {
    const activeAdminCount = await prisma.user.count({
      where: { role: 'admin', OR: [{ banned: false }, { banned: null }] }
    })
    if (activeAdminCount <= 1) {
      throw createError({ statusCode: 409, statusMessage: 'There must be at least one active admin.' })
    }
  }

  const payload = parseStaffBanPayload(await readBody(event))

  const updated = await prisma.user.update({
    where: { id },
    data: {
      banned: true,
      banReason: payload.reason ?? null,
      banExpires: payload.expiresAt ?? null
    },
    include: {
      sessions: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } }
    }
  })

  // Invalidate any active session so the ban takes effect immediately.
  await prisma.session.deleteMany({ where: { userId: id } })

  return { data: toDashboardStaff(updated) }
})
