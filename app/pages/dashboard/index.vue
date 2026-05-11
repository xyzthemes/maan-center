<script setup lang="ts">
definePageMeta({
  alias: ['/ar/dashboard'],
  layout: false
})

const route = useRoute()
const target = route.path.startsWith('/ar') ? '/ar/dashboard/posts' : '/dashboard/posts'

await navigateTo(target, { replace: true })
</script>

<template>
  <div />
</template>
