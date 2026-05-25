<script setup lang="ts">
type NavPage = { id: string, title: string, permalink: string }
type NavItem = { label: string, to: string, children?: Array<{ label: string, to: string }> }

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

  if (path === '/connect' || path === '/ar/connect') {
    return { en: '/connect', ar: '/ar/connect' }
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

// Switching locale remembers the choice in a cookie so the server-side
// locale-default middleware doesn't keep auto-redirecting the user.
// The cookie lives for a year and is path-scoped to the whole site.
const switchLocale = (path: string) => {
  if (!import.meta.client) return
  const target = path.startsWith('/ar') ? 'ar' : 'en'
  document.cookie = `maan-locale=${target}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
  window.location.assign(path)
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
const navigation = computed<NavItem[]>(() => {
  const isAr = isArabic.value
  const staticItems: NavItem[] = isAr
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
const developedByLabel = computed(() => isArabic.value ? 'صمم بواسطة' : 'Developed by')

// Drawer copy. UHeader auto-renders its own hamburger + slideover below the
// `menu` breakpoint and exposes its content via the #body slot — no separate
// state to manage.
const drawerT = computed(() => isArabic.value
  ? { menu: 'القائمة' }
  : { menu: 'Menu' })
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
      <!--
        Always-visible CTA. Below sm the label collapses to icon-only so it
        fits on a 320px viewport next to the locale + theme + UHeader's
        built-in hamburger. From sm upward the full label shows.
      -->
      <NuxtLink
        :to="contactPath"
        class="maan-cta-btn maan-header-cta inline-flex"
        :aria-label="headerCtaLabel"
      >
        <UIcon
          name="i-lucide-calendar-check"
          class="size-4"
        />
        <span class="maan-header-cta-label">{{ headerCtaLabel }}</span>
      </NuxtLink>
      <UColorModeButton class="maan-tap-target" />
      <!--
        Language toggle as an icon. The button's accessible name uses the
        target language (so screen readers say "Switch to English" while
        the user is on the Arabic site) — this matches the
        always-visible-target-language convention used by Wikipedia/Twitter.
      -->
      <UButton
        :href="isArabic ? alternatePaths.en : alternatePaths.ar"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-languages"
        class="maan-tap-target"
        :aria-label="isArabic ? 'Switch to English' : 'التبديل إلى العربية'"
        :title="localeLabel"
        @click.prevent="switchLocale(isArabic ? alternatePaths.en : alternatePaths.ar)"
      />
      <!--
        Locale code inside the drawer (so users can see which language they
        are about to switch to without hover). Hidden inline on the header
        bar itself — keeps the bar compact.
      -->
      <span class="sr-only">{{ localeLabel }}</span>
      <!--
        UHeader auto-renders its own hamburger toggle below the `menu`
        breakpoint (lg by default) — we don't add our own here.
      -->
    </template>

    <!--
      Mobile drawer content. UHeader puts this inside a built-in slideover
      that opens via its auto-rendered hamburger. Closes on navigation
      automatically.
    -->
    <template #body>
      <nav
        class="grid gap-1"
        :aria-label="drawerT.menu"
      >
        <template
          v-for="item in navigation"
          :key="item.label"
        >
          <NuxtLink
            v-if="!item.children"
            :to="item.to"
            class="maan-mobile-link"
          >
            {{ item.label }}
          </NuxtLink>
          <details
            v-else
            class="maan-mobile-group"
          >
            <summary class="maan-mobile-link maan-mobile-link--group">
              {{ item.label }}
              <UIcon
                name="i-lucide-chevron-down"
                class="size-4 transition-transform"
              />
            </summary>
            <NuxtLink
              v-for="child in item.children"
              :key="child.to"
              :to="child.to"
              class="maan-mobile-link maan-mobile-link--child"
            >
              {{ child.label }}
            </NuxtLink>
          </details>
        </template>

        <!-- Quick actions inside the drawer -->
        <div class="mt-4 grid gap-2">
          <NuxtLink
            :to="contactPath"
            class="maan-cta-btn justify-center"
          >
            <UIcon
              name="i-lucide-calendar-check"
              class="size-5"
            />
            <span>{{ headerCtaLabel }}</span>
          </NuxtLink>
          <a
            href="https://wa.me/97332055666?text=%D8%A3%D9%88%D8%AF%20%D8%A7%D8%B3%D8%AA%D8%B4%D8%A7%D8%B1%D8%A9%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%B7%D9%81%D9%84%D9%8A"
            target="_blank"
            rel="noopener noreferrer"
            class="maan-ghost-btn justify-center"
          >
            <UIcon
              name="i-lucide-message-circle"
              class="size-5"
            />
            <span>{{ mobileWhatsLabel }}</span>
          </a>
        </div>
      </nav>
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
      <!--
        UFooter's #top slot renders outside the built-in UContainer, so we
        wrap it here ourselves. Without this, content slams into the
        viewport edges on mobile.

        `[&>*]:min-w-0` lets every grid track shrink below its intrinsic
        content width, preventing horizontal overflow from long phone/email
        runs or the working-hours `<dl>`.
      -->
      <UContainer class="py-12">
        <div class="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_1.1fr] *:min-w-0">
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
                  :to="isArabic ? '/ar/connect' : '/connect'"
                  class="hover:underline"
                  style="color: var(--maan-ink-muted);"
                >
                  {{ isArabic ? 'كل قنواتنا' : 'All our channels' }}
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
                <!-- TODO_IMPLEMENTATION_REFERENCES: streetAddress block. -->
                <a
                  href="https://maps.app.goo.gl/GNB7VK94az3Wcrrq8"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:underline"
                >{{ isArabic ? 'فتح الموقع على خرائط جوجل' : 'Open in Google Maps' }}</a>
              </li>
              <li
                class="flex items-start gap-2"
                style="color: var(--maan-ink-muted);"
              >
                <UIcon
                  name="i-lucide-clock"
                  class="size-4 mt-0.5"
                />
                <div>
                  <p
                    class="font-semibold"
                    style="color: var(--maan-ink);"
                  >
                    {{ isArabic ? 'ساعات العمل' : 'Working hours' }}
                  </p>
                  <!--
                  Two-column grid (day → hours). The `dd` cells get
                  `min-w-0` so long hour ranges can wrap instead of
                  pushing the whole footer column wider than its track.
                -->
                  <dl class="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs *:min-w-0">
                    <dt>{{ isArabic ? 'الأحد' : 'Sun' }}</dt>
                    <dd>8 AM – 12 PM · 4 – 8 PM</dd>
                    <dt>{{ isArabic ? 'الإثنين' : 'Mon' }}</dt>
                    <dd>8 AM – 12 PM · 4 – 8 PM</dd>
                    <dt>{{ isArabic ? 'الثلاثاء' : 'Tue' }}</dt>
                    <dd>8 AM – 12 PM · 4 – 8 PM</dd>
                    <dt>{{ isArabic ? 'الأربعاء' : 'Wed' }}</dt>
                    <dd>8 AM – 12 PM · 4 – 8 PM</dd>
                    <dt>{{ isArabic ? 'الخميس' : 'Thu' }}</dt>
                    <dd>8 AM – 12 PM · 4 – 8 PM</dd>
                    <dt>{{ isArabic ? 'الجمعة' : 'Fri' }}</dt>
                    <dd>{{ isArabic ? 'مغلق' : 'Closed' }}</dd>
                    <dt>{{ isArabic ? 'السبت' : 'Sat' }}</dt>
                    <dd>9 AM – 1 PM</dd>
                  </dl>
                </div>
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
      </UContainer>
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
          <span>{{ developedByLabel }}</span>
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
