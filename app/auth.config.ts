// Better Auth client configuration (Phase 4).
//
// The admin client plugin mirrors the server-side admin plugin so client code
// can read `user.role` from the session without manual augmentation.

import { defineClientAuth } from '@onmax/nuxt-better-auth/config'
import { adminClient } from 'better-auth/client/plugins'

export default defineClientAuth({
  plugins: [adminClient()]
})
