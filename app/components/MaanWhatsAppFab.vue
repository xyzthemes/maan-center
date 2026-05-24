<script setup lang="ts">
// Floating WhatsApp widget — always visible, one-thumb reachable.
// WhatsApp number provided by client.
const props = withDefaults(defineProps<{
  phone?: string
  message?: string
  locale?: 'en' | 'ar'
}>(), {
  phone: '+97332055666',
  message: 'أود استشارة بخصوص طفلي',
  locale: 'ar'
})

const href = computed(() => {
  const cleanPhone = props.phone.replace(/[^\d+]/g, '').replace(/^\+/, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(props.message)}`
})

const label = computed(() => props.locale === 'ar' ? 'واتساب' : 'WhatsApp')
const aria = computed(() => props.locale === 'ar'
  ? 'تواصل مع مركز معاً عبر واتساب'
  : 'Contact Maan center via WhatsApp')
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="maan-whatsapp-fab"
    :aria-label="aria"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      class="size-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.93.5 3.77 1.45 5.39L2 22l4.86-1.55a9.93 9.93 0 0 0 5.18 1.43h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0 0 12.04 2Zm0 1.66c2.21 0 4.28.86 5.84 2.42a8.24 8.24 0 0 1 2.42 5.83c0 4.54-3.71 8.25-8.26 8.25-1.5 0-2.97-.41-4.25-1.17l-.3-.18-2.88.92.93-2.81-.2-.32a8.21 8.21 0 0 1-1.27-4.39c0-4.54 3.71-8.25 8.25-8.25h.72Zm4.62 9.96c-.25-.12-1.5-.74-1.73-.83-.23-.08-.4-.13-.57.12-.17.25-.66.83-.81 1-.15.17-.3.19-.55.06-.25-.12-1.07-.4-2.03-1.26a7.62 7.62 0 0 1-1.41-1.75c-.15-.25-.02-.39.11-.51.12-.11.25-.3.37-.45.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.12-.57-1.38-.78-1.88-.2-.49-.41-.43-.57-.43h-.49c-.17 0-.45.06-.69.31-.23.25-.9.88-.9 2.15s.93 2.49 1.06 2.67c.12.17 1.83 2.8 4.44 3.93.62.27 1.1.43 1.48.55.62.2 1.18.17 1.62.1.5-.07 1.5-.61 1.71-1.21.21-.6.21-1.11.15-1.22-.06-.1-.23-.17-.47-.29Z" />
    </svg>
    <span class="hidden sm:inline">{{ label }}</span>
  </a>
</template>
