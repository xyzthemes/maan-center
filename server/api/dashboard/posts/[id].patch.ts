// Phase 5: update a post via Prisma. Auth required.

import { createError, getRouterParam, readBody } from 'h3'
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
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Post id is required.' })
  }

  const body = await readBody<DashboardPostBody>(event)
  const title = body.title?.trim()

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Post title is required.' })
  }

  const status = normalizeStatus(body.status)
  const description = body.description?.trim() || null

  // DB-backed category validation (S7): drops slugs not in the Category table.
  const categories = await sanitizeCategoriesDb(event, body.categories)

  try {
    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug: normalizeSlug(body.slug || title),
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
  } catch (e) {
    if (isPrismaError(e, 'P2025')) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found.' })
    }
    throw e
  }
})
