// Bilingual text envelope used across forms (and reusable elsewhere).
// Strings stored in the DB as { en, ar } objects; this helper resolves
// one side for rendering. Tolerant of legacy plain-string columns so
// the public site never blanks out during the schema transition.

export type BilingualText = { en: string, ar: string }

/**
 * Pick the locale's value from a bilingual envelope. Falls back through
 *   exact locale -> en -> ar -> ''
 * which means an unset locale still renders the other side rather than
 * surfacing an empty cell to the visitor.
 *
 * The parameter is `unknown` so Prisma's `JsonValue` (which permits
 * arrays / numbers / booleans on JSONB columns) can be passed in
 * directly — the function is tolerance-checked at runtime.
 */
export const pickLocale = (value: unknown, locale: 'en' | 'ar'): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && !Array.isArray(value) && ('en' in value || 'ar' in value)) {
    const o = value as Partial<BilingualText>
    return o[locale] || o.en || o.ar || ''
  }
  return ''
}

/** Coerce any input into a BilingualText, defaulting either side to ''. */
export const toBilingual = (value: unknown, fallback?: Partial<BilingualText>): BilingualText => {
  if (typeof value === 'string') return { en: value, ar: fallback?.ar ?? '' }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return {
      en: (value as Partial<BilingualText>).en ?? fallback?.en ?? '',
      ar: (value as Partial<BilingualText>).ar ?? fallback?.ar ?? ''
    }
  }
  return { en: fallback?.en ?? '', ar: fallback?.ar ?? '' }
}

/** True if at least one side has content. */
export const hasAnyText = (value: unknown): boolean => {
  if (typeof value === 'string') return value.trim().length > 0
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const o = value as Partial<BilingualText>
    return !!(o.en?.trim() || o.ar?.trim())
  }
  return false
}
