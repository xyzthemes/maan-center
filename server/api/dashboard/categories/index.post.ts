// S7: create a category. Auth required. Returns `{ data: { ... } }` like the
// post create route. `slug` is normalized the same way post slugs are so it
// stays a clean, URL-safe key matching the strings stored in Post.categories.

import { createError, readBody } from 'h3'

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
    const category = await prisma.category.create({
      data: { slug, nameEn, nameAr, sort: normalizeSort(body.sort) }
    })
    return { data: toDashboardCategory(category) }
  } catch (e) {
    if (isPrismaError(e, 'P2002')) {
      throw createError({ statusCode: 409, statusMessage: 'A category with this slug already exists.' })
    }
    throw e
  }
})
