<script setup lang="ts">
const { getPageSeo, getPostsPage, getCategoryOptions } = useMaanContent()

const PAGE_SIZE = 6

// البحث + التصفية حسب التصنيف (S10). يُمرَّر `q`/`category` مع كل طلب فتتسق
// النتائج مع ترقيم الصفحات ويعكس `total` المجموعة المُصفّاة.
const search = ref('')
const debouncedQ = ref('')
const category = ref<string | undefined>(undefined)

const filters = () => ({
  q: debouncedQ.value || undefined,
  category: category.value || undefined
})

const { data: firstPage } = await useAsyncData('maan-blog-posts-ar', () => getPostsPage('ar', { page: 1, limit: PAGE_SIZE }), {
  default: () => ({ posts: [] as MaanPost[], total: 0 })
})

const { data: categoryOptions } = await useAsyncData('maan-blog-categories-ar', () => getCategoryOptions('ar'), {
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
    const next = await getPostsPage('ar', { page: page.value + 1, limit: PAGE_SIZE, ...filters() })
    posts.value = [...posts.value, ...next.posts]
    total.value = next.total
    page.value += 1
  } finally {
    loadingMore.value = false
  }
}

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
    const first = await getPostsPage('ar', { page: 1, limit: PAGE_SIZE, ...filters() })
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
const { data: pageSeo } = await useAsyncData<MaanSeo>('maan-page-seo-blog-ar', () => getPageSeo('/ar/blog', {
  title: 'المرجع العلمي الشامل: دليل معاً للتمكين',
  description: 'مقالات وأدلة من مركز معاً للتربية الخاصة حول طيف التوحد ومتلازمة داون وصعوبات التعلم ودعم الأسرة.'
}))

const resolvedSeo = useMaanSeo({
  seo: pageSeo.value || undefined,
  fallback: {
    title: 'المرجع العلمي الشامل: دليل معاً للتمكين',
    description: 'مقالات وأدلة من مركز معاً للتربية الخاصة حول طيف التوحد ومتلازمة داون وصعوبات التعلم ودعم الأسرة.'
  },
  ogFallback: {
    title: 'دليل معاً للتمكين.',
    description: 'مقالات وأدلة وموارد للأسر والمعلمين.',
    eyebrow: 'المرجع العلمي الشامل',
    locale: 'ar'
  }
})

useSchemaOrg([
  defineWebPage({
    name: resolvedSeo.title,
    description: resolvedSeo.description,
    inLanguage: 'ar'
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'المرجع العلمي', item: '/ar/blog' }
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
            المرجع العلمي الشامل
          </span>
          <h1 class="maan-hero-title mt-5 text-4xl font-bold sm:text-5xl">
            دليل معاً للتمكين.
          </h1>
          <p class="maan-hero-copy mx-auto mt-5 max-w-2xl text-lg">
            مقالات وأدلة من فريق مركز معاً حول طيف التوحد ومتلازمة داون وصعوبات التعلم
            والروتين المنزلي والتعليم الدامج.
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
          dir="rtl"
          class="w-full sm:max-w-sm"
          placeholder="ابحث في المقالات…"
          :aria-label="'ابحث في المقالات'"
        />
        <USelectMenu
          v-model="category"
          :items="categoryOptions"
          value-key="value"
          label-key="label"
          size="lg"
          dir="rtl"
          class="w-full sm:w-56"
          placeholder="كل التصنيفات"
        />
        <UButton
          v-if="hasActiveFilter"
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          @click="clearFilters"
        >
          مسح
        </UButton>
      </div>

      <div
        v-if="isEmpty"
        class="py-16 text-center text-muted"
      >
        لا توجد مقالات تطابق بحثك.
      </div>

      <div
        v-else
        class="grid gap-6 md:grid-cols-3"
      >
        <article
          v-for="post in posts"
          :key="post.slug"
          class="maan-garden-card group p-6 transition hover:-translate-y-1"
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
            <NuxtLink :to="`/ar/blog/${post.slug}`">
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
              locale="ar"
              class="text-muted"
            />
            <UIcon
              name="i-lucide-arrow-left"
              class="size-4 text-primary transition group-hover:-translate-x-1"
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
          تحميل المزيد من المقالات
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
