// Phase 5: public form submission via Prisma.
// Captures the field name + locale-specific label snapshot on each value
// row so historical submissions survive later field renames/deletions
// AND read in the language the submitter actually used.

import { createError, getHeader, readBody, setResponseStatus, getRequestIP } from 'h3'
import { pickLocale } from '~~/app/utils/i18n-text'

type SubmitLocale = 'en' | 'ar'

type SubmitBody = {
  formId?: string
  values?: Record<string, unknown>
  website?: string
  /** Locale the submitter saw the form in. Drives label snapshots. */
  locale?: SubmitLocale
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value))

const normalizeValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.map(item => String(item)).filter(Boolean).join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim()
}

const resolveLocale = (raw: unknown): SubmitLocale => raw === 'ar' ? 'ar' : 'en'

const validateField = (
  field: { name: string, required: boolean, validation: string | null, label: string },
  value: string
): string | undefined => {
  const label = field.label || field.name
  if (field.required && !value) {
    return `${label} is required.`
  }
  const rules = String(field.validation || '').split('|').filter(Boolean)
  for (const rule of rules) {
    if (!value) continue
    if (rule === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${label} must be a valid email address.`
    }
    if (rule === 'url') {
      try {
        new URL(value)
      } catch {
        return `${label} must be a valid URL.`
      }
    }
    if (rule.startsWith('min:') && value.length < Number(rule.split(':')[1])) {
      return `${label} is too short.`
    }
    if (rule.startsWith('max:') && value.length > Number(rule.split(':')[1])) {
      return `${label} is too long.`
    }
    if (rule.startsWith('length:') && value.length !== Number(rule.split(':')[1])) {
      return `${label} has the wrong length.`
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

  const locale = resolveLocale(body.locale)
  const errors: Record<string, string> = {}
  const submittableFields = form.fields.filter(f => f.type !== 'hidden' && f.type !== 'file')

  const valueRows = submittableFields.map((field) => {
    const value = normalizeValue(body.values?.[field.name])
    // Resolve bilingual envelope once per field — used for both the
    // submission snapshot and any validation error message we return.
    const localeLabel = pickLocale(field.label, locale) || field.name
    const error = validateField(
      {
        name: field.name,
        required: field.required,
        validation: field.validation,
        label: localeLabel
      },
      value
    )
    if (error) errors[field.name] = error
    return {
      fieldId: field.id,
      name: field.name,
      label: localeLabel,
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

  const submission = await prisma.formSubmission.create({
    data: {
      formId: form.id,
      locale,
      ipAddress: getRequestIP(event, { xForwardedFor: true }) ?? null,
      userAgent: getHeader(event, 'user-agent') ?? null,
      values: { create: valueRows }
    }
  })

  // Fire-and-forget notification — the submitter should never wait on
  // the mailer, and a mail failure must not poison the 201 response.
  void sendSubmissionNotification({
    formTitle: pickLocale(form.title, locale) || form.slug,
    formSlug: form.slug,
    locale,
    values: valueRows.map(v => ({ label: v.label, value: v.value || '' })),
    dashboardUrl: `${process.env.NUXT_SITE_URL || ''}/dashboard/submissions`
  })

  // Reference the variable so noUnusedLocals doesn't complain in the
  // (rare) case the create gets refactored to not need its return.
  void submission

  setResponseStatus(event, 201)
  return {
    ok: true,
    onSuccess: form.onSuccess || 'message',
    // The client renders this string directly — flatten to the
    // submitter's locale instead of forcing the Vue side to know
    // about the bilingual envelope here.
    successMessage: pickLocale(form.successMessage, locale),
    successRedirectUrl: form.successRedirectUrl
  }
})
