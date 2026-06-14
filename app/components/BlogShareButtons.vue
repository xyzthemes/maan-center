<script setup lang="ts">
// S14 — Social share row for the public blog article (EN + AR, RTL-safe).
// Locked platforms (blog-feedback.md): X, LinkedIn, Telegram, Pinterest via
// static share-intent URLs; Instagram has no web share intent → copy-link.
//
// The absolute post URL is derived SSR-safely from the runtime site origin via
// `useRequestURL()` (works on server AND client) — the domain is NOT hardcoded.
const props = defineProps<{
  /** Article title, used as the share text/description. */
  title: string
  /** Path or absolute URL of the post, e.g. `/blog/my-slug`. */
  url: string
  /** Optional absolute image URL for Pinterest's pinned media. */
  image?: string
  locale?: 'en' | 'ar'
}>()

const t = computed(() => props.locale === 'ar'
  ? { label: 'شارك المقال:', x: 'إكس', linkedin: 'لينكدإن', telegram: 'تيليجرام', pinterest: 'بينترست', instagram: 'إنستغرام', copy: 'نسخ الرابط', copied: 'تم نسخ الرابط!' }
  : { label: 'Share article:', x: 'X', linkedin: 'LinkedIn', telegram: 'Telegram', pinterest: 'Pinterest', instagram: 'Instagram', copy: 'Copy link', copied: 'Link copied!' })

// `useRequestURL()` is SSR-safe: on the server it reads the incoming request's
// origin, on the client it reads `window.location` — so the absolute URL is
// correct in both render passes without hardcoding the canonical domain.
const origin = useRequestURL().origin
const fullUrl = computed(() =>
  props.url.startsWith('http') ? props.url : new URL(props.url, origin).toString())

const encUrl = computed(() => encodeURIComponent(fullUrl.value))
const encTitle = computed(() => encodeURIComponent(props.title))
const encImage = computed(() => (props.image ? encodeURIComponent(props.image) : ''))

const xHref = computed(() => `https://twitter.com/intent/tweet?url=${encUrl.value}&text=${encTitle.value}`)
const linkedinHref = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl.value}`)
const telegramHref = computed(() => `https://t.me/share/url?url=${encUrl.value}&text=${encTitle.value}`)
const pinterestHref = computed(() => {
  const media = encImage.value ? `&media=${encImage.value}` : ''
  return `https://pinterest.com/pin/create/button/?url=${encUrl.value}${media}&description=${encTitle.value}`
})

type ShareLink = { key: string, href: string, icon: string, label: string, bg: string }
const links = computed<ShareLink[]>(() => [
  { key: 'x', href: xHref.value, icon: 'i-simple-icons-x', label: t.value.x, bg: '#000000' },
  { key: 'linkedin', href: linkedinHref.value, icon: 'i-simple-icons-linkedin', label: t.value.linkedin, bg: '#0A66C2' },
  { key: 'telegram', href: telegramHref.value, icon: 'i-simple-icons-telegram', label: t.value.telegram, bg: '#26A5E4' },
  { key: 'pinterest', href: pinterestHref.value, icon: 'i-simple-icons-pinterest', label: t.value.pinterest, bg: '#BD081C' }
])

// Instagram offers no web share intent → fall back to copying the post link.
// Clipboard is client-only — guarded so SSR never touches `navigator`.
const copied = ref(false)
const copyLink = async () => {
  if (!import.meta.client) return
  try {
    await navigator.clipboard.writeText(fullUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Clipboard API unavailable (insecure context / denied) — silent no-op.
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span
      class="text-sm font-medium"
      style="color: var(--maan-ink-muted);"
    >{{ t.label }}</span>
    <a
      v-for="link in links"
      :key="link.key"
      :href="link.href"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      :style="`background: ${link.bg}; --tw-ring-color: ${link.bg};`"
      :aria-label="`${t.label.replace(':', '')} ${link.label}`"
    >
      <UIcon
        :name="link.icon"
        class="size-4"
      />
      <span>{{ link.label }}</span>
    </a>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style="background: linear-gradient(45deg, #F58529, #DD2A7B, #8134AF); color: white; --tw-ring-color: #DD2A7B;"
      :aria-label="`${t.instagram} — ${copied ? t.copied : t.copy}`"
      @click="copyLink"
    >
      <UIcon
        :name="copied ? 'i-lucide-check' : 'i-simple-icons-instagram'"
        class="size-4"
      />
      <span>{{ copied ? t.copied : t.instagram }}</span>
    </button>
  </div>
</template>
