<script setup lang="ts">
const { getProgram, isProgramId } = useMaanPrograms()
const { getPageSeo, getPosts } = useMaanContent()
const route = useRoute()

definePageMeta({
  validate: (route) => {
    const id = String(route.params.id || '')
    return ['autism', 'down-syndrome', 'learning-difficulties'].includes(id)
  }
})

const programId = computed(() => isProgramId(String(route.params.id))
  ? String(route.params.id) as 'autism' | 'down-syndrome' | 'learning-difficulties'
  : 'autism')

const program = computed(() => getProgram(programId.value, 'ar'))

// Layer 1 — admin-curated related articles per program. See EN mirror
// for the placement-id convention.
const relatedPlacement = computed(() => `${programId.value}-program-related`)

const { data: posts } = await useAsyncData<MaanPost[]>(
  `program-posts-${programId.value}-ar`,
  async () => {
    const tagged = await getPosts('ar', { placement: relatedPlacement.value, limit: 3 })
    if (tagged.length) return tagged
    const items = await getPosts('ar')
    return items.slice(0, 3)
  },
  { default: () => [] }
)

// Layer 2 — admin-added FAQ blocks appended to structural FAQ.
const { byType: getBlocks } = useMaanBlocks()
const { data: faqBlocks } = await useAsyncData(
  `program-faqs-${programId.value}-ar`,
  () => getBlocks<{ q: string, a: string }>('faq_item', 'ar', { placement: relatedPlacement.value, limit: 10 }),
  { default: () => [] }
)
const extraFaqs = computed(() => faqBlocks.value.map(b => ({ q: b.payload.q, a: b.payload.a })))

const { data: pageSeo } = await useAsyncData<MaanSeo>(
  `program-page-seo-${programId.value}-ar`,
  () => getPageSeo(`/ar/programs/${programId.value}`, {
    title: program.value.seoTitle,
    description: program.value.seoDescription
  })
)

const resolvedSeo = useMaanSeo({
  seo: pageSeo.value || undefined,
  fallback: {
    title: program.value.seoTitle,
    description: program.value.seoDescription
  },
  ogFallback: {
    title: program.value.title,
    description: program.value.lead,
    eyebrow: program.value.eyebrow,
    locale: 'ar'
  }
})

useSchemaOrg([
  defineWebPage({
    name: resolvedSeo.title,
    description: resolvedSeo.description,
    inLanguage: 'ar'
  }),
  // Raw schema-org "Service" node — `defineService` isn't exported.
  {
    '@type': 'Service',
    'name': program.value.title,
    'description': program.value.lead,
    'provider': { '@type': 'Organization', 'name': 'مركز معاً للتربية الخاصة' },
    'areaServed': { '@type': 'Country', 'name': 'البحرين' }
  },
  defineBreadcrumb({
    itemListElement: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'البرامج', item: '/ar#programs' },
      { name: program.value.eyebrow, item: `/ar/programs/${programId.value}` }
    ]
  })
])
</script>

<template>
  <MaanProgramPage
    :program="program"
    locale="ar"
    :posts="posts ?? []"
    :extra-faqs="extraFaqs"
  />
</template>
