// Layer 3 — Public read of one or many SiteSettings.
//
// Usage:
//   /api/public/settings?key=working-hours&locale=en
//     → returns the en row if present, else the '*' row, else null.
//   /api/public/settings?key=working-hours&key=dr-osama-bio&locale=en
//     → returns { 'working-hours': {...}, 'dr-osama-bio': {...} }
//
// `locale='*'` rows always match — used for locale-agnostic settings
// (working-hours, contact-info). When the caller passes locale='en',
// we prefer the en row but fall back to '*' if missing. This means
// the dashboard can store one row instead of two for locale-agnostic
// settings.

import { getQuery } from 'h3'

export type PublicSetting = {
  key: string
  locale: string
  value: unknown
}

const collectKeys = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.flatMap(collectKeys)
  if (typeof raw === 'string') return raw.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const keys = Array.from(new Set(collectKeys(q.key).filter(isSettingKey)))
  if (!keys.length) return { settings: {} as Record<string, PublicSetting | null> }

  const localeRaw = String(q.locale || 'en')
  const locale = isSettingLocale(localeRaw) ? localeRaw : 'en'

  // Fetch any matching row across the requested keys, narrowed to the
  // user's locale OR the locale-agnostic fallback ('*'). One query
  // covers everything.
  const rows = await prisma.siteSetting.findMany({
    where: {
      key: { in: keys },
      OR: [{ locale }, { locale: '*' }]
    }
  })

  // For each key, prefer the exact-locale match over the '*' fallback.
  const settings: Record<string, PublicSetting | null> = {}
  for (const k of keys) settings[k] = null
  for (const row of rows) {
    const current = settings[row.key]
    if (!current || (current.locale === '*' && row.locale === locale)) {
      settings[row.key] = { key: row.key, locale: row.locale, value: row.value }
    }
  }

  return { settings }
})
