export type MaanFormChoice = {
  text: string
  value: string
}

export type MaanFormField = {
  id: string
  name: string
  type: 'text' | 'textarea' | 'checkbox' | 'checkbox_group' | 'radio' | 'select' | 'hidden' | 'file'
  label: string
  placeholder?: string
  help?: string
  validation?: string
  width: '100' | '67' | '50' | '33'
  choices: MaanFormChoice[]
  required: boolean
  sort?: number
}

export type MaanForm = {
  id: string
  title: string
  isActive: boolean
  submitLabel: string
  onSuccess: 'message' | 'redirect'
  successMessage?: string
  successRedirectUrl?: string
  fields: MaanFormField[]
}

export type MaanFormBlock = {
  id: string
  headline?: string
  tagline?: string
  form: MaanForm
}

export const createMaanContactFormFallback = (locale: 'en' | 'ar' = 'en'): MaanFormBlock => ({
  id: locale === 'ar' ? 'maan-contact-form-fallback-ar' : 'maan-contact-form-fallback',
  tagline: locale === 'ar' ? 'تواصل' : 'Contact',
  headline: locale === 'ar'
    ? 'اسأل عن التقييم والخدمات العلاجية والدعم التعليمي الفردي'
    : 'Ask about assessment, therapy, and individualized education support',
  form: {
    id: '36493b64-2bad-4c58-9d70-785ccb12ee26',
    title: 'Family Enquiry',
    isActive: true,
    submitLabel: 'Send enquiry',
    onSuccess: 'message',
    successMessage: 'Thank you. The Maan team will review your enquiry and follow up with the next step.',
    fields: [{
      id: 'maan-fallback-first-name',
      name: 'first-name',
      type: 'text',
      label: 'First Name',
      placeholder: 'John',
      width: '50',
      choices: [],
      required: true,
      sort: 1
    }, {
      id: 'maan-fallback-last-name',
      name: 'last-name',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Doe',
      width: '50',
      choices: [],
      required: true,
      sort: 2
    }, {
      id: 'maan-fallback-email',
      name: 'email',
      type: 'text',
      label: 'Email',
      placeholder: 'john@example.com',
      validation: 'email|max:255',
      width: '100',
      choices: [],
      required: true,
      sort: 3
    }, {
      id: 'maan-fallback-department',
      name: 'department',
      type: 'select',
      label: 'What support are you interested in?',
      width: '100',
      choices: [{
        text: 'Assessment',
        value: 'assessment'
      }, {
        text: 'Individualized education',
        value: 'individualized-education'
      }, {
        text: 'Speech and communication',
        value: 'speech-communication'
      }, {
        text: 'Occupational therapy',
        value: 'occupational-therapy'
      }, {
        text: 'Family guidance',
        value: 'family-guidance'
      }],
      required: false,
      sort: 4
    }, {
      id: 'maan-fallback-comments',
      name: 'comments',
      type: 'textarea',
      label: 'How can we help?',
      placeholder: 'Share your child\'s age, needs, and preferred next step.',
      width: '100',
      choices: [],
      required: false,
      sort: 5
    }]
  }
})

// Phase 5: internal API shapes returned by /api/public/forms/[id] and
// /api/public/form-blocks/[id]. JSON serialization turns Prisma's `null`s into
// nulls (not undefined), so the optional fields are `T | null` not `T | undefined`.

type ApiFormField = {
  id: string
  name: string
  type: string
  label: string | null
  placeholder: string | null
  help: string | null
  validation: string | null
  width: string | null
  choices: MaanFormChoice[] | null
  required: boolean
  sort: number | null
}

type ApiForm = {
  id: string
  title: string
  isActive: boolean
  submitLabel: string | null
  onSuccess: string
  successMessage: string | null
  successRedirectUrl: string | null
  fields: ApiFormField[]
}

const VALID_FIELD_TYPES: ReadonlySet<MaanFormField['type']> = new Set([
  'text', 'textarea', 'checkbox', 'checkbox_group', 'radio', 'select', 'hidden', 'file'
])
const VALID_WIDTHS: ReadonlySet<MaanFormField['width']> = new Set(['100', '67', '50', '33'])

const toMaanField = (field: ApiFormField): MaanFormField | undefined => {
  if (!field.id || !field.name) return undefined
  const type = VALID_FIELD_TYPES.has(field.type as MaanFormField['type'])
    ? field.type as MaanFormField['type']
    : 'text'
  const width = VALID_WIDTHS.has(field.width as MaanFormField['width'])
    ? field.width as MaanFormField['width']
    : '100'
  return {
    id: field.id,
    name: field.name,
    type,
    label: field.label || field.name,
    placeholder: field.placeholder || undefined,
    help: field.help || undefined,
    validation: field.validation || undefined,
    width,
    choices: field.choices || [],
    required: Boolean(field.required),
    sort: field.sort ?? undefined
  }
}

const toMaanForm = (form: ApiForm): MaanForm | undefined => {
  if (!form.id || !form.isActive) return undefined
  return {
    id: form.id,
    title: form.title || 'Form',
    isActive: true,
    submitLabel: form.submitLabel || 'Submit',
    onSuccess: form.onSuccess === 'redirect' ? 'redirect' : 'message',
    successMessage: form.successMessage || 'Thank you. Your submission has been received.',
    successRedirectUrl: form.successRedirectUrl || undefined,
    fields: (form.fields
      .map(toMaanField)
      .filter(Boolean) as MaanFormField[])
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
  }
}

export const useMaanForms = () => {
  const getFormById = async (formId: string): Promise<MaanForm | undefined> => {
    if (!formId) return undefined
    try {
      const res = await $fetch<{ form: ApiForm | null }>(`/api/public/forms/${formId}`)
      return res.form ? toMaanForm(res.form) : undefined
    } catch {
      return undefined
    }
  }

  const getFormBlockById = async (blockId: string): Promise<MaanFormBlock | undefined> => {
    if (!blockId) return undefined
    try {
      const res = await $fetch<{
        block: {
          id: string
          headline: string | null
          tagline: string | null
          form: ApiForm
        } | null
      }>(`/api/public/form-blocks/${blockId}`)
      const block = res.block
      if (!block) return undefined
      const form = toMaanForm(block.form)
      return form
        ? {
            id: block.id,
            headline: block.headline || undefined,
            tagline: block.tagline || undefined,
            form
          }
        : undefined
    } catch {
      return undefined
    }
  }

  return {
    getFormById,
    getFormBlockById
  }
}
