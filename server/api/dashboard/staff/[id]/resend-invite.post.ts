// Re-send the invitation email. Calls Better Auth's requestPasswordReset
// endpoint which issues a fresh token + URL, then fires the
// `sendResetPassword` callback. The callback's invitation/reset
// branch logic still applies (sessions=0 → invitation copy).

import { createError, getHeaders, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'User id is required.' })

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) throw createError({ statusCode: 404, statusMessage: 'User not found.' })

  const auth = serverAuth(event)
  const headers = new Headers(getHeaders(event) as Record<string, string>)

  // Match the locale of the dashboard page the admin clicked from —
  // see staff/index.post.ts for the same pattern.
  const adminReferer = getHeaders(event).referer || ''
  const adminLocale = adminReferer.includes('/ar/') ? 'ar' : 'en'
  headers.set('x-mail-locale', adminLocale)

  try {
    await (auth.api as unknown as {
      requestPasswordReset: (opts: { body: object, headers: Headers }) => Promise<unknown>
    }).requestPasswordReset({
      body: { email: target.email, redirectTo: '/dashboard/reset-password' },
      headers
    })
  } catch (e) {
    const err = e as { message?: string }
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Couldn\'t send the email.'
    })
  }

  return { data: { id } }
})
