<script setup lang="ts">
const route = useRoute('/blog/[slug]')
const { getPostBySlug, getPosts } = useMaanContent()
const slug = computed(() => String(route.params.slug || ''))

const { data: post } = await useAsyncData<MaanPost | undefined>(`maan-blog-${slug.value}`, () => getPostBySlug(slug.value, 'en'))

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
  <BlogArticleBody
    v-if="post"
    :post="post"
  >
    <template #body-footer>
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
    </template>

    <template #aside>
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
    </template>
  </BlogArticleBody>
</template>
