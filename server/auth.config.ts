// Better Auth server configuration (Phase 4).
//
// Wires Better Auth's Prisma adapter to our singleton Prisma client. The admin
// plugin gives us role-based gating (`requireUserSession(event, { user: { role: 'admin' } })`)
// without writing custom middleware.

import { defineServerAuth } from '@onmax/nuxt-better-auth/config'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins/admin'
import { prisma } from './utils/db/client'
import { sendEmail } from './utils/email'

export default defineServerAuth(() => ({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  // Local dev convenience: accept either `localhost:3000` or `127.0.0.1:3000`
  // regardless of which one `BETTER_AUTH_URL` is set to. Better Auth's
  // origin/CSRF check rejects requests from any origin not in this list and
  // not equal to BETTER_AUTH_URL; without both entries, hitting the "wrong"
  // host (or the dev server being bound to only one loopback family) surfaces
  // in the browser as "Failed to fetch".
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],

  // Phase 4 ships email/password only. OAuth providers can land in a later phase.
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,

    // Forgot-password flow. Better Auth generates the token + reset URL; this
    // callback ships it to the user via SMTP (see server/utils/email.ts).
    // The `url` already includes the token and points at /dashboard/reset-password
    // because that's the callbackURL the client sends in the forget-password call.
    //
    // The same callback handles staff INVITATIONS too: when the admin adds a
    // new staff member, the server creates the user then calls
    // requestPasswordReset; we detect "never signed in before" via a
    // sessions=0 lookup and switch the copy. This keeps the flow within
    // Better Auth's token machinery without an extra "invitation accept"
    // route to build.
    sendResetPassword: async ({ user, url }) => {
      const sessionCount = await prisma.session.count({ where: { userId: user.id } })
      const isInvitation = sessionCount === 0

      const subject = isInvitation
        ? 'You\'ve been added to the Maan dashboard'
        : 'Reset your Maan dashboard password'

      const greeting = `Hi ${user.name || ''},`
      const body = isInvitation
        ? [
            'You\'ve been invited to join the Maan team dashboard.',
            'Click the link below to set your password and finish signing in.',
            'The link expires in 1 hour — ask your admin to re-send it if it does.'
          ]
        : [
            'Reset your password by opening the link below. It expires in 1 hour.',
            '',
            'If you did not request this, ignore this email.'
          ]

      await sendEmail({
        to: user.email,
        subject,
        text: [greeting, '', ...body, '', url, '', '— Maan Center'].join('\n'),
        html: `
          <p>${greeting}</p>
          ${body.map(line => `<p>${line}</p>`).join('')}
          <p><a href="${url}" style="display:inline-block;background:#3D8AC5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">${isInvitation ? 'Set your password' : 'Reset password'}</a></p>
          <p style="color:#466079;font-size:13px;">Or copy this link: <a href="${url}">${url}</a></p>
          <p>— Maan Center</p>
        `
      })
    },
    // Tokens default to 1h expiry; surfaced here for visibility.
    resetPasswordTokenExpiresIn: 60 * 60
  },

  // Role gating via the admin plugin — its built-in role names ("admin", "user")
  // are what the seed wrote into User.role, and what dashboard route rules check.
  plugins: [admin()],

  // Cookie cache trims DB hits on every authed request. 5min is well under
  // session.expiresIn (7d default) so we don't risk serving a banned user's
  // cached session for long.
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
    }
  }
}))
