// Create a new staff member + send invitation email.
//
// Flow:
//   1. Validate the payload (email shape, role enum, permission scopes).
//   2. Pre-check the email isn't already in use (Better Auth would error
//      with a less-friendly message otherwise).
//   3. Generate a long random password and create the user via Better
//      Auth's admin plugin (`auth.api.createUser`). This handles
//      User + Account + password hash atomically.
//   4. Update permissions directly via Prisma — the admin-plugin
//      createUser body doesn't accept arbitrary columns.
//   5. Trigger `forgetPassword` to send the invitation email. The
//      `sendResetPassword` callback in auth.config.ts branches on
//      sessions=0 to use invitation copy.

import { createError, readBody, setResponseStatus, getHeaders } from 'h3'
import { randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const payload = parseStaffCreatePayload(await readBody(event))

  const existing = await prisma.user.findUnique({ where: { email: payload.email } })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'A user with this email already exists.' })
  }

  const auth = serverAuth(event)
  const headers = new Headers(getHeaders(event) as Record<string, string>)

  // 32 bytes base64 = ~43 chars of high-entropy noise. The new staff
  // member never types this password — they set their own via the
  // invitation link's reset token.
  const seedPassword = randomBytes(32).toString('base64')

  let createdUserId: string
  try {
    const result = await (auth.api as unknown as {
      createUser: (opts: { body: object, headers: Headers }) => Promise<{ user: { id: string } }>
    }).createUser({
      body: {
        email: payload.email,
        name: payload.name,
        password: seedPassword,
        role: payload.role
      },
      headers
    })
    createdUserId = result.user.id
  } catch (e) {
    const err = e as { message?: string }
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to create the user.'
    })
  }

  // Persist permissions (admin-plugin createUser doesn't accept this
  // column). Admins also keep their permissions array — empty is fine
  // since the helper bypasses the check.
  await prisma.user.update({
    where: { id: createdUserId },
    data: { permissions: payload.permissions }
  })

  // Send the invitation email via Better Auth's password-reset machinery.
  // The callback in auth.config.ts checks for zero sessions and renders
  // invitation copy automatically.
  //
  // Method name is `requestPasswordReset`, not `forgetPassword` — the
  // earlier `forgetPassword` call threw `TypeError: ... is not a function`
  // and prod logs showed the invitation never went out. See
  // node_modules/better-auth/dist/api/routes/password.mjs:20 for the
  // canonical operationId.
  try {
    await (auth.api as unknown as {
      requestPasswordReset: (opts: { body: object, headers: Headers }) => Promise<unknown>
    }).requestPasswordReset({
      body: { email: payload.email, redirectTo: '/dashboard/reset-password' },
      headers
    })
  } catch (e) {
    // Surface but don't fail — the admin can hit "Resend invitation"
    // from the staff edit page once the mailer is happy.
    console.warn('[staff/create] invitation email failed', e)
  }

  const fresh = await prisma.user.findUnique({
    where: { id: createdUserId },
    include: { sessions: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } } }
  })
  if (!fresh) throw createError({ statusCode: 500, statusMessage: 'User vanished after creation.' })

  setResponseStatus(event, 201)
  return { data: toDashboardStaff(fresh) }
})
