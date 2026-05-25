// Universal plugin — fetches the admin-edited `theme` SiteSetting once
// per request and injects a `<style>` block into `<head>` via useHead.
//
// Why a plugin (and not a composable wired into app.vue):
//   • Runs during SSR, so the style block ships in the initial HTML —
//     no FOUC. Setting `document.documentElement.style.setProperty` on
//     client mount would flash compiled defaults first.
//   • Single fetch per request, deduped by useFetch key.
//
// Why `useHead` with both :root and .dark blocks (vs swapping styles on
// colorMode change): @nuxt/color-mode toggles `.dark` on <html>, so a
// single stylesheet covering both rules works for free. No JS watcher.

import { buildThemeCss } from '~/utils/theme-css'
import type { ThemeValue } from '~/utils/theme-defaults'

type SettingsResponse = {
  settings: Record<string, { key: string, locale: string, value: unknown } | null>
}

export default defineNuxtPlugin(async () => {
  // useFetch caches across SSR → client hydration via its `key`. No
  // double-fetch on hydration.
  const { data } = await useFetch<SettingsResponse>('/api/public/settings', {
    query: { key: 'theme', locale: 'en' },
    key: 'maan-theme-setting',
    // The setting changes rarely. Keep the response in the Nuxt payload
    // so client navigation never re-hits the endpoint.
    server: true,
    lazy: false,
    default: () => ({ settings: { theme: null } })
  })

  const theme = data.value?.settings?.theme?.value as ThemeValue | undefined
  if (!theme || typeof theme !== 'object') return

  useHead({
    style: [{ key: 'maan-theme', innerHTML: buildThemeCss(theme) }]
  })
})
