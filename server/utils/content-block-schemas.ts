// Layer 2 — Per-type payload schemas for ContentBlock.
//
// Hand-rolled (no zod dep) because the shapes are small and we already
// hand-validate elsewhere in the server. Each `parse*` returns the
// typed payload or throws a 400. `BLOCK_TYPES` enumerates valid type
// strings — used at API boundaries to reject unknown discriminators
// before they hit the Prisma layer.

import { createError } from 'h3'

export const BLOCK_TYPES = ['testimonial', 'faq_item', 'stat_tile', 'team_member', 'service_card'] as const
export type BlockType = typeof BLOCK_TYPES[number]
export const isBlockType = (v: string): v is BlockType =>
  (BLOCK_TYPES as readonly string[]).includes(v)

// ── Per-type payload shapes ───────────────────────────────────────────────

export type TestimonialPayload = {
  /** Quote body (plain text). */
  quote: string
  /** Attribution (e.g. "Parent, Manama"). No child names — enforced at write time. */
  attribution: string
}

export type FaqItemPayload = {
  /** Question. */
  q: string
  /** Answer (plain text or simple HTML). */
  a: string
}

export type StatTilePayload = {
  /** Display value (e.g. "+100", "Years"). Stored as a string because
   *  numbers and labels coexist (e.g. "Years of experience"). */
  value: string
  label: string
}

export type TeamMemberPayload = {
  name: string
  /** One-line role/headline. */
  role: string
  /** Body bio (plain text or HTML). */
  bio: string
  /** Optional portrait URL (Tigris). */
  imageUrl?: string
  /** Optional specialty chips ("Autism Spectrum", …). */
  tags?: string[]
}

export type ServiceCardPayload = {
  title: string
  description: string
  /** Iconify name — e.g. 'i-lucide-shield-check'. */
  icon: string
  /** Optional CTA. */
  ctaLabel?: string
  ctaUrl?: string
}

export type BlockPayload
  = | { type: 'testimonial', payload: TestimonialPayload }
    | { type: 'faq_item', payload: FaqItemPayload }
    | { type: 'stat_tile', payload: StatTilePayload }
    | { type: 'team_member', payload: TeamMemberPayload }
    | { type: 'service_card', payload: ServiceCardPayload }

// ── Validation helpers ────────────────────────────────────────────────────

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

const optionalStrArray = (raw: unknown): string[] | undefined => {
  if (!Array.isArray(raw)) return undefined
  const out: string[] = []
  for (const v of raw) {
    if (typeof v === 'string' && v.trim()) out.push(v.trim())
  }
  return out.length ? out : undefined
}

// ── Per-type parsers ──────────────────────────────────────────────────────

const parseTestimonial = (raw: unknown): TestimonialPayload => {
  const p = (raw ?? {}) as Record<string, unknown>
  return {
    quote: requiredStr(p.quote, 'quote', 1200),
    attribution: requiredStr(p.attribution, 'attribution', 200)
  }
}

const parseFaqItem = (raw: unknown): FaqItemPayload => {
  const p = (raw ?? {}) as Record<string, unknown>
  return {
    q: requiredStr(p.q, 'q', 400),
    a: requiredStr(p.a, 'a', 4000)
  }
}

const parseStatTile = (raw: unknown): StatTilePayload => {
  const p = (raw ?? {}) as Record<string, unknown>
  return {
    value: requiredStr(p.value, 'value', 40),
    label: requiredStr(p.label, 'label', 120)
  }
}

const parseTeamMember = (raw: unknown): TeamMemberPayload => {
  const p = (raw ?? {}) as Record<string, unknown>
  return {
    name: requiredStr(p.name, 'name', 200),
    role: requiredStr(p.role, 'role', 200),
    bio: requiredStr(p.bio, 'bio', 4000),
    imageUrl: optionalStr(p.imageUrl, 1000),
    tags: optionalStrArray(p.tags)
  }
}

const parseServiceCard = (raw: unknown): ServiceCardPayload => {
  const p = (raw ?? {}) as Record<string, unknown>
  return {
    title: requiredStr(p.title, 'title', 200),
    description: requiredStr(p.description, 'description', 1200),
    icon: requiredStr(p.icon, 'icon', 100),
    ctaLabel: optionalStr(p.ctaLabel, 200),
    ctaUrl: optionalStr(p.ctaUrl, 1000)
  }
}

/**
 * Top-level parser used by the dashboard POST/PATCH endpoints. Validates
 * the discriminator + delegates to the matching payload parser. Throws
 * a 400 on any shape mismatch.
 */
export const parseBlockPayload = (type: string, payload: unknown): BlockPayload => {
  if (!isBlockType(type)) {
    return bad(`Unknown block type "${type}".`)
  }
  switch (type) {
    case 'testimonial': return { type, payload: parseTestimonial(payload) }
    case 'faq_item': return { type, payload: parseFaqItem(payload) }
    case 'stat_tile': return { type, payload: parseStatTile(payload) }
    case 'team_member': return { type, payload: parseTeamMember(payload) }
    case 'service_card': return { type, payload: parseServiceCard(payload) }
  }
}

/** Locale validation. Accepts en/ar; `*` allowed for type-specific
 *  locale-agnostic blocks. */
export const VALID_BLOCK_LOCALES = ['en', 'ar', '*'] as const
export type BlockLocale = typeof VALID_BLOCK_LOCALES[number]
export const isBlockLocale = (v: string): v is BlockLocale =>
  (VALID_BLOCK_LOCALES as readonly string[]).includes(v)
