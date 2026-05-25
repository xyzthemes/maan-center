// List staff members. Admin-only.
//
// Includes the user's most-recent session timestamp (one row each) so
// the list can show a "Last active" badge without a follow-up query.

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: {
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true }
      }
    },
    take: 200
  })

  return { staff: users.map(toDashboardStaff) }
})
