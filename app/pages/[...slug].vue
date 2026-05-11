<script setup lang="ts">
const route = useRoute()
const permalink = computed(() => {
  const path = route.path.replace(/\/$/, '') || '/'

  return path
})

const isArabic = computed(() => permalink.value.startsWith('/ar'))

const { data } = await useFetch('/api/pages/by-permalink', {
  query: { permalink },
  key: () => `cms-page-${permalink.value}`
})

if (!data.value?.page) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

const page = computed(() => data.value!.page!)

const formattedDate = computed(() => {
  if (!page.value.publishedAt) {
    return ''
  }

  return new Date(page.value.publishedAt).toLocaleDateString(isArabic.value ? 'ar-BH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

useSeoMeta({
  title: () => page.value.seo.title || page.value.title,
  description: () => page.value.seo.metaDescription
})
</script>

<template>
  <UContainer class="py-12 md:py-16">
    <article class="maan-prose-card mx-auto max-w-3xl">
      <header class="mb-8">
        <h1 class="text-3xl font-semibold text-highlighted sm:text-4xl">
          {{ page.title }}
        </h1>
        <p
          v-if="formattedDate"
          class="mt-3 text-sm text-muted"
        >
          {{ formattedDate }}
        </p>
      </header>

      <div
        v-if="page.content"
        class="maan-prose"
        v-html="page.content"
      />
      <p
        v-else
        class="text-sm text-muted"
      >
        {{ isArabic ? 'سيتم نشر محتوى هذه الصفحة قريبًا.' : 'This page is being prepared.' }}
      </p>
    </article>
  </UContainer>
</template>
