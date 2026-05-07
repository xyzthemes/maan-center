export default defineEventHandler(async (event): Promise<{ user?: DashboardDirectusUser }> => {
  const user: DashboardDirectusUser | undefined = await getDashboardUser(event)

  return { user }
})
