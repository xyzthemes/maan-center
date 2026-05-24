// Better Auth server configuration (Phase 4).
//
// Wires Better Auth's Prisma adapter to our singleton Prisma client. The admin
// plugin gives us role-based gating (`requireUserSession(event, { user: { role: 'admin' } })`)
// without writing custom middleware.

import { defineServerAuth } from '@onmax/nuxt-better-auth/config'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins/admin'
import { prisma } from './utils/db/client'

export default defineServerAuth(() => ({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  // Phase 4 ships email/password only. OAuth providers can land in a later phase.
  emailAndPassword: {
    enabled: true,
    autoSignIn: false
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
