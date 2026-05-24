<script setup lang="ts">
definePageMeta({
  alias: ['/ar/dashboard'],
  layout: false
})

// /dashboard → /dashboard/overview (the redesigned landing page).
const route = useRoute()
const target = route.path.startsWith('/ar') ? '/ar/dashboard/overview' : '/dashboard/overview'

await navigateTo(target, { replace: true })
</script>

<template>
  <div />
</template>
