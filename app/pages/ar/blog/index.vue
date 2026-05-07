<script setup lang="ts">
const { getPageSeo, getPosts } = useMaanContent()

const { data: posts } = await useAsyncData<MaanPost[]>('maan-blog-posts-ar', () => getPosts('ar'), {
  default: () => []
})
const { data: pageSeo } = await useAsyncData<MaanSeo>('maan-page-seo-blog-ar', () => getPageSeo('/ar/blog', {
  title: 'المدونة',
  description: 'إرشادات أسرية وتحديثات وموارد عملية من مركز معا للتعليم الخاص.'
}))

const resolvedSeo = useMaanSeo({
  seo: pageSeo.value || undefined,
  fallback: {
    title: 'المدونة',
    description: 'إرشادات أسرية وتحديثات وموارد عملية من مركز معا للتعليم الخاص.'
  },
  ogFallback: {
    title: 'إرشادات عملية للأسر والمعلمين.',
    description: 'مقالات حول خطط التعلم والدعم العلاجي والروتين المنزلي والتعليم الدامج.',
    eyebrow: 'مدونة معا',
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
      { name: 'المدونة', item: '/ar/blog' }
    ]
  })
])
</script>

<template>
  <div class="maan-page">
    <section class="maan-blog-hero border-b border-default">
      <UContainer class="py-16 sm:py-20">
        <div class="max-w-3xl">
          <UBadge
            color="primary"
            variant="subtle"
            class="mb-5"
          >
            مدونة معا
          </UBadge>
          <h1 class="maan-hero-title text-4xl font-semibold text-highlighted sm:text-5xl">
            إرشادات عملية للأسر والمعلمين.
          </h1>
          <p class="maan-hero-copy mt-5 text-lg leading-8 text-muted">
            مقالات من فريق المركز حول خطط التعلم والدعم العلاجي والروتين المنزلي والتعليم الدامج.
          </p>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-14 sm:py-18">
      <div class="grid gap-6 md:grid-cols-3">
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
    </UContainer>
  </div>
</template>
