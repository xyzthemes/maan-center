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

const { data: posts } = await useAsyncData<MaanPost[]>(
  `program-posts-${programId.value}-ar`,
  async () => {
    const items = await getPosts('ar')
    return items.slice(0, 3)
  },
  { default: () => [] }
)

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
  />
</template>
