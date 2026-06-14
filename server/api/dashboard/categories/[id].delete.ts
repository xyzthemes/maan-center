// S7: delete a category. Auth required. Mirrors the post delete route.
//
// Deletion is intentionally NON-cascading: the slug may still appear in some
// posts' `Post.categories` arrays. That's safe — the DB-backed validator
// (category-validation.ts) drops any slug not in the Category table on the
// next post save, and the public/dashboard UI falls back to showing the raw
// slug. No orphaned FK to clean up because the relation is by string, not id.

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'posts')
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Category id is required.' })
  }

  try {
    await prisma.category.delete({ where: { id } })
    return { success: true as const }
  } catch (e) {
    if (isPrismaError(e, 'P2025')) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found.' })
    }
    throw e
  }
})
