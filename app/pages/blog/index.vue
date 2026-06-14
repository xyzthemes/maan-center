<script setup lang="ts">
const { getPageSeo, getPostsPage, getCategoryOptions } = useMaanContent()
const { getFormBlockById } = useMaanForms()

const PAGE_SIZE = 6

// Search + category filter (S10). `q`/`category` compose with the server
// pagination — every fetch passes the active filters, so `total` reflects
// the filtered set and "Load More" stops at the right place.
const search = ref('')
const debouncedQ = ref('')
const category = ref<string | undefined>(undefined)

const filters = () => ({
  q: debouncedQ.value || undefined,
  category: category.value || undefined
})

const { data: firstPage } = await useAsyncData('maan-blog-posts', () => getPostsPage('en', { page: 1, limit: PAGE_SIZE }), {
  default: () => ({ posts: [] as MaanPost[], total: 0 })
})

const { data: categoryOptions } = await useAsyncData('maan-blog-categories', () => getCategoryOptions('en'), {
  default: () => [] as Array<{ value: string, label: string }>
})

const posts = ref<MaanPost[]>(firstPage.value?.posts ?? [])
const total = ref(firstPage.value?.total ?? 0)
const page = ref(1)
const loadingMore = ref(false)
const reloading = ref(false)
const hasMore = computed(() => posts.value.length < total.value)
const isEmpty = computed(() => !reloading.value && posts.value.length === 0)
const hasActiveFilter = computed(() => Boolean(debouncedQ.value || category.value))

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    const next = await getPostsPage('en', { page: page.value + 1, limit: PAGE_SIZE, ...filters() })
    posts.value = [...posts.value, ...next.posts]
    total.value = next.total
    page.value += 1
  } finally {
    loadingMore.value = false
  }
}

// Re-run from page 1 whenever a filter changes. Debounce the typed query so
// we don't fire a request per keystroke.
let debounceTimer: ReturnType<typeof setTimeout> | undefined
watch(search, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQ.value = value.trim()
  }, 350)
})
onScopeDispose(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

const reload = async () => {
  reloading.value = true
  try {
    const first = await getPostsPage('en', { page: 1, limit: PAGE_SIZE, ...filters() })
    posts.value = first.posts
    total.value = first.total
    page.value = 1
  } finally {
    reloading.value = false
  }
}
watch([debouncedQ, category], reload)

const clearFilters = () => {
  search.value = ''
  debouncedQ.value = ''
  category.value = undefined
}
const { data: pageSeo } = await useAsyncData<MaanSeo>('maan-page-seo-blog', () => getPageSeo('/blog', {
  title: 'Blog',
  description: 'Family guidance, center updates, and practical learning resources from Maan Special Education Center.'
}))
const { data: resourcesForm } = await useAsyncData<MaanFormBlock | undefined>('maan-blog-resources-form', () => getFormBlockById('3e262b2d-48fc-4816-b5e8-c991817d56fc', 'en'))

const resolvedSeo = useMaanSeo({
  seo: pageSeo.value || undefined,
  fallback: {
    title: 'Blog',
    description: 'Family guidance, center updates, and practical learning resources from Maan Special Education Center.'
  },
  ogFallback: {
    title: 'Practical guidance for families and educators.',
    description: 'Learning plans, therapy support, home routines, and inclusive education from Maan Special Education Center.',
    eyebrow: 'Maan Blog',
    locale: 'en'
  }
})

useSchemaOrg([
  defineWebPage({
    name: resolvedSeo.title,
    description: resolvedSeo.description,
    inLanguage: 'en'
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Blog', item: '/blog' }
    ]
  })
])
</script>

<template>
  <div class="maan-page">
    <section class="maan-blog-hero border-b">
      <UContainer class="py-16 sm:py-20">
        <div class="mx-auto max-w-3xl text-center">
          <span class="maan-eyebrow">
            Comprehensive Scientific Reference
          </span>
          <h1 class="maan-hero-title mt-5 text-4xl font-bold sm:text-5xl">
            Maan’s Empowerment Guide.
          </h1>
          <p class="maan-hero-copy mx-auto mt-5 max-w-2xl text-lg">
            Articles, guides, and resources from the Maan team on autism spectrum support,
            Down syndrome programs, learning difficulties, and family-led learning at home.
          </p>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-14 sm:py-18">
      <div class="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          size="lg"
          class="w-full sm:max-w-sm"
          placeholder="Search articles…"
          :aria-label="'Search articles'"
        />
        <USelectMenu
          v-model="category"
          :items="categoryOptions"
          value-key="value"
          label-key="label"
          size="lg"
          class="w-full sm:w-56"
          placeholder="All categories"
        />
        <UButton
          v-if="hasActiveFilter"
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          @click="clearFilters"
        >
          Clear
        </UButton>
      </div>

      <div
        v-if="isEmpty"
        class="py-16 text-center text-muted"
      >
        No articles match your search.
      </div>

      <div
        v-else
        class="grid gap-6 md:grid-cols-3"
      >
        <article
          v-for="post in posts"
          :key="post.slug"
          class="maan-garden-card group relative p-6 transition hover:-translate-y-1"
        >
          <div class="flex items-center gap-3 text-sm text-muted">
            <UBadge
              color="neutral"
              variant="soft"
            >
              {{ post.category }}
            </UBadge>
            <span>{{ post.readTime }}</span>
          </div>

          <h2 class="mt-5 text-xl font-semibold leading-7 text-highlighted">
            <NuxtLink :to="`/blog/${post.slug}`">
              <span class="absolute inset-0" />
              {{ post.title }}
            </NuxtLink>
          </h2>
          <p class="mt-3 line-clamp-3 text-sm leading-6 text-muted">
            {{ post.description }}
          </p>
          <div class="mt-6 flex items-center justify-between text-sm">
            <NuxtTime
              :datetime="post.publishedAt"
              month="long"
              day="numeric"
              year="numeric"
              class="text-muted"
            />
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 text-primary transition group-hover:translate-x-1"
            />
          </div>
        </article>
      </div>

      <div
        v-if="hasMore"
        class="mt-10 flex justify-center"
      >
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          :loading="loadingMore"
          @click="loadMore"
        >
          Load more articles
        </UButton>
      </div>
    </UContainer>

    <MaanForm
      :block="resourcesForm"
      locale="en"
    />
  </div>
</template>
