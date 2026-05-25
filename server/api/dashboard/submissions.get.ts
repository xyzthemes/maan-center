// Phase 5: list form submissions from Prisma. Auth required.
//
// Optional `?formId=` query filters to a single form so the detail page
// at /dashboard/submissions/[formId] can fetch just that form's
// responses instead of slicing the full 100-row pool client-side.

import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: 'admin' } })

  const q = getQuery(event)
  const formId = typeof q.formId === 'string' && q.formId ? q.formId : undefined

  const rows = await prisma.formSubmission.findMany({
    where: formId ? { formId } : undefined,
    orderBy: { timestamp: 'desc' },
    take: formId ? 500 : 100,
    include: {
      form: true,
      values: { orderBy: { name: 'asc' } }
    }
  })

  return { submissions: rows.map(toDashboardSubmission) }
})
