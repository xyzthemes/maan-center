export default defineEventHandler((event) => {
  clearDashboardAuthCookies(event)

  return { ok: true }
})
