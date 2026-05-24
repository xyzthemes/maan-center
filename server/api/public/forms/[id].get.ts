// Phase 5: fetch a form + its fields for the public site (Prisma).

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Form id is required.' })

  const form = await prisma.form.findUnique({
    where: { id },
    include: { fields: { orderBy: { sort: 'asc' } } }
  })

  if (!form || !form.isActive) return { form: null }

  return {
    form: {
      id: form.id,
      title: form.title,
      isActive: form.isActive,
      submitLabel: form.submitLabel,
      onSuccess: form.onSuccess,
      successMessage: form.successMessage,
      successRedirectUrl: form.successRedirectUrl,
      fields: form.fields.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder,
        help: f.help,
        validation: f.validation,
        width: f.width,
        choices: f.choices,
        required: f.required,
        sort: f.sort
      }))
    }
  }
})
