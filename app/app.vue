<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const isArabic = computed(() => route.path.startsWith('/ar'))
const siteUrl = computed(() => String(config.public.siteUrl || 'http://127.0.0.1:3000').replace(/\/$/, ''))
const canonicalPath = computed(() => route.path.replace(/\/$/, '') || '/')
const pageUrl = computed(() => `${siteUrl.value}${canonicalPath.value}`)

updateSiteConfig({
  currentLocale: () => isArabic.value ? 'ar' : 'en'
})

const alternatePaths = computed(() => {
  const path = canonicalPath.value
  const withoutArPrefix = path.replace(/^\/ar(?=\/|$)/, '') || '/'

  if (path === '/' || path === '/ar') {
    return { en: '/', ar: '/ar' }
  }

  if (path === '/blog' || path === '/ar/blog') {
    return { en: '/blog', ar: '/ar/blog' }
  }

  if (path === '/contact' || path === '/ar/contact') {
    return { en: '/contact', ar: '/ar/contact' }
  }

  if (path === '/dashboard' || path === '/ar/dashboard') {
    return { en: '/dashboard', ar: '/ar/dashboard' }
  }

  if (path === '/dashboard/login' || path === '/ar/dashboard/login') {
    return { en: '/dashboard/login', ar: '/ar/dashboard/login' }
  }

  if (path.startsWith('/blog/')) {
    const slug = path.split('/').pop()

    return { en: path, ar: `/ar/blog/ar-${slug}` }
  }

  if (path.startsWith('/ar/blog/ar-')) {
    const slug = path.split('/').pop()?.replace(/^ar-/, '')

    return { en: `/blog/${slug}`, ar: path }
  }

  return {
    en: withoutArPrefix,
    ar: path.startsWith('/ar') ? path : `/ar${path}`
  }
})

useHead(() => ({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { key: 'canonical', rel: 'canonical', href: pageUrl.value },
    { rel: 'alternate', hreflang: 'en', href: `${siteUrl.value}${alternatePaths.value.en}` },
    { rel: 'alternate', hreflang: 'ar', href: `${siteUrl.value}${alternatePaths.value.ar}` },
    { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl.value}${alternatePaths.value.en}` }
  ],
  htmlAttrs: {
    lang: isArabic.value ? 'ar' : 'en',
    dir: isArabic.value ? 'rtl' : 'ltr'
  }
}), {
  tagPriority: 'critical'
})

useSeoMeta({
  titleTemplate: title => title && title !== 'Maan Special Education Center' && title !== 'مركز معا للتعليم الخاص'
    ? `${title} | ${isArabic.value ? 'مركز معا للتعليم الخاص' : 'Maan Special Education Center'}`
    : isArabic.value ? 'مركز معا للتعليم الخاص' : 'Maan Special Education Center',
  description: () => isArabic.value
    ? 'خطط تعليمية وعلاجية ودعم أسري للأطفال ذوي الاحتياجات التعليمية المتنوعة.'
    : 'Individualized education, therapy, and family support for children with diverse learning needs.',
  ogSiteName: 'Maan Special Education Center',
  ogType: 'website',
  ogUrl: () => pageUrl.value,
  twitterCard: 'summary_large_image'
})

useSchemaOrg([
  defineOrganization({
    name: 'Maan Special Education Center',
    url: () => siteUrl.value,
    logo: () => `${siteUrl.value}/favicon.ico`,
    description: 'Individualized education, therapy, and family support for children with diverse learning needs.'
  }),
  defineWebSite({
    name: 'Maan Special Education Center',
    url: () => siteUrl.value,
    inLanguage: ['en', 'ar']
  })
])
</script>

<template>
  <UApp :dir="isArabic ? 'rtl' : 'ltr'">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
