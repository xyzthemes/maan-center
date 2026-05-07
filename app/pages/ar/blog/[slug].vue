<script setup lang="ts">
const route = useRoute('/ar/blog/[slug]')
const { getPostBySlug } = useMaanContent()
const slug = computed(() => String(route.params.slug || ''))

const { data: post } = await useAsyncData<MaanPost | undefined>(`maan-blog-ar-${slug.value}`, () => getPostBySlug(slug.value, 'ar'))

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'المقال غير موجود'
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
    author: {
      name: 'مركز معا للتعليم الخاص'
    }
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'المدونة', item: '/ar/blog' },
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
              locale="ar"
            />
            <span aria-hidden="true">·</span>
            <span>{{ post.readTime }}</span>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div class="maan-prose-card mx-auto max-w-3xl">
        <div
          class="maan-prose"
          v-html="post.content"
        />

        <div class="mt-12 border-t border-default pt-8">
          <UButton
            to="/ar/blog"
            color="neutral"
            variant="subtle"
            icon="i-lucide-arrow-right"
          >
            العودة إلى المدونة
          </UButton>
        </div>
      </div>
    </UContainer>
  </article>
</template>
