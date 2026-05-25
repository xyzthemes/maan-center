// Phase B — update a form + its fields atomically.
//
// Field diff strategy: keep fields whose `id` arrives in the body
// (update in place), insert any without an id, and delete every
// existing field whose id is no longer present. Doing this in a
// single `$transaction` so partial failures don't leave the form
// in a half-edited state.
//
// Why diff (not "delete all + recreate"): FormSubmissionValue.fieldId
// FKs onto FormField; nuking the field rows would SetNull every value
// row's link to its field for the entire history. The diff preserves
// those links for fields that survived the edit.

import { createError, getRouterParam, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: 'admin' } })
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Form id is required.' })

  const raw = await readBody(event)
  const payload = parseFormPayload(raw)

  const existing = await prisma.form.findUnique({
    where: { id },
    include: { fields: { select: { id: true } } }
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Form not found.' })

  const existingFieldIds = new Set(existing.fields.map(f => f.id))
  const incomingFieldIds = new Set(payload.fields.map(f => f.id).filter((v): v is string => !!v))
  const toDelete = [...existingFieldIds].filter(fid => !incomingFieldIds.has(fid))
  const toUpdate = payload.fields.filter(f => f.id && existingFieldIds.has(f.id))
  const toCreate = payload.fields.filter(f => !f.id || !existingFieldIds.has(f.id))

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.form.update({
        where: { id },
        data: {
          slug: payload.slug,
          title: payload.title as never,
          isActive: payload.isActive,
          submitLabel: payload.submitLabel as never,
          onSuccess: payload.onSuccess,
          successMessage: payload.successMessage as never,
          successRedirectUrl: payload.successRedirectUrl
        }
      })

      if (toDelete.length) {
        await tx.formField.deleteMany({ where: { id: { in: toDelete } } })
      }
      for (const f of toUpdate) {
        await tx.formField.update({
          where: { id: f.id! },
          data: {
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
          }
        })
      }
      if (toCreate.length) {
        await tx.formField.createMany({
          data: toCreate.map(f => ({
            formId: id,
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
        })
      }

      return tx.form.findUnique({
        where: { id },
        include: { fields: { orderBy: { sort: 'asc' } } }
      })
    })

    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Form not found after update.' })
    return { data: toDashboardForm(updated) }
  } catch (e) {
    if (isPrismaError(e, 'P2002')) {
      throw createError({ statusCode: 409, statusMessage: 'A form with this slug already exists.' })
    }
    if (isPrismaError(e, 'P2025')) {
      throw createError({ statusCode: 404, statusMessage: 'Form not found.' })
    }
    throw e
  }
})
