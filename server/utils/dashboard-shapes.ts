// Phase 5: serialization helpers that map Prisma rows to the snake_case shapes
// the dashboard composables already consume. Keeping the wire shape stable
// lets us swap data sources without touching every client file in the same PR.
// Phase 7 cleanup can rename these to camelCase (post/page interfaces) and
// drop this layer.

import type { Page, Post, FormSubmission, FormSubmissionValue, Form, ContentBlock } from './db/types'

export type DashboardPostShape = {
  id: string
  status: string
  slug: string
  title: string
  description: string | null
  content: string | null
  image: string | null
  published_at: string | null
  date_created: string
  date_updated: string
  seo: unknown
  // Layer 1 taxonomy. Always serialised as arrays (never null) so the
  // dashboard editor's multi-select bindings don't need a defensive
  // `?? []` fallback at every use-site.
  categories: string[]
  placements: string[]
}

export const toDashboardPost = (post: Post): DashboardPostShape => ({
  id: post.id,
  status: post.status,
  slug: post.slug,
  title: post.title,
  description: post.description,
  content: post.content,
  image: post.image,
  published_at: post.publishedAt?.toISOString() ?? null,
  date_created: post.createdAt.toISOString(),
  date_updated: post.updatedAt.toISOString(),
  seo: post.seo,
  categories: post.categories ?? [],
  placements: post.placements ?? []
})

export type DashboardPageShape = {
  id: string
  status: string
  title: string
  permalink: string
  content: string | null
  published_at: string | null
  date_created: string
  date_updated: string
  sort: number | null
  seo: unknown
}

export const toDashboardPage = (page: Page): DashboardPageShape => ({
  id: page.id,
  status: page.status,
  title: page.title,
  permalink: page.permalink,
  content: page.content,
  published_at: page.publishedAt?.toISOString() ?? null,
  date_created: page.createdAt.toISOString(),
  date_updated: page.updatedAt.toISOString(),
  sort: page.sort,
  seo: page.seo
})

export type DashboardBlockShape = {
  id: string
  type: string
  locale: string
  status: string
  payload: unknown
  placements: string[]
  sort: number | null
  published_at: string | null
  date_created: string
  date_updated: string
}

export const toDashboardBlock = (block: ContentBlock): DashboardBlockShape => ({
  id: block.id,
  type: block.type,
  locale: block.locale,
  status: block.status,
  payload: block.payload,
  placements: block.placements ?? [],
  sort: block.sort,
  published_at: block.publishedAt?.toISOString() ?? null,
  date_created: block.createdAt.toISOString(),
  date_updated: block.updatedAt.toISOString()
})

export type DashboardSubmissionShape = {
  id: string
  timestamp: string
  form: { id: string, title: string } | undefined
  values: Array<{ id: string, name: string, label: string, value: string }>
}

export const toDashboardSubmission = (
  submission: FormSubmission & {
    form: Form | null
    values: FormSubmissionValue[]
  }
): DashboardSubmissionShape => ({
  id: submission.id,
  timestamp: submission.timestamp.toISOString(),
  form: submission.form ? { id: submission.form.id, title: submission.form.title } : undefined,
  values: submission.values.map(v => ({
    id: v.id,
    name: v.name,
    label: v.label,
    value: v.value ?? ''
  }))
})

// Normalizers used by the create/patch endpoints. The dashboard editors send
// snake_case payloads (legacy from the Directus shape); these helpers turn that
// into Prisma's camelCase + enum types.

export const normalizeSlug = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9؀-ۿ]+/g, '-')
  .replace(/^-+|-+$/g, '')

export const normalizePermalink = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeadingSlash.replace(/\/+$/, '') || '/'
}

const VALID_STATUSES = new Set(['draft', 'in_review', 'published'])

export const normalizeStatus = (value: unknown): 'draft' | 'in_review' | 'published' => {
  return typeof value === 'string' && VALID_STATUSES.has(value)
    ? (value as 'draft' | 'in_review' | 'published')
    : 'draft'
}

export const normalizePublishedAt = (
  status: 'draft' | 'in_review' | 'published',
  raw: unknown
): Date | null => {
  if (typeof raw === 'string' && raw) {
    const d = new Date(raw)
    if (!Number.isNaN(d.getTime())) return d
  }
  return status === 'published' ? new Date() : null
}
