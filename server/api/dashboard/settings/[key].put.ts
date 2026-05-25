// Layer 3 — Upsert a SiteSetting row.
//
// Body: { locale, value }. The composite primary key (key, locale)
// means we can use a single upsert without a separate id lookup.
// Validation goes through the registry's per-key parser so admins
// can't store malformed payloads.

import { createError, getRouterParam, readBody } from 'h3'

type PutBody = {
  locale?: string
  value?: unknown
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'settings')
  const keyRaw = getRouterParam(event, 'key')
  if (!keyRaw || !isSettingKey(keyRaw)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown setting key.' })
  }

  const body = await readBody<PutBody>(event)
  const localeRaw = String(body.locale || '')
  if (!isSettingLocale(localeRaw)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid locale "${localeRaw}".` })
  }

  const spec = SETTING_REGISTRY[keyRaw]
  if (!spec.locales.includes(localeRaw)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Setting "${keyRaw}" does not accept locale "${localeRaw}". Allowed: ${spec.locales.join(', ')}.`
    })
  }

  // Throws 400 on bad shape.
  const parsedValue = spec.parse(body.value)

  const row = await prisma.siteSetting.upsert({
    where: { key_locale: { key: keyRaw, locale: localeRaw } },
    create: { key: keyRaw, locale: localeRaw, value: parsedValue as object },
    update: { value: parsedValue as object }
  })

  return {
    data: {
      key: row.key,
      locale: row.locale,
      value: row.value,
      updatedAt: row.updatedAt.toISOString()
    }
  }
})
