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

  // Phase 4 ships email/password only. OAuth providers can land in a later phase.
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,

    // Forgot-password flow. Better Auth generates the token + reset URL; this
    // callback ships it to the user via SMTP (see server/utils/email.ts).
    // The `url` already includes the token and points at /dashboard/reset-password
    // because that's the callbackURL the client sends in the forget-password call.
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset your Maan dashboard password',
        text: [
          `Hi ${user.name || ''},`,
          '',
          'Reset your password by opening the link below. It expires in 1 hour.',
          '',
          url,
          '',
          'If you did not request this, ignore this email.',
          '',
          '— Maan Center'
        ].join('\n'),
        html: `
          <p>Hi ${user.name || ''},</p>
          <p>Reset your password by opening the link below. It expires in 1 hour.</p>
          <p><a href="${url}">${url}</a></p>
          <p>If you did not request this, ignore this email.</p>
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
