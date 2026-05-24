<script setup lang="ts">
const props = defineProps<{
  title: string
  url: string
  locale?: 'en' | 'ar'
}>()

const t = computed(() => props.locale === 'ar'
  ? { label: 'شارك المقال:', whatsapp: 'واتساب', facebook: 'فيسبوك', copy: 'نسخ الرابط', copied: 'تم النسخ!' }
  : { label: 'Share article:', whatsapp: 'WhatsApp', facebook: 'Facebook', copy: 'Copy link', copied: 'Copied!' })

const fullUrl = computed(() => {
  if (props.url.startsWith('http')) return props.url
  if (import.meta.client) return new URL(props.url, window.location.origin).toString()
  return props.url
})

const whatsappHref = computed(() => `https://wa.me/?text=${encodeURIComponent(`${props.title}\n${fullUrl.value}`)}`)
const facebookHref = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl.value)}`)

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
    // Clipboard API unavailable — silently no-op; user can still use share buttons.
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
      :href="whatsappHref"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style="background: #25D366; color: white; --tw-ring-color: #25D366;"
      :aria-label="`Share on ${t.whatsapp}`"
    >
      <UIcon
        name="i-lucide-message-circle"
        class="size-4"
      />
      <span>{{ t.whatsapp }}</span>
    </a>
    <a
      :href="facebookHref"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style="background: #1877F2; color: white; --tw-ring-color: #1877F2;"
      :aria-label="`Share on ${t.facebook}`"
    >
      <UIcon
        name="i-simple-icons-facebook"
        class="size-4"
      />
      <span>{{ t.facebook }}</span>
    </a>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      :style="`background: var(--maan-surface-alt); color: var(--maan-ink); border: 1px solid var(--maan-line); --tw-ring-color: var(--maan-autism);`"
      :aria-label="t.copy"
      @click="copyLink"
    >
      <UIcon
        :name="copied ? 'i-lucide-check' : 'i-lucide-link'"
        class="size-4"
      />
      <span>{{ copied ? t.copied : t.copy }}</span>
    </button>
  </div>
</template>
