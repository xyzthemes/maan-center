<script setup lang="ts">
type LogoVariant = 'horizontal' | 'mark'

const props = withDefaults(defineProps<{
  variant?: LogoVariant
  showWordmark?: boolean
  size?: 'sm' | 'md' | 'lg'
  locale?: 'en' | 'ar'
}>(), {
  variant: 'horizontal',
  showWordmark: true,
  size: 'md',
  locale: 'en'
})

const dims = computed(() => {
  switch (props.size) {
    case 'sm': return { box: 'h-9 w-9', wordmark: 'text-sm', sub: 'text-[10px]' }
    case 'lg': return { box: 'h-14 w-14', wordmark: 'text-xl', sub: 'text-sm' }
    default: return { box: 'h-11 w-11', wordmark: 'text-base', sub: 'text-xs' }
  }
})

const wordmarkPrimary = computed(() => props.locale === 'ar' ? 'مركز معاً' : 'Maan')
const wordmarkSecondary = computed(() => props.locale === 'ar' ? 'للتربية الخاصة' : 'Special Education Center')

// TODO_IMPLEMENTATION_REFERENCES: Replace `/logo-transparent.png` with the
// final SVG asset when one becomes available — keep the same filename
// `/logo.svg` so this component can swap to <UIcon name="…"> or inline SVG
// without further wiring changes.
const logoSrc = '/logo-transparent.png'
</script>

<template>
  <div class="flex items-center gap-3">
    <img
      :src="logoSrc"
      :alt="locale === 'ar' ? 'مركز معاً للتربية الخاصة' : 'Maan Special Education Center logo'"
      :class="['shrink-0 object-contain', dims.box]"
      width="56"
      height="56"
      loading="eager"
      decoding="async"
    >
    <div
      v-if="showWordmark && variant === 'horizontal'"
      class="leading-tight"
      :dir="locale === 'ar' ? 'rtl' : 'ltr'"
    >
      <p
        :class="['font-bold tracking-tight', dims.wordmark]"
        style="color: var(--maan-ink);"
      >
        {{ wordmarkPrimary }}
      </p>
      <p
        :class="['font-medium opacity-70', dims.sub]"
        style="color: var(--maan-ink-muted);"
      >
        {{ wordmarkSecondary }}
      </p>
    </div>
  </div>
</template>

<style scoped>
:global(.dark) p { color: #E5EEF8 !important; }
:global(.dark) p:nth-child(2) { color: #B8CADC !important; }
</style>
