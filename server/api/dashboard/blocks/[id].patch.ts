// Layer 2 — update a ContentBlock. Auth required.

import { createError, getRouterParam, readBody } from 'h3'
import { sanitizePlacements } from '~/composables/useMaanTaxonomy'
// isBlockLocale, parseBlockPayload, normalizeStatus, normalizePublishedAt,
// toDashboardBlock, isPrismaError — Nitro auto-imported from server/utils.

type DashboardBlockBody = {
  type?: string
  locale?: string
  payload?: unknown
  placements?: unknown
  status?: string
  sort?: number | null
  published_at?: string
}

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: 'admin' } })
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Block id is required.' })

  const body = await readBody<DashboardBlockBody>(event)

  const type = String(body.type || '')
  const { type: validatedType, payload } = parseBlockPayload(type, body.payload)

  const localeRaw = String(body.locale || 'en')
  if (!isBlockLocale(localeRaw)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid locale "${localeRaw}".` })
  }

  const status = normalizeStatus(body.status)
  const placements = sanitizePlacements(body.placements)

  try {
    const block = await prisma.contentBlock.update({
      where: { id },
      data: {
        type: validatedType,
        locale: localeRaw,
        payload: payload as object,
        placements,
        status,
        sort: typeof body.sort === 'number' ? body.sort : null,
        publishedAt: normalizePublishedAt(status, body.published_at)
      }
    })
    return { data: toDashboardBlock(block) }
  } catch (e) {
    if (isPrismaError(e, 'P2025')) {
      throw createError({ statusCode: 404, statusMessage: 'Block not found.' })
    }
    throw e
  }
})
