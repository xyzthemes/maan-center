<script setup lang="ts">
const route = useRoute()
const permalink = computed(() => {
  const path = route.path.replace(/\/$/, '') || '/'

  return path
})

const isArabic = computed(() => permalink.value.startsWith('/ar'))

// Defensive: the catch-all should never burn a DB query on requests that are
// obviously not a CMS page — asset-shaped paths (file extensions), well-known
// crawler probes, or browser-internal paths like /sw.js, /favicon.ico,
// /apple-touch-icon.png. Return 404 silently *without* `fatal: true` so the
// dev console isn't spammed with stack traces for stale-service-worker pings
// and bot probes.
const ASSET_EXT_RE = /\.[a-z0-9]{2,5}$/i
const SKIP_PREFIXES = ['/.well-known/', '/_nuxt/', '/__nuxt', '/__sitemap__/']
const skipLookup = computed(() =>
  ASSET_EXT_RE.test(permalink.value)
  || SKIP_PREFIXES.some(p => permalink.value.startsWith(p))
)

if (skipLookup.value) {
  throw createError({ statusCode: 404, statusMessage: 'Not found' })
}

const { data } = await useFetch('/api/pages/by-permalink', {
  query: { permalink },
  key: () => `cms-page-${permalink.value}`
})

if (!data.value?.page) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found'
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

const eyebrow = computed(() => {
  // Friendly eyebrow label derived from the permalink so the page header
  // looks structured without the editor having to enter it manually.
  const segments = permalink.value.split('/').filter(Boolean).filter(s => s !== 'ar')
  if (segments.length === 0) return isArabic.value ? 'صفحة' : 'Page'
  return segments[segments.length - 1]!.replace(/-/g, ' ')
})

useSeoMeta({
  title: () => page.value.seo.title || page.value.title,
  description: () => page.value.seo.metaDescription
})

useSchemaOrg([
  defineWebPage({
    name: () => page.value.title,
    description: () => page.value.seo?.metaDescription,
    inLanguage: isArabic.value ? 'ar' : 'en'
  })
])
</script>

<template>
  <div class="maan-page">
    <!-- HERO -->
    <section class="maan-hero border-b">
      <UContainer class="py-14 sm:py-20">
        <div class="mx-auto max-w-3xl text-center">
          <span class="maan-eyebrow capitalize">
            {{ eyebrow }}
          </span>
          <h1 class="maan-hero-title mt-5 text-4xl font-bold sm:text-5xl">
            {{ page.title }}
          </h1>
          <p
            v-if="formattedDate"
            class="mt-4 text-sm"
            style="color: var(--maan-ink-muted);"
          >
            <UIcon
              name="i-lucide-calendar"
              class="size-4 inline -translate-y-0.5"
            />
            {{ formattedDate }}
          </p>
        </div>
      </UContainer>
    </section>

    <!-- BODY -->
    <UContainer class="py-12 sm:py-16">
      <article class="maan-prose-card mx-auto max-w-3xl">
        <div
          v-if="page.content"
          class="maan-prose"
          v-html="page.content"
        />
        <p
          v-else
          class="text-sm"
          style="color: var(--maan-ink-muted);"
        >
          {{ isArabic ? 'سيتم نشر محتوى هذه الصفحة قريباً.' : 'This page is being prepared.' }}
        </p>
      </article>

      <!-- Inline CTA at the bottom of every CMS page. -->
      <div class="mx-auto mt-10 max-w-3xl">
        <MaanInlineCta :locale="isArabic ? 'ar' : 'en'" />
      </div>
    </UContainer>
  </div>
</template>
