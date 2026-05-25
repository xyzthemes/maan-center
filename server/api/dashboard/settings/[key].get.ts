// Layer 3 — Read all stored rows for a single setting key. Returns one
// row per locale the registry expects, with `value: null` placeholders
// so the dashboard editor can render every locale's editor even when no
// row exists yet.

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'settings')
  const keyRaw = getRouterParam(event, 'key')
  if (!keyRaw || !isSettingKey(keyRaw)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown setting key.' })
  }

  const spec = SETTING_REGISTRY[keyRaw]
  const rows = await prisma.siteSetting.findMany({ where: { key: keyRaw } })

  // Build one entry per expected locale, defaulting to null when the
  // row doesn't exist yet.
  const byLocale: Record<string, { locale: string, value: unknown, updatedAt: string | null }> = {}
  for (const locale of spec.locales) {
    byLocale[locale] = { locale, value: null, updatedAt: null }
  }
  for (const row of rows) {
    byLocale[row.locale] = {
      locale: row.locale,
      value: row.value,
      updatedAt: row.updatedAt.toISOString()
    }
  }

  return {
    key: keyRaw,
    locales: spec.locales,
    rows: spec.locales.map(l => byLocale[l]!)
  }
})
