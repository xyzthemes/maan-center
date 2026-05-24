<script setup lang="ts">
// Testimonials never include child names or recognizable identifiers — per
// implementation rules. Source attribution is the parent role only.
defineProps<{
  items: Array<{ quote: string, attribution: string }>
}>()
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <figure
      v-for="item in items"
      :key="item.attribution"
      class="maan-card"
    >
      <UIcon
        name="i-lucide-quote"
        class="size-7"
        style="color: var(--maan-autism);"
      />
      <blockquote
        class="maan-card-body mt-3 italic"
        style="line-height: 1.85;"
      >
        {{ item.quote }}
      </blockquote>
      <figcaption
        class="mt-4 text-sm font-semibold"
        style="color: var(--maan-ink);"
      >
        — {{ item.attribution }}
      </figcaption>
    </figure>
  </div>
</template>
