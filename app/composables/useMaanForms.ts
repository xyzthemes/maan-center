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

// Phase 3 — Family Enquiry: parent name + phone + child age (required) +
// service interest + message. Submissions route to /api/forms/submit and
// land in the dashboard's Submissions table.
export const createMaanContactFormFallback = (locale: 'en' | 'ar' = 'en'): MaanFormBlock => {
  const isAr = locale === 'ar'
  return {
    id: isAr ? 'maan-contact-form-fallback-ar' : 'maan-contact-form-fallback',
    tagline: isAr ? 'تواصل' : 'Contact',
    headline: isAr
      ? 'اسأل عن التقييم والخدمات العلاجية والدعم التعليمي الفردي'
      : 'Ask about assessment, therapy, and individualized education support',
    form: {
      id: '36493b64-2bad-4c58-9d70-785ccb12ee26',
      title: isAr ? 'استفسار الأسرة' : 'Family Enquiry',
      isActive: true,
      submitLabel: isAr ? 'إرسال الاستفسار' : 'Send enquiry',
      onSuccess: 'redirect',
      successMessage: isAr
        ? 'شكراً لتواصلكم. سيتابع فريق معاً معكم خلال يوم العمل.'
        : 'Thank you. The Maan team will follow up within one working day.',
      successRedirectUrl: isAr ? '/ar/contact/thank-you' : '/contact/thank-you',
      fields: [{
        id: 'maan-fallback-parent-name',
        name: 'parent-name',
        type: 'text',
        label: isAr ? 'اسم ولي الأمر' : 'Parent name',
        placeholder: isAr ? 'الاسم الكامل' : 'Full name',
        width: '50',
        choices: [],
        required: true,
        sort: 1
      }, {
        id: 'maan-fallback-phone',
        name: 'phone',
        type: 'text',
        label: isAr ? 'رقم الهاتف' : 'Phone number',
        placeholder: '+973 …',
        validation: 'max:30',
        width: '50',
        choices: [],
        required: true,
        sort: 2
      }, {
        id: 'maan-fallback-child-age',
        name: 'child-age',
        type: 'text',
        label: isAr ? 'عمر الطفل' : 'Child age',
        placeholder: isAr ? 'مثال: ٤ سنوات' : 'e.g. 4 years',
        validation: 'max:20',
        width: '50',
        choices: [],
        required: true,
        sort: 3
      }, {
        id: 'maan-fallback-service',
        name: 'service',
        type: 'select',
        label: isAr ? 'نوع الخدمة المطلوبة' : 'Service of interest',
        width: '50',
        choices: [
          { text: isAr ? 'تقييم أولي' : 'Initial assessment', value: 'assessment' },
          { text: isAr ? 'اضطراب طيف التوحد' : 'Autism spectrum', value: 'autism' },
          { text: isAr ? 'متلازمة داون' : 'Down syndrome', value: 'down-syndrome' },
          { text: isAr ? 'صعوبات التعلم' : 'Learning difficulties', value: 'learning-difficulties' },
          { text: isAr ? 'علاج النطق' : 'Speech therapy', value: 'speech' },
          { text: isAr ? 'العلاج الوظيفي' : 'Occupational therapy', value: 'ot' },
          { text: isAr ? 'استشارة أسرية' : 'Family guidance', value: 'family' },
          { text: isAr ? 'وظائف ومتطوعين' : 'Careers & volunteers', value: 'careers' }
        ],
        required: true,
        sort: 4
      }, {
        id: 'maan-fallback-email',
        name: 'email',
        type: 'text',
        label: isAr ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)',
        placeholder: 'name@example.com',
        validation: 'email|max:255',
        width: '100',
        choices: [],
        required: false,
        sort: 5
      }, {
        id: 'maan-fallback-message',
        name: 'message',
        type: 'textarea',
        label: isAr ? 'كيف نقدر نساعدكم؟' : 'How can we help?',
        placeholder: isAr
          ? 'شاركونا احتياج طفلكم وأي تشخيص أو تقرير سابق.'
          : 'Share your child’s needs and any prior diagnosis or report.',
        width: '100',
        choices: [],
        required: false,
        sort: 6
      }]
    }
  }
}

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
