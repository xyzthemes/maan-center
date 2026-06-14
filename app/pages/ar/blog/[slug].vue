<script setup lang="ts">
const route = useRoute('/ar/blog/[slug]')
const { getPostBySlug, getPosts } = useMaanContent()
const slug = computed(() => String(route.params.slug || ''))

const { data: post } = await useAsyncData<MaanPost | undefined>(`maan-blog-ar-${slug.value}`, () => getPostBySlug(slug.value, 'ar'))

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'المقال غير موجود'
  })
}

// Related = up to 3 published AR posts that SHARE the current post's categories
// (DB `hasSome` via the public `category` filter, comma-joined for multi-cat),
// excluding the current post; falls back to the latest AR posts when the post
// has no categories or no category-matches exist. AR locale kept on this page.
const { data: related } = await useAsyncData<MaanPost[]>(`maan-blog-ar-${slug.value}-related`, async () => {
  const cats = post.value?.categories ?? []
  const exclude = (list: MaanPost[]) => list.filter(p => p.slug !== slug.value)

  if (cats.length) {
    const byCategory = await getPosts('ar', { category: cats.join(','), limit: 4 })
    const topical = exclude(byCategory).slice(0, 3)
    if (topical.length) return topical
  }

  const latest = await getPosts('ar', { limit: 4 })
  return exclude(latest).slice(0, 3)
}, { default: () => [] })

const resolvedSeo = useMaanSeo({
  seo: post.value.seo,
  fallback: {
    title: post.value.title,
    description: post.value.description
  },
  ogFallback: {
    title: post.value.title,
    description: post.value.description,
    eyebrow: post.value.category,
    locale: 'ar'
  },
  ogType: 'article',
  articlePublishedTime: post.value.publishedAt
})

useSchemaOrg([
  defineArticle({
    headline: resolvedSeo.title,
    description: resolvedSeo.description,
    datePublished: post.value.publishedAt,
    image: resolvedSeo.ogImage || post.value.image,
    author: { name: 'مركز معاً للتربية الخاصة' }
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'المرجع العلمي', item: '/ar/blog' },
      { name: post.value.title, item: `/ar/blog/${post.value.slug}` }
    ]
  })
])
</script>

<template>
  <article
    v-if="post"
    class="maan-page"
  >
    <section class="maan-blog-hero border-b">
      <UContainer class="py-14 sm:py-20">
        <div class="mx-auto max-w-3xl">
          <span class="maan-eyebrow">
            {{ post.category }}
          </span>
          <h1 class="maan-hero-title mt-5 text-4xl font-bold sm:text-5xl">
            {{ post.title }}
          </h1>
          <p class="maan-hero-copy mt-5 text-lg">
            {{ post.description }}
          </p>
          <div
            class="mt-6 flex flex-wrap items-center gap-3 text-sm"
            style="color: var(--maan-ink-muted);"
          >
            <span class="inline-flex items-center gap-1.5">
              <UIcon
                name="i-lucide-calendar"
                class="size-4"
              />
              <NuxtTime
                :datetime="post.publishedAt"
                month="long"
                day="numeric"
                year="numeric"
                locale="ar"
              />
            </span>
            <span aria-hidden="true">·</span>
            <span class="inline-flex items-center gap-1.5">
              <UIcon
                name="i-lucide-clock"
                class="size-4"
              />
              {{ post.readTime }}
            </span>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_18rem]">
        <div class="maan-prose-card">
          <NuxtImg
            v-if="post.image"
            :src="post.image"
            :alt="post.title"
            sizes="100vw md:768px lg:760px"
            format="webp"
            loading="lazy"
            class="mb-10 aspect-video w-full rounded-2xl object-cover"
          />
          <!-- v-html: admin-authored rich text from dashboard editor; sanitize at source if XSS becomes a concern -->
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="maan-prose"
            v-html="post.content"
          />
          <!-- eslint-enable vue/no-v-html -->

          <div
            class="mt-10 border-t pt-6"
            style="border-color: var(--maan-line);"
          >
            <MaanArticleShare
              :title="post.title"
              :url="`/ar/blog/${post.slug}`"
              locale="ar"
            />
          </div>

          <div class="mt-10">
            <MaanArticleAuthor locale="ar" />
          </div>

          <div class="mt-6">
            <MaanArticleCta locale="ar" />
          </div>
        </div>

        <aside class="space-y-6">
          <div
            v-if="related.length"
            class="maan-card"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wider"
              style="color: var(--maan-ink-muted);"
            >
              مقالات ذات صلة
            </p>
            <ul class="mt-4 space-y-4">
              <li
                v-for="item in related"
                :key="item.slug"
              >
                <NuxtLink
                  :to="`/ar/blog/${item.slug}`"
                  class="group block"
                >
                  <p
                    class="font-semibold leading-snug"
                    style="color: var(--maan-ink);"
                  >
                    {{ item.title }}
                  </p>
                  <p
                    class="mt-1 text-xs"
                    style="color: var(--maan-ink-muted);"
                  >
                    {{ item.readTime }}
                  </p>
                </NuxtLink>
              </li>
            </ul>
          </div>

          <NuxtLink
            to="/ar/blog"
            class="maan-ghost-btn w-full justify-center"
          >
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4"
            />
            <span>العودة إلى المرجع العلمي</span>
          </NuxtLink>
        </aside>
      </div>
    </UContainer>
  </article>
</template>
