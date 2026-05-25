// Phase B — delete a form. Soft-blocks when submissions exist so
// historical responses aren't silently cascade-deleted. The admin sees
// "deactivate instead" guidance from the 409 statusMessage; if they
// really want to nuke responses, they can clear submissions first.

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: 'admin' } })
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Form id is required.' })

  const submissionCount = await prisma.formSubmission.count({ where: { formId: id } })
  if (submissionCount > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: `Form has ${submissionCount} submission(s). Deactivate instead or delete the submissions first.`
    })
  }

  try {
    await prisma.form.delete({ where: { id } })
    return { data: { id } }
  } catch (e) {
    if (isPrismaError(e, 'P2025')) {
      throw createError({ statusCode: 404, statusMessage: 'Form not found.' })
    }
    throw e
  }
})
