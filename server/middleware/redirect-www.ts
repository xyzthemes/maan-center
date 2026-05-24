// 301 redirect `www.maan.center/*` → `https://maan.center/*` so the apex is
// the single canonical host. Better Auth + SEO sitemap URLs all point at the
// apex; serving both hosts equally would split SEO signal and confuse cookies.

import { getRequestHost, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const host = getRequestHost(event, { xForwardedHost: true })
  if (host === 'www.maan.center') {
    const target = `https://maan.center${event.path}`
    return sendRedirect(event, target, 301)
  }
})
