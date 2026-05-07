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

type DirectusForm = {
  id: string
  title?: string
  is_active?: boolean
  submit_label?: string
  on_success?: 'message' | 'redirect'
  success_message?: string
  success_redirect_url?: string
}

type DirectusFormField = {
  id: string
  form?: string
  name?: string
  type?: MaanFormField['type']
  label?: string
  placeholder?: string
  help?: string
  validation?: string
  width?: MaanFormField['width']
  choices?: MaanFormChoice[]
  required?: boolean
  sort?: number
}

type DirectusFormBlock = {
  id: string
  form?: string
  headline?: string
  tagline?: string
}

export const useMaanForms = () => {
  const config = useRuntimeConfig()
  const directusUrl = computed(() => String(config.public.directus.url || '').replace(/\/$/, ''))

  const normalizeField = (field: DirectusFormField): MaanFormField | undefined => {
    if (!field.id || !field.name || !field.type) {
      return undefined
    }

    return {
      id: field.id,
      name: field.name,
      type: field.type,
      label: field.label || field.name,
      placeholder: field.placeholder || undefined,
      help: field.help || undefined,
      validation: field.validation || undefined,
      width: field.width || '100',
      choices: field.choices || [],
      required: Boolean(field.required),
      sort: field.sort
    }
  }

  const normalizeForm = (form: DirectusForm, fields: DirectusFormField[] = []): MaanForm | undefined => {
    if (!form.id || form.is_active === false) {
      return undefined
    }

    return {
      id: form.id,
      title: form.title || 'Form',
      isActive: true,
      submitLabel: form.submit_label || 'Submit',
      onSuccess: form.on_success || 'message',
      successMessage: form.success_message || 'Thank you. Your submission has been received.',
      successRedirectUrl: form.success_redirect_url || undefined,
      fields: (fields
        .map(normalizeField)
        .filter(Boolean) as MaanFormField[])
        .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    }
  }

  const getFormById = async (formId: string) => {
    if (!directusUrl.value || !formId) {
      return undefined
    }

    try {
      const [formResponse, fieldsResponse] = await Promise.all([
        $fetch<{ data?: DirectusForm }>(`${directusUrl.value}/items/forms/${formId}`, {
          query: {
            fields: 'id,title,is_active,submit_label,on_success,success_message,success_redirect_url'
          }
        }),
        $fetch<{ data?: DirectusFormField[] }>(`${directusUrl.value}/items/form_fields`, {
          query: {
            fields: 'id,form,name,type,label,placeholder,help,validation,width,choices,required,sort',
            filter: { form: { _eq: formId } },
            sort: 'sort',
            limit: -1
          }
        })
      ])

      return formResponse.data
        ? normalizeForm(formResponse.data, fieldsResponse.data || [])
        : undefined
    } catch {
      return undefined
    }
  }

  const getFormBlockById = async (blockId: string) => {
    if (!directusUrl.value || !blockId) {
      return undefined
    }

    try {
      const blockResponse = await $fetch<{ data?: DirectusFormBlock }>(`${directusUrl.value}/items/block_form/${blockId}`, {
        query: {
          fields: 'id,form,headline,tagline'
        }
      })
      const block = blockResponse.data

      if (!block?.form) {
        return undefined
      }

      const form = await getFormById(block.form)

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
