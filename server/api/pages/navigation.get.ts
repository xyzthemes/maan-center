// Phase 5: published page list for the public nav menu (Prisma).

export type NavPage = {
  id: string
  title: string
  permalink: string
}

const STATIC_PERMALINKS = new Set([
  '/',
  '/blog',
  '/contact',
  '/ar',
  '/ar/blog',
  '/ar/contact',
  '/dashboard',
  '/dashboard/login',
  '/ar/dashboard',
  '/ar/dashboard/login'
])

export default defineEventHandler(async (): Promise<{ pages: NavPage[] }> => {
  try {
    const rows = await prisma.page.findMany({
      where: { status: 'published' },
      orderBy: [{ sort: 'asc' }, { title: 'asc' }],
      take: 50,
      select: { id: true, title: true, permalink: true }
    })

    const pages = rows.filter(p => !STATIC_PERMALINKS.has(p.permalink))
    return { pages }
  } catch {
    return { pages: [] }
  }
})
