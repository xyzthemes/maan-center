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

  if (path === '/contact') {
    return { en: '/contact', ar: '/ar/contact' }
  }

  if (path === '/ar/contact') {
    return { en: '/contact', ar: '/ar/contact' }
  }

  if (path === '/dashboard') {
    return { en: '/dashboard', ar: '/ar/dashboard' }
  }

  if (path === '/ar/dashboard') {
    return { en: '/dashboard', ar: '/ar/dashboard' }
  }

  if (path === '/dashboard/login') {
    return { en: '/dashboard/login', ar: '/ar/dashboard/login' }
  }

  if (path === '/ar/dashboard/login') {
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
const switchLocale = (path: string) => {
  if (import.meta.client) {
    window.location.assign(path)
  }
}
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
    }, {
      label: 'تواصل معنا',
      to: '/ar/contact'
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
    }, {
      label: 'Contact',
      to: '/contact'
    }])

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
          :href="isArabic ? alternatePaths.en : alternatePaths.ar"
          color="neutral"
          variant="ghost"
          @click.prevent="switchLocale(isArabic ? alternatePaths.en : alternatePaths.ar)"
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
        <div class="flex max-w-md flex-col items-center gap-3 text-center sm:items-end sm:text-right">
          <a
            href="https://xyz.dev"
            target="_blank"
            rel="noopener noreferrer"
            class="maan-design-credit inline-flex items-center gap-2 text-xs font-medium text-muted transition hover:text-highlighted"
            aria-label="Website design by XYZ"
          >
            <span>Website design by</span>
            <img
              src="https://cdn.xyz.dev/assets/xyz/brand/logo/long/black.svg"
              alt="XYZ"
              class="h-4 w-auto"
            >
          </a>
          <p class="text-xs leading-5 text-dimmed">
            Hero image: Dan Hadani collection / National Library of Israel / The Pritzker Family National Photography Collection, CC BY 4.0.
          </p>
        </div>
      </template>
    </UFooter>
  </UApp>
</template>
