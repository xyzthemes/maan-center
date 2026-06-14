// S10: public, read-only category list for the blog index filter. The
// dashboard route (`/api/dashboard/categories`) is auth-gated; the public
// filter needs the same DB-backed list (so it tracks admin-managed
// categories) WITHOUT exposing the gated route. Returns only the fields a
// public filter needs — slug + localized labels — no timestamps/ids beyond
// what the UI binds.

export default defineEventHandler(async () => {
  const rows = await prisma.category.findMany({
    orderBy: [{ sort: 'asc' }, { nameEn: 'asc' }]
  })

  return {
    categories: rows.map(c => ({
      slug: c.slug,
      name_en: c.nameEn,
      name_ar: c.nameAr
    }))
  }
})
