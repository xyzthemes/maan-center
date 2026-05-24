// Phase 5: create a page via Prisma. Auth required.

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

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const body = await readBody<DashboardPageBody>(event)
  const title = body.title?.trim()

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Page title is required.' })
  }

  const permalink = body.permalink ? normalizePermalink(body.permalink) : null
  if (!permalink) {
    throw createError({ statusCode: 400, statusMessage: 'Page permalink is required.' })
  }

  const status = normalizeStatus(body.status)

  try {
    const page = await prisma.page.create({
      data: {
        title,
        permalink,
        content: body.content?.trim() || null,
        status,
        publishedAt: normalizePublishedAt(status, body.published_at),
        sort: body.sort ?? null,
        seo: {
          title: body.seo?.title?.trim() || title,
          meta_description: body.seo?.meta_description?.trim() || null,
          focus_keyphrase: body.seo?.focus_keyphrase?.trim() || null
        }
      }
    })
    return { data: toDashboardPage(page) }
  } catch (e) {
    if (isPrismaError(e, 'P2002')) {
      throw createError({ statusCode: 409, statusMessage: 'A page with that permalink already exists.' })
    }
    throw e
  }
})
