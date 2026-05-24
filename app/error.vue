<script setup lang="ts">
// Nuxt 4 error page — auto-rendered on 404 and 500.
// Locale-aware: looks at the URL path to pick Arabic vs English copy.

const props = defineProps<{
  error: { statusCode: number, statusMessage?: string, url?: string }
}>()

const isArabic = computed(() => {
  if (import.meta.client) return window.location.pathname.startsWith('/ar')
  return (props.error?.url || '').startsWith('/ar')
})

const t = computed(() => isArabic.value
  ? {
      title: props.error.statusCode === 404 ? 'الصفحة غير موجودة' : 'حدث خطأ غير متوقع',
      lead: props.error.statusCode === 404
        ? 'يبدو أن الصفحة التي تبحثون عنها انتقلت أو لم تعد متاحة. اختاروا وجهة من الأسفل.'
        : 'فريق المركز تم إخطاره. جربوا تحديث الصفحة أو ابدأوا من نقطة أخرى.',
      home: 'الرئيسية',
      whatsapp: 'دردشة واتساب',
      scientific: 'المرجع العلمي',
      back: 'العودة للصفحة السابقة'
    }
  : {
      title: props.error.statusCode === 404 ? 'Page not found' : 'Something went wrong',
      lead: props.error.statusCode === 404
        ? 'The page you’re looking for may have moved or is no longer available. Pick a destination below.'
        : 'Our team has been notified. Try refreshing or start from another section.',
      home: 'Homepage',
      whatsapp: 'WhatsApp chat',
      scientific: 'Scientific Reference',
      back: 'Go back'
    })

const homeHref = computed(() => isArabic.value ? '/ar' : '/')
const blogHref = computed(() => isArabic.value ? '/ar/blog' : '/blog')
const whatsappHref = computed(() => isArabic.value
  ? 'https://wa.me/97332055666?text=' + encodeURIComponent('أود استشارة بخصوص طفلي')
  : 'https://wa.me/97332055666?text=' + encodeURIComponent('I would like a consultation about my child')
)

const handleClearError = () => clearError({ redirect: homeHref.value })

useHead({
  htmlAttrs: {
    lang: isArabic.value ? 'ar' : 'en',
    dir: isArabic.value ? 'rtl' : 'ltr'
  }
})
</script>

<template>
  <div
    class="grid min-h-screen place-items-center px-6"
    style="background: var(--maan-surface); color: var(--maan-ink);"
  >
    <div class="mx-auto max-w-2xl text-center">
      <p
        class="text-8xl font-bold tracking-tight"
        style="color: var(--maan-autism); opacity: 0.4;"
      >
        {{ error.statusCode }}
      </p>
      <h1 class="maan-hero-title mt-4 text-3xl font-bold sm:text-4xl">
        {{ t.title }}
      </h1>
      <p
        class="mx-auto mt-4 max-w-md text-base"
        style="color: var(--maan-ink-muted);"
      >
        {{ t.lead }}
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          class="maan-cta-btn"
          @click="handleClearError"
        >
          <UIcon
            name="i-lucide-home"
            class="size-5"
          />
          <span>{{ t.home }}</span>
        </button>
        <a
          :href="whatsappHref"
          target="_blank"
          rel="noopener noreferrer"
          class="maan-ghost-btn"
        >
          <UIcon
            name="i-lucide-message-circle"
            class="size-5"
          />
          <span>{{ t.whatsapp }}</span>
        </a>
        <NuxtLink
          :to="blogHref"
          class="maan-ghost-btn"
        >
          <UIcon
            name="i-lucide-book-open"
            class="size-5"
          />
          <span>{{ t.scientific }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
