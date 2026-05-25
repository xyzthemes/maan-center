// Layer 2 — create a ContentBlock. Auth required.

import { createError, readBody } from 'h3'
import { sanitizePlacements } from '~/composables/useMaanTaxonomy'
// isBlockLocale, parseBlockPayload, toDashboardBlock, normalizeStatus,
// normalizePublishedAt — all Nitro auto-imported from server/utils.

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
  const body = await readBody<DashboardBlockBody>(event)

  const type = String(body.type || '')
  // parseBlockPayload throws a 400 if the discriminator or shape is invalid.
  const { type: validatedType, payload } = parseBlockPayload(type, body.payload)

  const localeRaw = String(body.locale || 'en')
  if (!isBlockLocale(localeRaw)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid locale "${localeRaw}".` })
  }

  const status = normalizeStatus(body.status)
  // Reuse the Layer-1 placement taxonomy; blocks live on the same
  // surfaces as posts (homepage-featured, program-related, …). Unknown
  // ids are dropped silently.
  const placements = sanitizePlacements(body.placements)

  const block = await prisma.contentBlock.create({
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
})
