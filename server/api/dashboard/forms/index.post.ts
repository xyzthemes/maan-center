// Phase B — create a new form. Validates the payload via parseFormPayload,
// enforces slug uniqueness with a friendly 409 instead of a raw Prisma
// constraint error, and inserts the form + nested fields in a single
// transaction.

import { createError, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'forms')

  const raw = await readBody(event)
  const payload = parseFormPayload(raw)

  try {
    const form = await prisma.form.create({
      data: {
        slug: payload.slug,
        title: payload.title as never,
        isActive: payload.isActive,
        submitLabel: payload.submitLabel as never,
        onSuccess: payload.onSuccess,
        successMessage: payload.successMessage as never,
        successRedirectUrl: payload.successRedirectUrl,
        fields: {
          create: payload.fields.map(f => ({
            name: f.name,
            type: f.type,
            label: f.label as never,
            placeholder: f.placeholder as never,
            help: f.help as never,
            width: f.width,
            validation: f.validation,
            choices: f.choices as never,
            required: f.required,
            sort: f.sort
          }))
        }
      },
      include: { fields: true }
    })
    return { data: toDashboardForm(form) }
  } catch (e) {
    if (isPrismaError(e, 'P2002')) {
      throw createError({ statusCode: 409, statusMessage: 'A form with this slug already exists.' })
    }
    throw e
  }
})
