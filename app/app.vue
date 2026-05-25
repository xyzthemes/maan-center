<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const isArabic = computed(() => route.path.startsWith('/ar'))
const siteUrl = computed(() => String(config.public.siteUrl || 'http://127.0.0.1:3000').replace(/\/$/, ''))
const canonicalPath = computed(() => route.path.replace(/\/$/, '') || '/')
const pageUrl = computed(() => `${siteUrl.value}${canonicalPath.value}`)

const gaId = String(config.public.gaMeasurementId || '').trim()
const gscToken = String(config.public.gscVerification || '').trim()

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

  if (path.startsWith('/programs/')) {
    return { en: path, ar: `/ar${path}` }
  }

  if (path.startsWith('/ar/programs/')) {
    return { en: path.replace(/^\/ar/, ''), ar: path }
  }

  if (path === '/about-us' || path === '/ar/about-us') {
    return { en: '/about-us', ar: '/ar/about-us' }
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
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#FAF8F4', media: '(prefers-color-scheme: light)' },
    { name: 'theme-color', content: '#0B1623', media: '(prefers-color-scheme: dark)' },
    // Google Search Console verification — only emitted when set.
    ...(gscToken ? [{ name: 'google-site-verification', content: gscToken }] : [])
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { key: 'canonical', rel: 'canonical', href: pageUrl.value },
    { rel: 'alternate', hreflang: 'en', href: `${siteUrl.value}${alternatePaths.value.en}` },
    { rel: 'alternate', hreflang: 'ar', href: `${siteUrl.value}${alternatePaths.value.ar}` },
    { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl.value}${alternatePaths.value.en}` },
    // Arabic-first webfont. Tajawal + Cairo for fallback breadth.
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Cairo:wght@400;600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap'
    }
  ],
  // GA4 — only emit when the measurement ID is configured. No tag, no
  // tracking. The TODO_IMPLEMENTATION_REFERENCES file lists this as pending.
  script: gaId
    ? [
        { src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`, async: true },
        {
          children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaId}', { anonymize_ip: true });`
        }
      ]
    : [],
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

// LocalBusiness schema. Working hours + map link confirmed by the client and
// emitted as structured data. Exact street address, geo coordinates, and
// social profile URLs are still pending (see TODO_IMPLEMENTATION_REFERENCES.md).
// Schedule (Bahrain time):
//   Sun–Thu: 08:00–12:00 and 16:00–20:00
//   Fri: closed
//   Sat: 09:00–13:00
useSchemaOrg([
  defineLocalBusiness({
    name: 'Maan Special Education Center',
    alternateName: 'مركز معاً للتربية الخاصة',
    url: () => siteUrl.value,
    logo: () => `${siteUrl.value}/logo-transparent.png`,
    image: () => `${siteUrl.value}/logo-transparent.png`,
    description: 'Individualized education, therapy, and family support for children with autism spectrum disorder, Down syndrome, and learning difficulties.',
    telephone: '+97332055666',
    hasMap: 'https://maps.app.goo.gl/GNB7VK94az3Wcrrq8',
    address: {
      '@type': 'PostalAddress',
      'addressCountry': 'BH',
      'addressRegion': 'Kingdom of Bahrain'
      // TODO_IMPLEMENTATION_REFERENCES: streetAddress, postalCode, addressLocality.
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        'opens': '08:00',
        'closes': '12:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        'opens': '16:00',
        'closes': '20:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': 'Saturday',
        'opens': '09:00',
        'closes': '13:00'
      }
      // Friday is closed — Schema.org convention is to omit it entirely.
    ]
    // TODO_IMPLEMENTATION_REFERENCES: geo (latitude, longitude),
    // sameAs[] for social profiles.
  }),
  // Educational organization profile sits alongside LocalBusiness — Google
  // happily indexes both for a service-oriented center.
  defineOrganization({
    name: 'Maan Special Education Center',
    url: () => siteUrl.value,
    logo: () => `${siteUrl.value}/logo-transparent.png`,
    description: 'Special education center supporting children with autism spectrum disorder, Down syndrome, and learning difficulties in Bahrain.'
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
