// Phase 5 — Issues 301 redirects for known Blogger URLs.
//
// Empty map = no-op. Once the Blogger export is parsed and entries are
// populated in `server/utils/blogger-redirects.ts`, this middleware will
// preserve SEO equity by sending old URLs to the new article paths.

import { findBloggerRedirect } from '../utils/blogger-redirects'

export default defineEventHandler((event) => {
  const url = event.path || ''
  // Match the old Blogger flat-page shape: /p/<name>.html or year/month posts.
  if (!url.startsWith('/p/') && !/^\/\d{4}\/\d{2}\//.test(url)) return

  const hit = findBloggerRedirect(url.split('?')[0] || '')
  if (!hit) return

  const target = hit.locale === 'ar' ? `/ar/blog/${hit.slug}` : `/blog/${hit.slug}`
  return sendRedirect(event, target, 301)
})
