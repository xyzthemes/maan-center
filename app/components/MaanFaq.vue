<script setup lang="ts">
defineProps<{
  items: Array<{ q: string, a: string }>
}>()
</script>

<template>
  <div role="list">
    <details
      v-for="item in items"
      :key="item.q"
      class="maan-faq-item"
      role="listitem"
    >
      <summary class="maan-faq-summary">
        {{ item.q }}
      </summary>
      <p class="maan-faq-body">
        {{ item.a }}
      </p>
    </details>
  </div>
</template>
