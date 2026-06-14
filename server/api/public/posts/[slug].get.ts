// Phase 1 (S1): dedicated single published-post lookup by slug.
//
// Decouples blog detail pages from the list endpoint's `limit`/`locale`
// defaults — the real cause of the "click article → page freezes" bug,
// where any post ranked past the list's default window (or any AR post
// fetched with the EN default) resolved to `undefined`.
//
// `findUnique` by slug, then a clean 404 unless the post is published.
// Returns the post shaped like `PublicPostListItem` (reusing the type +
// field mapping from `../posts.get.ts`) so the client mapper can reuse
// `toMaanPost` unchanged.

import { createError, getRouterParam } from 'h3'
import type { PublicPostListItem } from '../posts.get'

export default defineEventHandler(async (event): Promise<{ post: PublicPostListItem }> => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug is required.' })

  const p = await prisma.post.findUnique({ where: { slug } })

  if (!p || p.status !== 'published') {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  return {
    post: {
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      image: p.image,
      content: p.content,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      seo: p.seo,
      categories: p.categories ?? [],
      placements: p.placements ?? []
    }
  }
})
