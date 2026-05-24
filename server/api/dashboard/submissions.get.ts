// Phase 5: list form submissions from Prisma. Auth required.

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const rows = await prisma.formSubmission.findMany({
    orderBy: { timestamp: 'desc' },
    take: 100,
    include: {
      form: true,
      values: { orderBy: { name: 'asc' } }
    }
  })

  return { submissions: rows.map(toDashboardSubmission) }
})
