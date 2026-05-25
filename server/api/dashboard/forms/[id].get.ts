// Phase B — read one form for the editor. Bilingual columns flow through
// as-is so the editor can render both EN + AR inputs side by side.

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'forms')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Form id is required.' })

  const form = await prisma.form.findUnique({
    where: { id },
    include: { fields: { orderBy: { sort: 'asc' } } }
  })
  if (!form) throw createError({ statusCode: 404, statusMessage: 'Form not found.' })

  return { data: toDashboardForm(form) }
})
