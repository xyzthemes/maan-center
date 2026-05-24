<script setup lang="ts">
defineProps<{
  items: Array<{ value: string, label: string }>
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
    <div
      v-for="item in items"
      :key="item.label"
      class="maan-stat"
    >
      <div class="maan-stat-num">
        {{ item.value }}
      </div>
      <div class="maan-stat-label">
        {{ item.label }}
      </div>
    </div>
  </div>
</template>
