<script setup lang="ts">
// Renders N skeleton cards shaped like the dashboard list cards so the
// swap from skeleton -> real content doesn't visually jump. The PARENT
// is responsible for the grid container — this component just renders
// the children. That keeps the skeleton compatible with any grid layout.
//
// Used by:
//   - dashboard list views (posts/blocks/pages/submissions)
//   - public homepage blog teasers
//   - public blog index

defineProps<{
  count?: number
}>()
</script>

<template>
  <template
    v-for="i in (count ?? 3)"
    :key="i"
  >
    <div
      class="maan-card"
      aria-hidden="true"
    >
      <div class="space-y-3">
        <USkeleton class="h-4 w-20 rounded-full" />
        <USkeleton class="h-5 w-3/4" />
        <USkeleton class="h-3 w-full" />
        <USkeleton class="h-3 w-5/6" />
        <div class="flex items-center gap-2 pt-2">
          <USkeleton class="h-3 w-16" />
          <USkeleton class="h-3 w-12" />
        </div>
      </div>
    </div>
  </template>
</template>
