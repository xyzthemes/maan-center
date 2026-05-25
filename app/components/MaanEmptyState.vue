<script setup lang="ts">
// Friendly "nothing here yet" panel for fetched lists that are empty
// AND not filtered. The filtered-empty state is handled by the existing
// "no items match these filters" copy in each list view — this is for
// the genuinely-empty case (fresh DB, no submissions yet, etc.).

defineProps<{
  icon: string
  title: string
  description?: string
  ctaLabel?: string
  ctaTo?: string
  ctaIcon?: string
}>()
</script>

<template>
  <div
    class="maan-card flex flex-col items-center text-center"
    style="padding: 2.5rem 1.5rem;"
  >
    <div
      class="maan-card-icon"
      style="margin-bottom: 1rem; width: 3.5rem; height: 3.5rem;"
    >
      <UIcon
        :name="icon"
        class="size-6"
      />
    </div>
    <h3
      class="text-lg font-bold"
      :style="{ color: 'var(--maan-ink)' }"
    >
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="mt-2 max-w-md text-sm"
      :style="{ color: 'var(--maan-ink-muted)' }"
    >
      {{ description }}
    </p>
    <UButton
      v-if="ctaLabel && ctaTo"
      :to="ctaTo"
      :icon="ctaIcon || 'i-lucide-plus'"
      class="mt-5"
      color="primary"
    >
      {{ ctaLabel }}
    </UButton>
  </div>
</template>
