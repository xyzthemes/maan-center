// Phase B — list all forms for the dashboard. Returns the slug, title
// (bilingual envelope), active flag, and counts of fields + submissions
// so the list can render badges without follow-up requests.

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'forms')

  const rows = await prisma.form.findMany({
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    include: { _count: { select: { fields: true, submissions: true } } },
    take: 200
  })

  return { forms: rows.map(toDashboardFormListRow) }
})
