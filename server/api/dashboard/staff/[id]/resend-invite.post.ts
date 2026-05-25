// Re-send the invitation email. Calls Better Auth's forgetPassword
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

  try {
    await (auth.api as unknown as {
      forgetPassword: (opts: { body: object, headers: Headers }) => Promise<unknown>
    }).forgetPassword({
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
