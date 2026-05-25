// Layer 3 — Public-side settings reader.
//
// Two flavours:
//   • getOne(key, locale)        — single setting, returns `null` on miss
//   • getMany(keys[], locale)    — batch by key list, returns a record
//
// The endpoint already handles `*`-locale fallback, so callers don't
// need to retry. On any error we return null/{} — every consumer
// already falls back to typed defaults in the source.

export type MaanSettingValue<T = unknown> = {
  key: string
  locale: string
  value: T
}

export const useMaanSettings = () => {
  const getMany = async <T = unknown>(
    keys: string[],
    locale: 'en' | 'ar' = 'en'
  ): Promise<Record<string, MaanSettingValue<T> | null>> => {
    if (!keys.length) return {}
    try {
      const res = await $fetch<{ settings: Record<string, MaanSettingValue<T> | null> }>(
        '/api/public/settings',
        { query: { key: keys, locale } }
      )
      return res.settings ?? {}
    } catch {
      const empty: Record<string, MaanSettingValue<T> | null> = {}
      for (const k of keys) empty[k] = null
      return empty
    }
  }

  const getOne = async <T = unknown>(
    key: string,
    locale: 'en' | 'ar' = 'en'
  ): Promise<MaanSettingValue<T> | null> => {
    const result = await getMany<T>([key], locale)
    return result[key] ?? null
  }

  return { getOne, getMany }
}
