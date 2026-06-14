<script setup lang="ts">
// S9 — authenticated draft live preview (Q4: dashboard route, no public token).
//
// Renders an unpublished (draft / in_review) post through the SAME
// `BlogArticleBody` component the public `/blog/[slug]` page uses, so an editor
// sees the article exactly as it will publish. Unpublished content stays
// public-invisible: this route is under the `dashboard` layout and is guarded
// by the dashboard-permission middleware (`/dashboard/posts` → `posts` scope;
// longest-prefix match in URL_TO_SCOPE also covers this nested route). It
// fetches via the auth-gated dashboard list API (`/api/dashboard/posts`, which
// returns drafts) — NOT the public single-post route, which only ever returns
// published posts.
definePageMeta({
  alias: ['/ar/dashboard/posts/:id/preview'],
  layout: 'dashboard'
})

const route = useRoute()
const { t, isArabic } = useDashboardI18n()
const { posts, loadPosts } = usePosts()

const id = computed(() => String(route.params.id))
const notFound = ref(false)

const editHref = computed(() =>
  isArabic.value ? `/ar/dashboard/posts/${id.value}` : `/dashboard/posts/${id.value}`
)

// Locale heuristic matches the dashboard list + public API: Arabic slug prefix
// or Arabic script in the title. Drives RTL + Arabic labels in the rendered
// article so the preview mirrors what the public page would show.
const isArabicPost = (slug = '', title = '') =>
  slug.startsWith('ar-') || /[؀-ۿ]/.test(title)

// Map a dashboard post (which carries unpublished status) into the public
// MaanPost shape BlogArticleBody expects. Mirrors `toMaanPost` in
// useMaanContent.ts so the preview render matches the published one.
const post = computed<MaanPost | null>(() => {
  const dp = posts.value.find(p => p.id === id.value)
  if (!dp) return null

  const locale: 'en' | 'ar' = isArabicPost(dp.slug, dp.title) ? 'ar' : 'en'
  const description = dp.description || (locale === 'ar'
    ? 'رؤى وتحديثات من مركز معان للتربية الخاصة.'
    : 'Insights and updates from Maan Special Education Center.')

  return {
    slug: dp.slug || '',
    locale,
    title: dp.title || t.value.untitledPost,
    description,
    category: locale === 'ar' ? 'مدونة المركز' : 'Center Blog',
    publishedAt: dp.published_at || dp.date_created || new Date().toISOString(),
    readTime: locale === 'ar' ? '٤ دقائق' : '4 min read',
    image: undefined,
    content: dp.content || '<p></p>',
    seo: {
      title: dp.seo?.title || dp.title,
      description
    }
  }
})

const articleDir = computed(() => (post.value?.locale === 'ar' ? 'rtl' : 'ltr'))

const primePreview = async () => {
  notFound.value = false
  if (posts.value.length === 0) await loadPosts()
  if (!posts.value.find(p => p.id === id.value)) notFound.value = true
}

watch(() => route.params.id, primePreview, { immediate: true })
</script>

<template>
  <UDashboardPanel id="post-preview">
    <template #header>
      <UDashboardNavbar :title="t.previewTitle">
        <template #leading>
          <UButton
            :to="editHref"
            :icon="isArabic ? 'i-lucide-arrow-right' : 'i-lucide-arrow-left'"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            :aria-label="t.editPost"
          />
        </template>
        <template #right>
          <UBadge
            color="warning"
            variant="subtle"
          >
            {{ t.previewBadge }}
          </UBadge>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UAlert
        v-if="notFound"
        color="error"
        variant="soft"
        :title="t.untitledPost"
        :description="`#${id}`"
      />

      <div
        v-else-if="post"
        :dir="articleDir"
      >
        <BlogArticleBody :post="post" />
      </div>
    </template>
  </UDashboardPanel>
</template>
