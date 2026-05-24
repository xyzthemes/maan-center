// Phase 5 — Blogger → Maan article redirect map.
//
// When the Blogger export is provided, populate this map with
// { 'old-blogger-path': 'new-article-slug' } pairs. The middleware below
// emits a 301 to the new URL when it sees a hit.
//
// Keep the map sorted alphabetically by old path for diff-ability.
//
// TODO_IMPLEMENTATION_REFERENCES: full Blogger URL map pending.

export type BloggerRedirect = {
  /** Original Blogger path (without origin), e.g. '/2021/05/some-post.html' */
  from: string
  /** Target locale on the new site. */
  locale: 'en' | 'ar'
  /** New article slug under /blog/ or /ar/blog/. */
  slug: string
}

export const bloggerRedirects: readonly BloggerRedirect[] = [
  // Example shape — uncomment + populate once the export lands:
  // { from: '/p/blog-page_30.html', locale: 'ar', slug: 'ar-supporting-communication-through-play' }
] as const

const redirectIndex = new Map(
  bloggerRedirects.map(r => [r.from.replace(/\/+$/, ''), r])
)

export const findBloggerRedirect = (incomingPath: string) => {
  const normalized = incomingPath.replace(/\/+$/, '')
  return redirectIndex.get(normalized)
}
