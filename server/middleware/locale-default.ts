// First-visit locale routing.
//
// Default to Arabic for visitors who haven't expressed a preference. The
// `maan-locale` cookie is set by the locale toggle in the header (see
// switchLocale in app/layouts/default.vue). Once set, we never auto-redirect
// again — the visitor stays where they want.
//
// We deliberately only redirect on the literal `/` path so SEO crawlers
// reaching `/about-us`, `/blog/<slug>`, etc. don't get bounced. The
// homepage is the only place where "default locale" really matters.

const LOCALE_COOKIE = 'maan-locale'

export default defineEventHandler((event) => {
  const url = event.path || ''

  // Only the literal English homepage; don't touch /ar, /contact, etc.
  if (url !== '/' && !url.startsWith('/?')) return

  const cookie = getCookie(event, LOCALE_COOKIE)
  if (cookie === 'en' || cookie === 'ar') {
    // Visitor has chosen — honour it. If they chose Arabic and somehow
    // landed on `/`, send them to `/ar`. If English, stay.
    if (cookie === 'ar') return sendRedirect(event, '/ar' + (url === '/' ? '' : url.slice(1)), 302)
    return
  }

  // No preference yet. Bots that don't send Accept-Language stay on `/` so
  // canonical English content still gets indexed; humans (and any UA that
  // sends Accept-Language) get Arabic by default per the brief.
  const accept = getHeader(event, 'accept-language') || ''
  if (!accept) return

  // Persist the implicit default so downstream pages (e.g. the dashboard
  // index that recovers locale after a Better-Auth redirect) can read it.
  // Without this, first-visit Arabic users have no cookie and any
  // out-of-band redirect to a canonical `/dashboard` path would land them
  // in the English UI.
  setCookie(event, LOCALE_COOKIE, 'ar', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  })

  return sendRedirect(event, '/ar' + (url === '/' ? '' : url.slice(1)), 302)
})
