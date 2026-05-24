// Phase 5: public form submission via Prisma.
// Captures the field name + label snapshot on each value row so historical
// submissions survive later field renames/deletions.

import { createError, getHeader, readBody, setResponseStatus, getRequestIP } from 'h3'

type SubmitBody = {
  formId?: string
  values?: Record<string, unknown>
  website?: string
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value))

const normalizeValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.map(item => String(item)).filter(Boolean).join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim()
}

const validateField = (
  field: { name: string, required: boolean, validation: string | null, label: string | null },
  value: string
): string | undefined => {
  if (field.required && !value) {
    return `${field.label || field.name} is required.`
  }
  const rules = String(field.validation || '').split('|').filter(Boolean)
  for (const rule of rules) {
    if (!value) continue
    if (rule === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${field.label || field.name} must be a valid email address.`
    }
    if (rule === 'url') {
      try {
        new URL(value)
      } catch {
        return `${field.label || field.name} must be a valid URL.`
      }
    }
    if (rule.startsWith('min:') && value.length < Number(rule.split(':')[1])) {
      return `${field.label || field.name} is too short.`
    }
    if (rule.startsWith('max:') && value.length > Number(rule.split(':')[1])) {
      return `${field.label || field.name} is too long.`
    }
    if (rule.startsWith('length:') && value.length !== Number(rule.split(':')[1])) {
      return `${field.label || field.name} has the wrong length.`
    }
  }
  return undefined
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SubmitBody>(event)

  // Honeypot — bots fill the hidden `website` field; humans don't.
  if (body.website) return { ok: true }

  if (!body.formId || !isPlainObject(body.values)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid form submission.' })
  }

  const form = await prisma.form.findUnique({
    where: { id: body.formId },
    include: { fields: { orderBy: { sort: 'asc' } } }
  })

  if (!form || !form.isActive) {
    throw createError({ statusCode: 404, statusMessage: 'Form not found.' })
  }

  const errors: Record<string, string> = {}
  const submittableFields = form.fields.filter(f => f.type !== 'hidden' && f.type !== 'file')

  const valueRows = submittableFields.map((field) => {
    const value = normalizeValue(body.values?.[field.name])
    const error = validateField(field, value)
    if (error) errors[field.name] = error
    return {
      fieldId: field.id,
      name: field.name,
      label: field.label || field.name,
      value: value || null
    }
  })

  if (Object.keys(errors).length) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Please check the form fields.',
      data: { errors }
    })
  }

  await prisma.formSubmission.create({
    data: {
      formId: form.id,
      ipAddress: getRequestIP(event, { xForwardedFor: true }) ?? null,
      userAgent: getHeader(event, 'user-agent') ?? null,
      values: { create: valueRows }
    }
  })

  setResponseStatus(event, 201)
  return {
    ok: true,
    onSuccess: form.onSuccess || 'message',
    successMessage: form.successMessage,
    successRedirectUrl: form.successRedirectUrl
  }
})
