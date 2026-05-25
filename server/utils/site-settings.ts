// Layer 3 — Typed schemas for SiteSetting rows.
//
// One entry per known key. Each defines:
//   • `locales`: the locale rows this setting expects (`['*']` for
//     locale-agnostic, `['en', 'ar']` for split-by-language)
//   • `parse(raw)`: per-key payload validator that throws a 400 on
//     malformed input
//
// Used by:
//   • server/api/dashboard/settings/[key].put.ts (validate writes)
//   • server/api/public/settings.get.ts (response narrowing)
//   • dashboard editors (per-key form rendering)

import { createError } from 'h3'

// ── Per-key payload shapes ────────────────────────────────────────────────

export type WorkingHoursDay = {
  /** 0 = Sunday … 6 = Saturday */
  day: number
  closed?: boolean
  opens?: string // 'HH:mm'
  closes?: string // 'HH:mm'
  secondOpens?: string
  secondCloses?: string
}

export type WorkingHoursValue = {
  days: WorkingHoursDay[]
}

export type DrOsamaBioValue = {
  name: string
  headline: string
  /** Plain text or simple HTML. */
  bio: string
  tags?: string[]
}

export type MissionVisionValue = {
  mission: string
  vision: string
}

export type ContactInfoValue = {
  phone?: string
  whatsapp?: string
  email?: string
  mapsUrl?: string
  address?: string
}

export type StatsListValue = {
  items: Array<{ value: string, label: string }>
}

export type ThemeColorMap = {
  surface: string
  surfaceAlt: string
  ink: string
  inkMuted: string
  line: string // rgba allowed
  cta: string
  ctaHover: string
  autism: string
  autismSoft: string // rgba allowed
  down: string
  downSoft: string // rgba allowed
  ld: string
  ldSoft: string // rgba allowed
}

export type ThemeValue = {
  light: ThemeColorMap
  dark: ThemeColorMap
}

/** Keys that may be stored as rgba (the rest are opaque hex). */
export const THEME_ALPHA_KEYS = ['line', 'autismSoft', 'downSoft', 'ldSoft'] as const
export type ThemeTokenKey = keyof ThemeColorMap

// ── Per-key registry ──────────────────────────────────────────────────────

const bad = (msg: string): never => {
  throw createError({ statusCode: 400, statusMessage: msg })
}

const requiredStr = (raw: unknown, field: string, max = 4000): string => {
  if (typeof raw !== 'string') return bad(`Field "${field}" is required.`)
  const v = raw.trim()
  if (!v) return bad(`Field "${field}" cannot be empty.`)
  if (v.length > max) return bad(`Field "${field}" exceeds ${max} characters.`)
  return v
}

const optionalStr = (raw: unknown, max = 4000): string | undefined => {
  if (raw === undefined || raw === null) return undefined
  if (typeof raw !== 'string') return undefined
  const v = raw.trim()
  if (!v) return undefined
  if (v.length > max) return bad(`String exceeds ${max} characters.`)
  return v
}

const optionalHHmm = (raw: unknown): string | undefined => {
  const v = optionalStr(raw, 5)
  if (!v) return undefined
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) return bad(`Time "${v}" must be HH:mm.`)
  return v
}

const parseWorkingHours = (raw: unknown): WorkingHoursValue => {
  const r = (raw ?? {}) as Record<string, unknown>
  if (!Array.isArray(r.days)) return bad('Field "days" must be an array.')
  const days: WorkingHoursDay[] = []
  for (const d of r.days as unknown[]) {
    const dd = (d ?? {}) as Record<string, unknown>
    const day = Number(dd.day)
    if (!Number.isInteger(day) || day < 0 || day > 6) return bad(`Invalid day "${String(dd.day)}".`)
    days.push({
      day,
      closed: dd.closed === true,
      opens: optionalHHmm(dd.opens),
      closes: optionalHHmm(dd.closes),
      secondOpens: optionalHHmm(dd.secondOpens),
      secondCloses: optionalHHmm(dd.secondCloses)
    })
  }
  return { days }
}

const parseDrOsamaBio = (raw: unknown): DrOsamaBioValue => {
  const r = (raw ?? {}) as Record<string, unknown>
  const tagsRaw = Array.isArray(r.tags) ? r.tags.filter((v): v is string => typeof v === 'string') : []
  return {
    name: requiredStr(r.name, 'name', 200),
    headline: requiredStr(r.headline, 'headline', 400),
    bio: requiredStr(r.bio, 'bio', 8000),
    tags: tagsRaw.length ? tagsRaw : undefined
  }
}

const parseMissionVision = (raw: unknown): MissionVisionValue => {
  const r = (raw ?? {}) as Record<string, unknown>
  return {
    mission: requiredStr(r.mission, 'mission', 2000),
    vision: requiredStr(r.vision, 'vision', 2000)
  }
}

const parseContactInfo = (raw: unknown): ContactInfoValue => {
  const r = (raw ?? {}) as Record<string, unknown>
  return {
    phone: optionalStr(r.phone, 50),
    whatsapp: optionalStr(r.whatsapp, 50),
    email: optionalStr(r.email, 200),
    mapsUrl: optionalStr(r.mapsUrl, 1000),
    address: optionalStr(r.address, 600)
  }
}

const parseStatsList = (raw: unknown): StatsListValue => {
  const r = (raw ?? {}) as Record<string, unknown>
  if (!Array.isArray(r.items)) return bad('Field "items" must be an array.')
  const items: Array<{ value: string, label: string }> = []
  for (const item of r.items as unknown[]) {
    const i = (item ?? {}) as Record<string, unknown>
    items.push({
      value: requiredStr(i.value, 'value', 40),
      label: requiredStr(i.label, 'label', 200)
    })
  }
  return { items }
}

// CSS color: 6-digit hex, or rgb()/rgba() with integer channels + optional 0-1 alpha.
const HEX_RE = /^#[0-9a-fA-F]{6}$/
const RGBA_RE = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+))?\s*\)$/

const THEME_TOKEN_KEYS: ThemeTokenKey[] = [
  'surface', 'surfaceAlt', 'ink', 'inkMuted', 'line',
  'cta', 'ctaHover',
  'autism', 'autismSoft', 'down', 'downSoft', 'ld', 'ldSoft'
]

const parseColor = (raw: unknown, field: string): string => {
  if (typeof raw !== 'string') return bad(`Color "${field}" must be a string.`)
  const v = raw.trim()
  if (!HEX_RE.test(v) && !RGBA_RE.test(v)) {
    return bad(`Color "${field}" must be #RRGGBB or rgb()/rgba(): got "${v}".`)
  }
  return v
}

const parseColorMap = (raw: unknown, side: 'light' | 'dark'): ThemeColorMap => {
  const r = (raw ?? {}) as Record<string, unknown>
  const map = {} as ThemeColorMap
  for (const key of THEME_TOKEN_KEYS) {
    map[key] = parseColor(r[key], `${side}.${key}`)
  }
  return map
}

const parseTheme = (raw: unknown): ThemeValue => {
  const r = (raw ?? {}) as Record<string, unknown>
  return {
    light: parseColorMap(r.light, 'light'),
    dark: parseColorMap(r.dark, 'dark')
  }
}

// ── Registry ──────────────────────────────────────────────────────────────

export type SettingKey
  = | 'working-hours'
    | 'dr-osama-bio'
    | 'mission-vision'
    | 'contact-info'
    | 'stats'
    | 'theme'

export type SettingSpec = {
  key: SettingKey
  /** Locales this setting expects when storing. `['*']` = locale-agnostic. */
  locales: Array<'en' | 'ar' | '*'>
  parse: (raw: unknown) => unknown
}

export const SETTING_REGISTRY: Record<SettingKey, SettingSpec> = {
  'working-hours': { key: 'working-hours', locales: ['*'], parse: parseWorkingHours },
  'dr-osama-bio': { key: 'dr-osama-bio', locales: ['en', 'ar'], parse: parseDrOsamaBio },
  'mission-vision': { key: 'mission-vision', locales: ['en', 'ar'], parse: parseMissionVision },
  'contact-info': { key: 'contact-info', locales: ['*'], parse: parseContactInfo },
  'stats': { key: 'stats', locales: ['en', 'ar'], parse: parseStatsList },
  'theme': { key: 'theme', locales: ['*'], parse: parseTheme }
}

const SETTING_KEYS = Object.keys(SETTING_REGISTRY) as SettingKey[]
export const isSettingKey = (v: string): v is SettingKey =>
  (SETTING_KEYS as readonly string[]).includes(v)

export const VALID_SETTING_LOCALES = ['en', 'ar', '*'] as const
export type SettingLocale = typeof VALID_SETTING_LOCALES[number]
export const isSettingLocale = (v: string): v is SettingLocale =>
  (VALID_SETTING_LOCALES as readonly string[]).includes(v)
