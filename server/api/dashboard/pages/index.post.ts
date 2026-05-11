import { createError, readBody } from 'h3'

type DashboardPageBody = {
  title?: string
  permalink?: string
  content?: string
  status?: string
  published_at?: string
  sort?: number | null
  seo?: {
    title?: string
    meta_description?: string
    focus_keyphrase?: string
  }
}

const normalizePermalink = (value: string) => {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`

  return withLeadingSlash.replace(/\/+$/, '') || '/'
}

const toPagePayload = (body: DashboardPageBody) => {
  const title = body.title?.trim()

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Page title is required.'
    })
  }

  const permalink = body.permalink ? normalizePermalink(body.permalink) : null

  if (!permalink) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Page permalink is required.'
    })
  }

  const status = ['draft', 'in_review', 'published'].includes(body.status || '')
    ? body.status
    : 'draft'

  return {
    title,
    permalink,
    content: body.content?.trim() || null,
    status,
    published_at: status === 'published'
      ? body.published_at || new Date().toISOString()
      : body.published_at || null,
    sort: body.sort ?? null,
    seo: {
      title: body.seo?.title?.trim() || title,
      meta_description: body.seo?.meta_description?.trim() || null,
      focus_keyphrase: body.seo?.focus_keyphrase?.trim() || null
    }
  }
}

export default defineEventHandler(async (event): Promise<unknown> => {
  const body = await readBody<DashboardPageBody>(event)
  const response: unknown = await dashboardDirectusRequest(event, '/items/pages', {
    method: 'POST',
    body: toPagePayload(body)
  })

  return response
})
