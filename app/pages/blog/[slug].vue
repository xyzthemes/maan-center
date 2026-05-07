<script setup lang="ts">
const route = useRoute('/blog/[slug]')
const { getPostBySlug } = useMaanContent()
const slug = computed(() => String(route.params.slug || ''))

const { data: post } = await useAsyncData<MaanPost | undefined>(`maan-blog-${slug.value}`, () => getPostBySlug(slug.value))

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post not found'
  })
}

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
    author: {
      name: 'Maan Special Education Center'
    }
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Blog', item: '/blog' },
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
    <section class="maan-blog-hero border-b border-default">
      <UContainer class="py-14 sm:py-20">
        <div class="max-w-3xl">
          <UBadge
            color="primary"
            variant="subtle"
            class="mb-5"
          >
            {{ post.category }}
          </UBadge>
          <h1 class="maan-hero-title text-4xl font-semibold text-highlighted sm:text-5xl">
            {{ post.title }}
          </h1>
          <p class="maan-hero-copy mt-5 text-lg leading-8 text-muted">
            {{ post.description }}
          </p>
          <div class="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted">
            <NuxtTime
              :datetime="post.publishedAt"
              month="long"
              day="numeric"
              year="numeric"
            />
            <span aria-hidden="true">·</span>
            <span>{{ post.readTime }}</span>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div class="maan-prose-card mx-auto max-w-3xl">
        <img
          v-if="post.image"
          :src="post.image"
          :alt="post.title"
          class="mb-10 aspect-[16/9] w-full rounded-[2rem_2rem_1rem_2rem] object-cover"
        >
        <div
          class="maan-prose"
          v-html="post.content"
        />

        <div class="mt-12 border-t border-default pt-8">
          <UButton
            to="/blog"
            color="neutral"
            variant="subtle"
            icon="i-lucide-arrow-left"
          >
            Back to blog
          </UButton>
        </div>
      </div>
    </UContainer>
  </article>
</template>
