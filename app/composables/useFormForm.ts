// Per-form editor state. Mirrors useBlockForm but the payload shape is
// the full Form + fields tree. Bilingual envelopes stay as { en, ar }
// in the reactive object so MaanBilingualInput can bind to each side.

import type { BilingualText } from '~/utils/i18n-text'

export type FieldType = 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'date' | 'checkbox' | 'checkbox_group' | 'radio' | 'select' | 'hidden' | 'file'
export type FieldWidth = '100' | '67' | '50' | '33'

export type FormFieldDraft = {
  /** Present when editing an existing field; absent for newly-added ones. */
  id?: string
  name: string
  type: FieldType
  label: BilingualText
  placeholder: BilingualText
  help: BilingualText
  width: FieldWidth
  validation: string
  required: boolean
  sort: number
  choices: Array<{ value: string, text: BilingualText }>
}

export type FormDraft = {
  id?: string
  slug: string
  title: BilingualText
  isActive: boolean
  submitLabel: BilingualText
  onSuccess: 'message' | 'redirect'
  successMessage: BilingualText
  successRedirectUrl: string
  fields: FormFieldDraft[]
}

const emptyBilingual = (): BilingualText => ({ en: '', ar: '' })

export const emptyField = (type: FieldType = 'text', sort = 0): FormFieldDraft => ({
  name: '',
  type,
  label: emptyBilingual(),
  placeholder: emptyBilingual(),
  help: emptyBilingual(),
  width: '100',
  validation: '',
  required: false,
  sort,
  choices: []
})

export const emptyForm = (): FormDraft => ({
  slug: '',
  title: emptyBilingual(),
  isActive: true,
  submitLabel: emptyBilingual(),
  onSuccess: 'message',
  successMessage: emptyBilingual(),
  successRedirectUrl: '',
  fields: []
})

const toBilingualSafe = (v: unknown): BilingualText => {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const o = v as Partial<BilingualText>
    return { en: o.en || '', ar: o.ar || '' }
  }
  if (typeof v === 'string') return { en: v, ar: '' }
  return emptyBilingual()
}

const hydrateField = (raw: unknown, idx: number): FormFieldDraft => {
  if (!raw || typeof raw !== 'object') return emptyField('text', idx)
  const r = raw as Record<string, unknown>
  const type = (typeof r.type === 'string' ? r.type : 'text') as FieldType
  const choicesRaw = Array.isArray(r.choices) ? r.choices : []
  return {
    id: typeof r.id === 'string' ? r.id : undefined,
    name: typeof r.name === 'string' ? r.name : '',
    type,
    label: toBilingualSafe(r.label),
    placeholder: toBilingualSafe(r.placeholder),
    help: toBilingualSafe(r.help),
    width: (typeof r.width === 'string' && ['100', '67', '50', '33'].includes(r.width) ? r.width : '100') as FieldWidth,
    validation: typeof r.validation === 'string' ? r.validation : '',
    required: r.required === true,
    sort: typeof r.sort === 'number' ? r.sort : idx,
    choices: choicesRaw.map((c) => {
      const co = (c ?? {}) as { value?: unknown, text?: unknown }
      return {
        value: typeof co.value === 'string' ? co.value : '',
        text: toBilingualSafe(co.text)
      }
    })
  }
}

export const useFormForm = (onSaved?: () => unknown | Promise<unknown>) => {
  const { t } = useDashboardI18n()
  const formForm = reactive<FormDraft>(emptyForm())
  const saveError = ref('')
  const saveSuccess = ref('')
  const isSaving = ref(false)

  const editForm = (raw: {
    id: string
    slug: string
    title: unknown
    isActive: boolean
    submitLabel: unknown
    onSuccess: string
    successMessage: unknown
    successRedirectUrl: string | null
    fields: unknown[]
  }) => {
    Object.assign(formForm, {
      id: raw.id,
      slug: raw.slug || '',
      title: toBilingualSafe(raw.title),
      isActive: raw.isActive !== false,
      submitLabel: toBilingualSafe(raw.submitLabel),
      onSuccess: raw.onSuccess === 'redirect' ? 'redirect' : 'message',
      successMessage: toBilingualSafe(raw.successMessage),
      successRedirectUrl: raw.successRedirectUrl || '',
      fields: (raw.fields || []).map((f, idx) => hydrateField(f, idx))
    })
    saveError.value = ''
    saveSuccess.value = ''
  }

  const newForm = () => {
    Object.assign(formForm, emptyForm())
    saveError.value = ''
    saveSuccess.value = ''
  }

  const saveForm = async (): Promise<string | undefined> => {
    saveError.value = ''
    saveSuccess.value = ''
    isSaving.value = true

    try {
      const wasCreate = !formForm.id
      const url = wasCreate ? '/api/dashboard/forms' : `/api/dashboard/forms/${formForm.id}`
      const method = wasCreate ? 'POST' : 'PATCH'

      // Server expects bilingual envelopes; null out empty optional
      // pairs so the parser treats them as "absent" rather than
      // "explicitly empty".
      const optionalPair = (v: BilingualText) => (v.en || v.ar) ? v : null
      const body = {
        slug: formForm.slug,
        title: formForm.title,
        isActive: formForm.isActive,
        submitLabel: optionalPair(formForm.submitLabel),
        onSuccess: formForm.onSuccess,
        successMessage: optionalPair(formForm.successMessage),
        successRedirectUrl: formForm.successRedirectUrl || null,
        fields: formForm.fields.map((f, idx) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          label: optionalPair(f.label),
          placeholder: optionalPair(f.placeholder),
          help: optionalPair(f.help),
          width: f.width,
          validation: f.validation || null,
          required: f.required,
          sort: typeof f.sort === 'number' ? f.sort : idx,
          choices: f.choices.length ? f.choices : null
        }))
      }

      const response = await $fetch<{ data?: { id?: string } }>(url, { method, body })
      const savedId = response?.data?.id || formForm.id

      if (wasCreate && savedId) formForm.id = savedId
      saveSuccess.value = wasCreate ? t.value.formCreated : t.value.formUpdated

      if (onSaved) await onSaved()
      return savedId
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      saveError.value = fetchError.data?.message || fetchError.statusMessage || t.value.saveFormError
      return undefined
    } finally {
      isSaving.value = false
    }
  }

  return { formForm, saveError, saveSuccess, isSaving, editForm, newForm, saveForm }
}
