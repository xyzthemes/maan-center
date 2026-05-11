<script setup lang="ts">
type NavPage = { id: string, title: string, permalink: string }

const route = useRoute()
const isArabic = computed(() => route.path.startsWith('/ar'))
const canonicalPath = computed(() => route.path.replace(/\/$/, '') || '/')

const { data: cmsPagesData } = await useFetch<{ pages: NavPage[] }>('/api/pages/navigation', {
  key: 'public-nav-pages',
  default: () => ({ pages: [] })
})
const cmsPages = computed(() => cmsPagesData.value?.pages || [])

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

const cmsNavItems = computed(() => {
  const isArabicLocale = isArabic.value

  return cmsPages.value
    .filter((page) => {
      const isArPage = page.permalink.startsWith('/ar')

      return isArabicLocale ? isArPage : !isArPage
    })
    .map(page => ({ label: page.title, to: page.permalink }))
})

const navigation = computed(() => {
  const staticItems = isArabic.value
    ? [
        { label: 'الرئيسية', to: '/ar' },
        { label: 'البرامج', to: '/ar#programs' },
        { label: 'المدونة', to: '/ar/blog' }
      ]
    : [
        { label: 'Home', to: '/' },
        { label: 'Programs', to: '/#programs' },
        { label: 'Blog', to: '/blog' }
      ]
  const contactItem = isArabic.value
    ? { label: 'تواصل معنا', to: '/ar/contact' }
    : { label: 'Contact', to: '/contact' }

  return [...staticItems, ...cmsNavItems.value, contactItem]
})
</script>

<template>
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
    <slot />
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
</template>
