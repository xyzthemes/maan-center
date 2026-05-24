// Phase 5: list pages from Prisma. Auth required.

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const rows = await prisma.page.findMany({
    orderBy: [{ sort: 'asc' }, { updatedAt: 'desc' }, { createdAt: 'desc' }],
    take: 200
  })

  return { pages: rows.map(toDashboardPage) }
})
