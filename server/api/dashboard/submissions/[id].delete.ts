// Delete a single submission. Cascade on FormSubmissionValue is defined
// at the schema level, so the value rows go with the parent submission.
// Admin-gated.

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: 'admin' } })
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Submission id is required.' })

  try {
    await prisma.formSubmission.delete({ where: { id } })
    return { data: { id } }
  } catch (e) {
    if (isPrismaError(e, 'P2025')) {
      throw createError({ statusCode: 404, statusMessage: 'Submission not found.' })
    }
    throw e
  }
})
