// Phase 5: fetch a form block (headline/tagline wrapper around a form).

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Block id is required.' })

  const block = await prisma.formBlock.findUnique({
    where: { id },
    include: {
      form: {
        include: { fields: { orderBy: { sort: 'asc' } } }
      }
    }
  })

  if (!block || !block.form || !block.form.isActive) return { block: null }

  const form = block.form
  return {
    block: {
      id: block.id,
      headline: block.headline,
      tagline: block.tagline,
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
  }
})
