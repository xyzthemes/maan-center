// S7: list categories for the dashboard. Auth required (posts scope —
// categories are a sub-taxonomy of posts, gated by the same permission).
// Response envelope `{ categories: [...] }` mirrors the posts list route.

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'posts')

  const rows = await prisma.category.findMany({
    orderBy: [{ sort: 'asc' }, { nameEn: 'asc' }]
  })

  return { categories: rows.map(toDashboardCategory) }
})
