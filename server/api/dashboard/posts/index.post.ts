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

const normalizeSlug = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
  .replace(/^-+|-+$/g, '')

const toPostPayload = (body: DashboardPostBody) => {
  const title = body.title?.trim()

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Post title is required.'
    })
  }

  const slug = normalizeSlug(body.slug || title)
  const status = ['draft', 'in_review', 'published'].includes(body.status || '')
    ? body.status
    : 'draft'

  return {
    title,
    slug,
    description: body.description?.trim() || null,
    content: body.content?.trim() || '<p></p>',
    status,
    published_at: status === 'published'
      ? body.published_at || new Date().toISOString()
      : body.published_at || null,
    seo: {
      title: body.seo?.title?.trim() || title,
      meta_description: body.seo?.meta_description?.trim() || body.description?.trim() || null,
      focus_keyphrase: body.seo?.focus_keyphrase?.trim() || null
    }
  }
}

export default defineEventHandler(async (event): Promise<unknown> => {
  const body = await readBody<DashboardPostBody>(event)
  const response: unknown = await dashboardDirectusRequest(event, '/items/posts', {
    method: 'POST',
    body: toPostPayload(body)
  })

  return response
})
