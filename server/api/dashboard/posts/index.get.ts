// Phase 5: list posts from Prisma. Auth via Better Auth's requireUserSession.
// Wire shape preserved (snake_case) so usePosts doesn't need changes.

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const rows = await prisma.post.findMany({
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    take: 100
  })

  return { posts: rows.map(toDashboardPost) }
})
