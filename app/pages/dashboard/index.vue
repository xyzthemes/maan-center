<script setup lang="ts">
definePageMeta({
  alias: ['/ar/dashboard'],
  layout: false
})

// /dashboard → /dashboard/overview (the redesigned landing page).
//
// `@onmax/nuxt-better-auth` honours the global `auth.redirects.guest`
// from nuxt.config.ts which is hardcoded to `/dashboard` (English) — so
// after sign-in, an Arabic-side visitor would normally land here at
// `/dashboard` with no `/ar` in route.path, losing their locale.
//
// We recover the user's locale from the `maan-locale` cookie (set by
// switchLocale() in the public layout) and route to the matching
// overview page so they stay in the language they chose.
const route = useRoute()
const localeCookie = useCookie<'ar' | 'en' | null>('maan-locale')
const isAr = route.path.startsWith('/ar') || localeCookie.value === 'ar'
const target = isAr ? '/ar/dashboard/overview' : '/dashboard/overview'

await navigateTo(target, { replace: true })
</script>

<template>
  <div />
</template>
