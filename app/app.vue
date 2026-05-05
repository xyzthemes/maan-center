<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const isArabic = computed(() => route.path.startsWith('/ar'))
const siteUrl = computed(() => String(config.public.siteUrl || 'http://127.0.0.1:3000').replace(/\/$/, ''))
const canonicalPath = computed(() => route.path.replace(/\/$/, '') || '/')
const pageUrl = computed(() => `${siteUrl.value}${canonicalPath.value}`)
const alternatePaths = computed(() => {
  const path = canonicalPath.value

  if (path === '/') {
    return { en: '/', ar: '/ar' }
  }

  if (path === '/ar') {
    return { en: '/', ar: '/ar' }
  }

  if (path === '/blog') {
    return { en: '/blog', ar: '/ar/blog' }
  }

  if (path === '/ar/blog') {
    return { en: '/blog', ar: '/ar/blog' }
  }

  if (path.startsWith('/blog/')) {
    const slug = path.split('/').pop()

    return { en: path, ar: `/ar/blog/ar-${slug}` }
  }

  if (path.startsWith('/ar/blog/ar-')) {
    const slug = path.split('/').pop()?.replace(/^ar-/, '')

    return { en: `/blog/${slug}`, ar: path }
  }

  return { en: '/', ar: '/ar' }
})
const navigation = computed(() => isArabic.value
  ? [{
      label: 'الرئيسية',
      to: '/ar'
    }, {
      label: 'البرامج',
      to: '/ar#programs'
    }, {
      label: 'المدونة',
      to: '/ar/blog'
    }]
  : [{
      label: 'Home',
      to: '/'
    }, {
      label: 'Programs',
      to: '/#programs'
    }, {
      label: 'Blog',
      to: '/blog'
    }])

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'canonical', href: () => pageUrl.value },
    { rel: 'alternate', hreflang: 'en', href: () => `${siteUrl.value}${alternatePaths.value.en}` },
    { rel: 'alternate', hreflang: 'ar', href: () => `${siteUrl.value}${alternatePaths.value.ar}` },
    { rel: 'alternate', hreflang: 'x-default', href: () => `${siteUrl.value}${alternatePaths.value.en}` }
  ],
  htmlAttrs: {
    lang: () => isArabic.value ? 'ar' : 'en',
    dir: () => isArabic.value ? 'rtl' : 'ltr'
  }
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
  <UApp>
    <UHeader class="maan-header">
      <template #left>
        <NuxtLink
          to="/"
          aria-label="Maan Special Education Center home"
        >
          <AppLogo class="w-auto h-9 shrink-0" />
        </NuxtLink>
      </template>

      <UNavigationMenu
        :items="navigation"
        variant="link"
        class="hidden md:flex"
      />

      <template #right>
        <UColorModeButton />
        <UButton
          to="mailto:info@maan-center.example"
          icon="i-lucide-mail"
          color="neutral"
          variant="subtle"
          class="hidden sm:inline-flex"
        >
          {{ isArabic ? 'تواصل معنا' : 'Contact' }}
        </UButton>
        <UButton
          :to="isArabic ? '/' : '/ar'"
          color="neutral"
          variant="ghost"
        >
          {{ isArabic ? 'EN' : 'عربي' }}
        </UButton>
      </template>
    </UHeader>

    <UMain class="maan-main">
      <NuxtPage />
    </UMain>

    <UFooter class="maan-footer">
      <template #left>
        <p class="text-sm text-muted">
          © {{ new Date().getFullYear() }} Maan Special Education Center
        </p>
      </template>

      <template #right>
        <p class="max-w-md text-right text-xs leading-5 text-dimmed">
          Hero image: Dan Hadani collection / National Library of Israel / The Pritzker Family National Photography Collection, CC BY 4.0.
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
