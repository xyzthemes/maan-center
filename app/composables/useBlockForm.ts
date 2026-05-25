// Layer 2 — per-block editor state. One reactive form object that
// represents *any* block type. Type-specific payload fields live under
// `payload`; the editor template switches on `type` to render the right
// inputs. Server validates with parseBlockPayload, so unused payload
// fields are dropped server-side.

import type { DashboardBlock } from './useDashboardBlocks'

export type BlockForm = {
  id?: string
  type: string
  locale: 'en' | 'ar' | '*'
  status: string
  sort: number | ''
  published_at: string
  placements: string[]
  // Payload covers the union of every block type's fields. Fields not
  // used by the active `type` are simply ignored server-side.
  payload: {
    quote: string
    attribution: string
    q: string
    a: string
    value: string
    label: string
    name: string
    role: string
    bio: string
    imageUrl: string
    tags: string[]
    title: string
    description: string
    icon: string
    ctaLabel: string
    ctaUrl: string
  }
}

export const emptyBlockForm = (type: string = 'testimonial'): BlockForm => ({
  type,
  locale: 'en',
  status: 'draft',
  sort: '',
  published_at: '',
  placements: [],
  payload: {
    quote: '',
    attribution: '',
    q: '',
    a: '',
    value: '',
    label: '',
    name: '',
    role: '',
    bio: '',
    imageUrl: '',
    tags: [],
    title: '',
    description: '',
    icon: 'i-lucide-sparkles',
    ctaLabel: '',
    ctaUrl: ''
  }
})

// Extract just the fields each type needs, so the API receives a clean
// payload that matches the server-side parser. Anything else gets stripped.
const buildPayload = (form: BlockForm): object => {
  const p = form.payload
  switch (form.type) {
    case 'testimonial':
      return { quote: p.quote, attribution: p.attribution }
    case 'faq_item':
      return { q: p.q, a: p.a }
    case 'stat_tile':
      return { value: p.value, label: p.label }
    case 'team_member':
      return {
        name: p.name,
        role: p.role,
        bio: p.bio,
        ...(p.imageUrl ? { imageUrl: p.imageUrl } : {}),
        ...(p.tags.length ? { tags: p.tags } : {})
      }
    case 'service_card':
      return {
        title: p.title,
        description: p.description,
        icon: p.icon,
        ...(p.ctaLabel ? { ctaLabel: p.ctaLabel } : {}),
        ...(p.ctaUrl ? { ctaUrl: p.ctaUrl } : {})
      }
    default:
      return {}
  }
}

// Reverse of buildPayload — when editing an existing block, hydrate the
// shared payload bag from the type-specific row.
const hydratePayload = (type: string, raw: unknown): BlockForm['payload'] => {
  const empty = emptyBlockForm(type).payload
  if (!raw || typeof raw !== 'object') return empty
  const r = raw as Record<string, unknown>
  return {
    ...empty,
    quote: typeof r.quote === 'string' ? r.quote : '',
    attribution: typeof r.attribution === 'string' ? r.attribution : '',
    q: typeof r.q === 'string' ? r.q : '',
    a: typeof r.a === 'string' ? r.a : '',
    value: typeof r.value === 'string' ? r.value : '',
    label: typeof r.label === 'string' ? r.label : '',
    name: typeof r.name === 'string' ? r.name : '',
    role: typeof r.role === 'string' ? r.role : '',
    bio: typeof r.bio === 'string' ? r.bio : '',
    imageUrl: typeof r.imageUrl === 'string' ? r.imageUrl : '',
    tags: Array.isArray(r.tags) ? r.tags.filter((v): v is string => typeof v === 'string') : [],
    title: typeof r.title === 'string' ? r.title : '',
    description: typeof r.description === 'string' ? r.description : '',
    icon: typeof r.icon === 'string' && r.icon ? r.icon : empty.icon,
    ctaLabel: typeof r.ctaLabel === 'string' ? r.ctaLabel : '',
    ctaUrl: typeof r.ctaUrl === 'string' ? r.ctaUrl : ''
  }
}

export const useBlockForm = (onSaved?: () => unknown | Promise<unknown>) => {
  const { t } = useDashboardI18n()
  const blockForm = reactive<BlockForm>(emptyBlockForm())
  const saveError = ref('')
  const saveSuccess = ref('')
  const isSaving = ref(false)

  const statusOptions = computed(() => [
    { value: 'all' as const, label: t.value.filterAll },
    { value: 'draft' as const, label: t.value.draft },
    { value: 'in_review' as const, label: t.value.inReview },
    { value: 'published' as const, label: t.value.published }
  ])

  const statusLabel = (status?: string) => {
    if (status === 'published') return t.value.published
    if (status === 'in_review') return t.value.inReview
    return t.value.draft
  }

  const editBlock = (block: DashboardBlock) => {
    Object.assign(blockForm, {
      id: block.id,
      type: block.type || 'testimonial',
      locale: (block.locale === 'ar' || block.locale === '*' || block.locale === 'en')
        ? block.locale
        : 'en',
      status: block.status || 'draft',
      sort: typeof block.sort === 'number' ? block.sort : '',
      published_at: block.published_at || '',
      placements: Array.isArray(block.placements) ? [...block.placements] : [],
      payload: hydratePayload(block.type || 'testimonial', block.payload)
    })
    saveError.value = ''
    saveSuccess.value = ''
  }

  const newBlock = (type: string = 'testimonial') => {
    Object.assign(blockForm, emptyBlockForm(type))
    saveError.value = ''
    saveSuccess.value = ''
  }

  const saveBlock = async (): Promise<string | undefined> => {
    saveError.value = ''
    saveSuccess.value = ''
    isSaving.value = true

    try {
      const wasCreate = !blockForm.id
      const method = wasCreate ? 'POST' : 'PATCH'
      const url = wasCreate ? '/api/dashboard/blocks' : `/api/dashboard/blocks/${blockForm.id}`

      const body = {
        type: blockForm.type,
        locale: blockForm.locale,
        status: blockForm.status,
        sort: typeof blockForm.sort === 'number' ? blockForm.sort : null,
        published_at: blockForm.published_at,
        placements: blockForm.placements,
        payload: buildPayload(blockForm)
      }

      const response = await $fetch<{ data?: { id?: string } } | undefined>(url, { method, body })
      const savedId = response?.data?.id || blockForm.id

      if (wasCreate && savedId) blockForm.id = savedId
      saveSuccess.value = wasCreate ? t.value.blockCreated : t.value.blockUpdated

      if (onSaved) await onSaved()
      return savedId
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      saveError.value = fetchError.data?.message || fetchError.statusMessage || t.value.saveBlockError
      return undefined
    } finally {
      isSaving.value = false
    }
  }

  return {
    blockForm,
    saveError,
    saveSuccess,
    isSaving,
    statusOptions,
    statusLabel,
    editBlock,
    newBlock,
    saveBlock
  }
}
