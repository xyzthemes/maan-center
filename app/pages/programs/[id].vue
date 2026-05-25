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

const program = computed(() => getProgram(programId.value, 'en'))

// Layer 1 — related articles are admin-curated via post placement. The
// placement id follows the convention `<programId>-program-related`,
// matching POST_PLACEMENTS in useMaanTaxonomy. Falls back to "latest 3"
// only when no posts are tagged, so a freshly-installed program page
// still shows something meaningful.
const relatedPlacement = computed(() => `${programId.value}-program-related`)

const { data: posts } = await useAsyncData<MaanPost[]>(
  `program-posts-${programId.value}-en`,
  async () => {
    const tagged = await getPosts('en', { placement: relatedPlacement.value, limit: 3 })
    if (tagged.length) return tagged
    const items = await getPosts('en')
    return items.slice(0, 3)
  },
  { default: () => [] }
)

const { data: pageSeo } = await useAsyncData<MaanSeo>(
  `program-page-seo-${programId.value}-en`,
  () => getPageSeo(`/programs/${programId.value}`, {
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
    locale: 'en'
  }
})

useSchemaOrg([
  defineWebPage({
    name: resolvedSeo.title,
    description: resolvedSeo.description,
    inLanguage: 'en'
  }),
  // Raw schema-org "Service" node — `defineService` isn't exported by
  // @unhead/schema-org, so we emit the JSON-LD shape directly.
  {
    '@type': 'Service',
    'name': program.value.title,
    'description': program.value.lead,
    'provider': { '@type': 'Organization', 'name': 'Maan Special Education Center' },
    'areaServed': { '@type': 'Country', 'name': 'Bahrain' }
  },
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Programs', item: '/#programs' },
      { name: program.value.eyebrow, item: `/programs/${programId.value}` }
    ]
  })
])
</script>

<template>
  <MaanProgramPage
    :program="program"
    locale="en"
    :posts="posts ?? []"
  />
</template>
