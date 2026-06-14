// Phase 5: create a post via Prisma. Auth required.
// Returns the response envelope `{ data: { ... } }` the dashboard composables expect.

import { createError, readBody } from 'h3'
import { sanitizePlacements } from '~/composables/useMaanTaxonomy'

type DashboardPostBody = {
  title?: string
  slug?: string
  description?: string
  content?: string
  status?: string
  published_at?: string
  categories?: unknown
  placements?: unknown
  seo?: {
    title?: string
    meta_description?: string
    focus_keyphrase?: string
  }
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'posts')
  const body = await readBody<DashboardPostBody>(event)

  const title = body.title?.trim()
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Post title is required.' })
  }

  const status = normalizeStatus(body.status)
  const slug = normalizeSlug(body.slug || title)
  const description = body.description?.trim() || null

  // Drops any slug not present in the dynamic Category table (S7, async DB
  // check). The admin UI uses a multi-select so it never sends unknown ids;
  // defensive here so a deleted/renamed category can't leave bad data behind.
  const categories = await sanitizeCategoriesDb(event, body.categories)

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      description,
      content: body.content?.trim() || '<p></p>',
      status,
      publishedAt: normalizePublishedAt(status, body.published_at),
      categories,
      placements: sanitizePlacements(body.placements),
      seo: {
        title: body.seo?.title?.trim() || title,
        meta_description: body.seo?.meta_description?.trim() || description,
        focus_keyphrase: body.seo?.focus_keyphrase?.trim() || null
      }
    }
  })

  return { data: toDashboardPost(post) }
})
