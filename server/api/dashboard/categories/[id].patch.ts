// S7: update a category. Auth required. Mirrors the post update route's
// shape + Prisma error handling (P2025 → 404, P2002 → 409 on slug clash).
//
// NOTE: editing a category's slug does NOT rewrite the slug stored in
// existing posts' `Post.categories` arrays — those keep the old string and
// the label falls back to the slug (handled in the UI, S8). Renaming the
// *display name* (name_en/name_ar) is the safe, common case.

import { createError, getRouterParam, readBody } from 'h3'

type DashboardCategoryBody = {
  slug?: string
  name_en?: string
  name_ar?: string
  sort?: unknown
}

const normalizeSort = (raw: unknown): number | null => {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'posts')
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Category id is required.' })
  }

  const body = await readBody<DashboardCategoryBody>(event)
  const nameEn = body.name_en?.trim()
  const nameAr = body.name_ar?.trim()
  if (!nameEn || !nameAr) {
    throw createError({ statusCode: 400, statusMessage: 'Both English and Arabic names are required.' })
  }

  const slug = normalizeSlug(body.slug || nameEn)
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'A valid slug is required.' })
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { slug, nameEn, nameAr, sort: normalizeSort(body.sort) }
    })
    return { data: toDashboardCategory(category) }
  } catch (e) {
    if (isPrismaError(e, 'P2025')) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found.' })
    }
    if (isPrismaError(e, 'P2002')) {
      throw createError({ statusCode: 409, statusMessage: 'A category with this slug already exists.' })
    }
    throw e
  }
})
