// Phase 5: create a post via Prisma. Auth required.
// Returns the response envelope `{ data: { ... } }` the dashboard composables expect.

import { createError, readBody } from 'h3'

type DashboardPostBody = {
  title?: string
  slug?: string
  description?: string
  content?: string
  status?: string
  published_at?: string
  seo?: {
    title?: string
    meta_description?: string
    focus_keyphrase?: string
  }
}

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
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
      seo: {
        title: body.seo?.title?.trim() || title,
        meta_description: body.seo?.meta_description?.trim() || description,
        focus_keyphrase: body.seo?.focus_keyphrase?.trim() || null
      }
    }
  })

  return { data: toDashboardPost(post) }
})
