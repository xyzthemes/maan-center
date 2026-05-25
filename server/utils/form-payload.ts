// Validation + normalization for the dashboard form editor payloads.
//
// The dashboard's PATCH / POST endpoints accept a single nested shape
// (form metadata + fields + choices). This helper validates it,
// rejects malformed input with 400, and emits a shape ready for Prisma.
//
// Field types accepted: text, textarea, email, phone, number, date,
// checkbox, checkbox_group, radio, select, hidden, file. The same
// enum lives in useMaanForms.ts on the public side.

import { createError } from 'h3'

const bad = (msg: string): never => {
  throw createError({ statusCode: 400, statusMessage: msg })
}

const FIELD_TYPES = new Set([
  'text', 'textarea', 'email', 'phone', 'number', 'date',
  'checkbox', 'checkbox_group', 'radio', 'select', 'hidden', 'file'
])
const FIELD_WIDTHS = new Set(['100', '67', '50', '33'])
const ON_SUCCESS = new Set(['message', 'redirect'])

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/

const requiredStr = (raw: unknown, field: string, max = 4000): string => {
  if (typeof raw !== 'string') return bad(`Field "${field}" is required.`)
  const v = raw.trim()
  if (!v) return bad(`Field "${field}" cannot be empty.`)
  if (v.length > max) return bad(`Field "${field}" exceeds ${max} characters.`)
  return v
}

const optionalStr = (raw: unknown, max = 4000): string | null => {
  if (raw === undefined || raw === null) return null
  if (typeof raw !== 'string') return null
  const v = raw.trim()
  if (!v) return null
  if (v.length > max) return bad(`String exceeds ${max} characters.`)
  return v
}

export type BilingualPayload = { en: string, ar: string }

const requiredBilingual = (raw: unknown, label: string): BilingualPayload => {
  if (!raw || typeof raw !== 'object') return bad(`Field "${label}" is required.`)
  const o = raw as { en?: unknown, ar?: unknown }
  // At least one side must have content — otherwise the editor would
  // store a record nobody can read.
  const en = typeof o.en === 'string' ? o.en.trim() : ''
  const ar = typeof o.ar === 'string' ? o.ar.trim() : ''
  if (!en && !ar) return bad(`Field "${label}" must have an English or Arabic value.`)
  return { en, ar }
}

const optionalBilingual = (raw: unknown): BilingualPayload | null => {
  if (raw === undefined || raw === null) return null
  if (typeof raw !== 'object') return null
  const o = raw as { en?: unknown, ar?: unknown }
  const en = typeof o.en === 'string' ? o.en.trim() : ''
  const ar = typeof o.ar === 'string' ? o.ar.trim() : ''
  if (!en && !ar) return null
  return { en, ar }
}

export type FormChoicePayload = { value: string, text: BilingualPayload }

const parseChoices = (raw: unknown, fieldLabel: string): FormChoicePayload[] | null => {
  if (!raw) return null
  if (!Array.isArray(raw)) return bad(`"${fieldLabel}.choices" must be an array.`)
  return raw.map((c, idx) => {
    if (!c || typeof c !== 'object') return bad(`"${fieldLabel}.choices[${idx}]" is malformed.`)
    const o = c as { value?: unknown, text?: unknown }
    const value = requiredStr(o.value, `${fieldLabel}.choices[${idx}].value`, 80)
    const text = requiredBilingual(o.text, `${fieldLabel}.choices[${idx}].text`)
    return { value, text }
  })
}

export type FormFieldPayload = {
  /** Existing field id when editing; absent when creating new. */
  id?: string
  name: string
  type: string
  label: BilingualPayload | null
  placeholder: BilingualPayload | null
  help: BilingualPayload | null
  width: string
  validation: string | null
  choices: FormChoicePayload[] | null
  required: boolean
  sort: number
}

const NAME_RE = /^[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?$/

const parseField = (raw: unknown, idx: number): FormFieldPayload => {
  if (!raw || typeof raw !== 'object') return bad(`fields[${idx}] is malformed.`)
  const r = raw as Record<string, unknown>
  const fieldLabel = `fields[${idx}]`

  const name = requiredStr(r.name, `${fieldLabel}.name`, 64)
  if (!NAME_RE.test(name)) {
    return bad(`fields[${idx}].name must be lower-kebab (a–z, 0–9, -, _).`)
  }

  const type = String(r.type || 'text')
  if (!FIELD_TYPES.has(type)) {
    return bad(`fields[${idx}].type "${type}" is not supported.`)
  }

  const widthRaw = String(r.width || '100')
  if (!FIELD_WIDTHS.has(widthRaw)) {
    return bad(`fields[${idx}].width must be 100, 67, 50, or 33.`)
  }

  // Hidden fields don't need a label.
  const label = type === 'hidden'
    ? optionalBilingual(r.label)
    : requiredBilingual(r.label, `${fieldLabel}.label`)

  return {
    id: typeof r.id === 'string' && r.id ? r.id : undefined,
    name,
    type,
    label,
    placeholder: optionalBilingual(r.placeholder),
    help: optionalBilingual(r.help),
    width: widthRaw,
    validation: optionalStr(r.validation, 200),
    choices: parseChoices(r.choices, fieldLabel),
    required: r.required === true,
    sort: typeof r.sort === 'number' ? r.sort : idx
  }
}

export type FormPayload = {
  slug: string
  title: BilingualPayload
  isActive: boolean
  submitLabel: BilingualPayload | null
  onSuccess: 'message' | 'redirect'
  successMessage: BilingualPayload | null
  successRedirectUrl: string | null
  fields: FormFieldPayload[]
}

export const parseFormPayload = (raw: unknown): FormPayload => {
  if (!raw || typeof raw !== 'object') return bad('Form payload is required.')
  const r = raw as Record<string, unknown>

  const slug = requiredStr(r.slug, 'slug', 80)
  if (!SLUG_RE.test(slug)) {
    return bad('Slug must be lowercase a–z, 0–9, and dashes (no leading/trailing dash).')
  }

  const title = requiredBilingual(r.title, 'title')

  const onSuccessRaw = String(r.onSuccess || 'message')
  if (!ON_SUCCESS.has(onSuccessRaw)) {
    return bad(`onSuccess "${onSuccessRaw}" must be "message" or "redirect".`)
  }

  const fieldsRaw = Array.isArray(r.fields) ? r.fields : []
  const fields = fieldsRaw.map((f, idx) => parseField(f, idx))

  // Unique field names within the form — otherwise the submission
  // values record can't distinguish them.
  const seen = new Set<string>()
  for (const f of fields) {
    if (seen.has(f.name)) return bad(`Duplicate field name "${f.name}".`)
    seen.add(f.name)
  }

  return {
    slug,
    title,
    isActive: r.isActive !== false,
    submitLabel: optionalBilingual(r.submitLabel),
    onSuccess: onSuccessRaw as 'message' | 'redirect',
    successMessage: optionalBilingual(r.successMessage),
    successRedirectUrl: optionalStr(r.successRedirectUrl, 800),
    fields
  }
}
