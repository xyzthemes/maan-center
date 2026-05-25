// Phase 5: create a post via Prisma. Auth required.
// Returns the response envelope `{ data: { ... } }` the dashboard composables expect.

import { createError, readBody } from 'h3'
import { sanitizeCategories, sanitizePlacements } from '~/composables/useMaanTaxonomy'

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
  await requireUserSession(event, { user: { role: 'admin' } })
  const body = await readBody<DashboardPostBody>(event)

  const title = body.title?.trim()
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Post title is required.' })
  }

  const status = normalizeStatus(body.status)
  const slug = normalizeSlug(body.slug || title)
  const description = body.description?.trim() || null

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      description,
      content: body.content?.trim() || '<p></p>',
      status,
      publishedAt: normalizePublishedAt(status, body.published_at),
      // sanitize* drops any slug not in the taxonomy — admin UI uses a
      // multi-select so the dashboard never sends unknown ids; defensive
      // here in case future taxonomy changes leave stale strings in old
      // payloads.
      categories: sanitizeCategories(body.categories),
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
