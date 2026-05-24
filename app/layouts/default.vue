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

// Phase 2 renames "Blog" → "المرجع العلمي الشامل: دليل معًا للتمكين".
// The route itself stays `/blog` (and `/ar/blog`) so existing DB content and
// inbound links keep working — only the label changes.
const navigation = computed(() => {
  const isAr = isArabic.value
  const staticItems = isAr
    ? [
        { label: 'الرئيسية', to: '/ar' },
        { label: 'البرامج', to: '/ar#programs', children: [
          { label: 'اضطراب طيف التوحد', to: '/ar/programs/autism' },
          { label: 'متلازمة داون', to: '/ar/programs/down-syndrome' },
          { label: 'صعوبات التعلم', to: '/ar/programs/learning-difficulties' }
        ] },
        { label: 'عن المركز', to: '/ar/about-us' },
        { label: 'المرجع العلمي', to: '/ar/blog' }
      ]
    : [
        { label: 'Home', to: '/' },
        { label: 'Programs', to: '/#programs', children: [
          { label: 'Autism Spectrum', to: '/programs/autism' },
          { label: 'Down Syndrome', to: '/programs/down-syndrome' },
          { label: 'Learning Difficulties', to: '/programs/learning-difficulties' }
        ] },
        { label: 'About', to: '/about-us' },
        { label: 'Scientific Reference', to: '/blog' }
      ]
  const contactItem = isAr
    ? { label: 'تواصل معنا', to: '/ar/contact' }
    : { label: 'Contact', to: '/contact' }

  return [...staticItems, ...cmsNavItems.value, contactItem]
})

const headerCtaLabel = computed(() => isArabic.value ? 'احجز جلسة تقييم' : 'Book an Assessment')
const contactPath = computed(() => isArabic.value ? '/ar/contact' : '/contact')
const mobileCallLabel = computed(() => isArabic.value ? 'اتصل بنا' : 'Call us')
const mobileWhatsLabel = computed(() => isArabic.value ? 'واتساب' : 'WhatsApp')
const phoneHref = 'tel:+97332055666'
const localeLabel = computed(() => isArabic.value ? 'English' : 'عربي')
const developedByLabel = computed(() => isArabic.value ? 'Developed by' : 'صمم بواسطة')
</script>

<template>
  <UHeader
    class="maan-header"
    :ui="{
      container: 'max-w-7xl'
    }"
  >
    <template #left>
      <NuxtLink
        :to="isArabic ? '/ar' : '/'"
        :aria-label="isArabic ? 'مركز معاً للتربية الخاصة - الرئيسية' : 'Maan Special Education Center home'"
        class="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg"
        style="--tw-ring-color: var(--maan-autism);"
      >
        <AppLogo
          size="md"
          :locale="isArabic ? 'ar' : 'en'"
        />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="navigation"
      variant="link"
      class="hidden lg:flex"
    />

    <template #right>
      <NuxtLink
        :to="contactPath"
        class="maan-cta-btn hidden md:inline-flex"
        style="padding: 0.6rem 1rem; font-size: 0.9rem;"
      >
        <UIcon
          name="i-lucide-calendar-check"
          class="size-4"
        />
        <span>{{ headerCtaLabel }}</span>
      </NuxtLink>
      <UColorModeButton />
      <UButton
        :href="isArabic ? alternatePaths.en : alternatePaths.ar"
        color="neutral"
        variant="ghost"
        size="sm"
        @click.prevent="switchLocale(isArabic ? alternatePaths.en : alternatePaths.ar)"
      >
        {{ localeLabel }}
      </UButton>
    </template>
  </UHeader>

  <UMain class="maan-main">
    <slot />
  </UMain>

  <!-- Mobile sticky bottom bar — visible on small screens only. -->
  <nav
    class="maan-mobile-bar"
    :aria-label="isArabic ? 'إجراءات سريعة' : 'Quick actions'"
  >
    <a
      :href="phoneHref"
      class="maan-ghost-btn justify-center text-sm"
      :aria-label="isArabic ? 'اتصال هاتفي' : 'Call by phone'"
    >
      <UIcon
        name="i-lucide-phone"
        class="size-4"
      />
      <span>{{ mobileCallLabel }}</span>
    </a>
    <a
      href="https://wa.me/97332055666?text=%D8%A3%D9%88%D8%AF%20%D8%A7%D8%B3%D8%AA%D8%B4%D8%A7%D8%B1%D8%A9%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%B7%D9%81%D9%84%D9%8A"
      target="_blank"
      rel="noopener noreferrer"
      class="maan-cta-btn justify-center text-sm"
    >
      <UIcon
        name="i-lucide-message-circle"
        class="size-4"
      />
      <span>{{ mobileWhatsLabel }}</span>
    </a>
  </nav>

  <!-- Floating WhatsApp FAB — visible across all pages. -->
  <MaanWhatsAppFab :locale="isArabic ? 'ar' : 'en'" />

  <!-- Accessibility toolbar — sensory-friendly toggles persist across visits. -->
  <MaanA11yToolbar :locale="isArabic ? 'ar' : 'en'" />

  <!--
    Exit-intent popup — DISABLED until a real parent guide PDF is provided
    by the client. Once available, set `:enabled="true"` and pass the asset
    URL via `:guide-url`. See TODO_IMPLEMENTATION_REFERENCES.md.
  -->
  <MaanExitIntent
    :enabled="false"
    guide-url=""
    :locale="isArabic ? 'ar' : 'en'"
  />

  <UFooter class="maan-footer">
    <template #top>
      <div class="grid gap-10 py-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <AppLogo
            size="lg"
            :locale="isArabic ? 'ar' : 'en'"
          />
          <p
            class="mt-4 text-sm"
            style="color: var(--maan-ink-muted);"
          >
            {{ isArabic
              ? 'مركز معاً للتربية الخاصة — تقييم وخطط تعليمية فردية وجلسات علاجية للأطفال ذوي اضطراب طيف التوحد ومتلازمة داون وصعوبات التعلم.'
              : 'Maan Special Education Center — assessment, individualized plans, and therapy for children with autism spectrum disorder, Down syndrome, and learning difficulties.' }}
          </p>
        </div>

        <div>
          <h4
            class="text-sm font-bold uppercase tracking-wider"
            style="color: var(--maan-ink);"
          >
            {{ isArabic ? 'البرامج' : 'Programs' }}
          </h4>
          <ul class="mt-4 space-y-2 text-sm">
            <li>
              <NuxtLink
                :to="isArabic ? '/ar/programs/autism' : '/programs/autism'"
                class="hover:underline"
                style="color: var(--maan-ink-muted);"
              >
                {{ isArabic ? 'اضطراب طيف التوحد' : 'Autism Spectrum' }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="isArabic ? '/ar/programs/down-syndrome' : '/programs/down-syndrome'"
                class="hover:underline"
                style="color: var(--maan-ink-muted);"
              >
                {{ isArabic ? 'متلازمة داون' : 'Down Syndrome' }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="isArabic ? '/ar/programs/learning-difficulties' : '/programs/learning-difficulties'"
                class="hover:underline"
                style="color: var(--maan-ink-muted);"
              >
                {{ isArabic ? 'صعوبات التعلم' : 'Learning Difficulties' }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4
            class="text-sm font-bold uppercase tracking-wider"
            style="color: var(--maan-ink);"
          >
            {{ isArabic ? 'الموارد' : 'Resources' }}
          </h4>
          <ul class="mt-4 space-y-2 text-sm">
            <li>
              <NuxtLink
                :to="isArabic ? '/ar/about-us' : '/about-us'"
                class="hover:underline"
                style="color: var(--maan-ink-muted);"
              >
                {{ isArabic ? 'عن المركز' : 'About the center' }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="isArabic ? '/ar/blog' : '/blog'"
                class="hover:underline"
                style="color: var(--maan-ink-muted);"
              >
                {{ isArabic ? 'المرجع العلمي الشامل' : 'Scientific Reference' }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="isArabic ? '/ar/contact' : '/contact'"
                class="hover:underline"
                style="color: var(--maan-ink-muted);"
              >
                {{ isArabic ? 'تواصل معنا' : 'Contact Us' }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="isArabic ? '/ar#careers' : '/#careers'"
                class="hover:underline"
                style="color: var(--maan-ink-muted);"
              >
                {{ isArabic ? 'وظائف ومتطوعين' : 'Careers & Volunteers' }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4
            class="text-sm font-bold uppercase tracking-wider"
            style="color: var(--maan-ink);"
          >
            {{ isArabic ? 'تواصل' : 'Contact' }}
          </h4>
          <ul class="mt-4 space-y-2 text-sm">
            <li
              class="flex items-start gap-2"
              style="color: var(--maan-ink-muted);"
            >
              <UIcon
                name="i-lucide-phone"
                class="size-4 mt-0.5"
              />
              <a
                href="tel:+97332055666"
                class="hover:underline"
                dir="ltr"
              >+973 3205 5666</a>
            </li>
            <li
              class="flex items-start gap-2"
              style="color: var(--maan-ink-muted);"
            >
              <UIcon
                name="i-lucide-map-pin"
                class="size-4 mt-0.5"
              />
              <!-- TODO_IMPLEMENTATION_REFERENCES: confirm exact business address. -->
              <span>{{ isArabic ? 'مملكة البحرين' : 'Kingdom of Bahrain' }}</span>
            </li>
            <li
              class="flex items-start gap-2"
              style="color: var(--maan-ink-muted);"
            >
              <UIcon
                name="i-lucide-clock"
                class="size-4 mt-0.5"
              />
              <!-- TODO_IMPLEMENTATION_REFERENCES: confirm official working hours. -->
              <span>{{ isArabic ? 'ساعات العمل تُحدد قريباً' : 'Working hours: to be announced' }}</span>
            </li>
          </ul>
          <p
            class="mt-4 text-[11px]"
            style="color: var(--maan-ink-muted);"
          >
            {{ isArabic
              ? 'الترخيص والاعتمادات الرسمية ستُعرض هنا فور توفرها.'
              : 'License and official accreditations will be displayed here once provided.' }}
          </p>
          <!-- TODO_IMPLEMENTATION_REFERENCES: licenses & accreditations. -->
        </div>
      </div>
    </template>

    <template #left>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
        <p
          class="text-sm"
          style="color: var(--maan-ink-muted);"
        >
          © {{ new Date().getFullYear() }} {{ isArabic ? 'مركز معاً للتربية الخاصة' : 'Maan Special Education Center' }}
        </p>
        <span
          class="hidden sm:inline text-xs opacity-50"
          style="color: var(--maan-ink-muted);"
          aria-hidden="true"
        >·</span>
        <NuxtLink
          :to="isArabic ? '/ar/dashboard/login' : '/dashboard/login'"
          class="inline-flex items-center gap-1 text-xs font-medium opacity-70 transition hover:opacity-100"
          style="color: var(--maan-ink-muted);"
        >
          <UIcon
            name="i-lucide-lock"
            class="size-3"
          />
          <span>{{ isArabic ? 'دخول الفريق' : 'Staff sign in' }}</span>
        </NuxtLink>
      </div>
    </template>

    <template #right>
      <div class="flex max-w-md flex-col items-center gap-3 text-center sm:items-end sm:text-start">
        <a
          href="https://xyz.dev"
          target="_blank"
          rel="noopener noreferrer"
          class="maan-design-credit inline-flex items-center gap-2 text-sm font-medium transition hover:opacity-80"
          style="color: var(--maan-ink-muted);"
          aria-label="Website developed by XYZ"
        >
          <span>{{ isArabic ? 'صمم بواسطة' : 'Developed By' }}</span>
          <img
            src="https://cdn.xyz.dev/assets/xyz/brand/logo/long/black.svg"
            alt="XYZ"
            class="h-6 w-auto"
          >
        </a>
      </div>
    </template>
  </UFooter>
</template>
