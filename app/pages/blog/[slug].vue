<script setup lang="ts">
const route = useRoute('/blog/[slug]')
const { getPostBySlug, getPosts } = useMaanContent()
const slug = computed(() => String(route.params.slug || ''))

const { data: post } = await useAsyncData<MaanPost | undefined>(`maan-blog-${slug.value}`, () => getPostBySlug(slug.value))

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post not found'
  })
}

const { data: related } = await useAsyncData<MaanPost[]>(`maan-blog-${slug.value}-related`, async () => {
  const all = await getPosts('en')
  return all.filter(p => p.slug !== slug.value).slice(0, 3)
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
    locale: 'en'
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
    author: { name: 'Maan Special Education Center' }
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Scientific Reference', item: '/blog' },
      { name: post.value.title, item: `/blog/${post.value.slug}` }
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
          <img
            v-if="post.image"
            :src="post.image"
            :alt="post.title"
            class="mb-10 aspect-video w-full rounded-2xl object-cover"
          >
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
              :url="`/blog/${post.slug}`"
              locale="en"
            />
          </div>

          <div class="mt-10">
            <MaanArticleAuthor locale="en" />
          </div>

          <div class="mt-6">
            <MaanArticleCta locale="en" />
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
              Related articles
            </p>
            <ul class="mt-4 space-y-4">
              <li
                v-for="item in related"
                :key="item.slug"
              >
                <NuxtLink
                  :to="`/blog/${item.slug}`"
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
            to="/blog"
            class="maan-ghost-btn w-full justify-center"
          >
            <UIcon
              name="i-lucide-arrow-left"
              class="size-4"
            />
            <span>Back to Scientific Reference</span>
          </NuxtLink>
        </aside>
      </div>
    </UContainer>
  </article>
</template>
