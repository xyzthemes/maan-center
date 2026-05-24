<script setup lang="ts">
type Variant = 'autism' | 'down' | 'ld'

const props = defineProps<{
  variant: Variant
  title: string
  description: string
  icon: string
  to: string
  ctaLabel: string
  locale?: 'en' | 'ar'
}>()

const cardClass = computed(() => {
  switch (props.variant) {
    case 'down': return 'maan-card maan-card--down'
    case 'ld': return 'maan-card maan-card--ld'
    default: return 'maan-card maan-card--autism'
  }
})
const iconClass = computed(() => {
  switch (props.variant) {
    case 'down': return 'maan-card-icon maan-card-icon--down'
    case 'ld': return 'maan-card-icon maan-card-icon--ld'
    default: return 'maan-card-icon'
  }
})
const arrow = computed(() => props.locale === 'ar' ? 'i-lucide-arrow-left' : 'i-lucide-arrow-right')
</script>

<template>
  <NuxtLink
    :to="to"
    :class="[cardClass, 'group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2']"
    style="--tw-ring-color: var(--maan-autism);"
  >
    <div :class="iconClass">
      <UIcon
        :name="icon"
        class="size-6"
      />
    </div>
    <h3 class="maan-card-title">
      {{ title }}
    </h3>
    <p class="maan-card-body mt-2">
      {{ description }}
    </p>
    <div
      class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
      style="color: var(--maan-autism);"
    >
      <span>{{ ctaLabel }}</span>
      <UIcon
        :name="arrow"
        class="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
      />
    </div>
  </NuxtLink>
</template>
