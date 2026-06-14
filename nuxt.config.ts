// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = process.env.NUXT_SITE_URL || 'http://127.0.0.1:3000'
const siteName = 'Maan Special Education Center'
const siteDescription = 'Individualized education, therapy, and family support for children with diverse learning needs.'
const ogImageSecret = process.env.NUXT_OG_IMAGE_SECRET
const indexable = process.env.NUXT_SITE_INDEXABLE
  ? process.env.NUXT_SITE_INDEXABLE === 'true'
  : process.env.NODE_ENV === 'production' || process.env.NUXT_SITE_ENV === 'production'

export default defineNuxtConfig({
  modules: ['@nuxtjs/seo', '@nuxt/eslint', '@nuxt/ui', '@nuxt/image', '@onmax/nuxt-better-auth'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: siteUrl,
    name: siteName,
    description: siteDescription,
    defaultLocale: 'en',
    trailingSlash: false,
    indexable
  },

  // Light mode is the brand default — Arabic-first sites perform better in
  // light surfaces for body-text legibility, and the calm palette is built
  // around it. Users who prefer dark can still toggle.
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

  runtimeConfig: {
    public: {
      siteUrl,
      // TODO_IMPLEMENTATION_REFERENCES: GA4 measurement ID + Google Search
      // Console verification token — leave empty until the client provides
      // them. The values are read in app.vue and only emit tags when set.
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || '',
      gscVerification: process.env.NUXT_PUBLIC_GSC_VERIFICATION || ''
    }
  },

  routeRules: {
    // Dashboard pages — admins + staff. Per-section access is enforced
    // by app/middleware/dashboard-permission.global.ts (client-side
    // redirect to /dashboard/overview when the staff user lacks the
    // section's scope) and by `requirePermission` on every API call.
    // The Staff section keeps `role: 'admin'` — staff never manage staff.
    '/dashboard': { auth: { user: { role: ['admin', 'staff'] } } },
    '/dashboard/overview': { auth: { user: { role: ['admin', 'staff'] } } },
    '/dashboard/posts/**': { auth: { user: { role: ['admin', 'staff'] } } },
    '/dashboard/pages/**': { auth: { user: { role: ['admin', 'staff'] } } },
    '/dashboard/blocks/**': { auth: { user: { role: ['admin', 'staff'] } } },
    '/dashboard/forms/**': { auth: { user: { role: ['admin', 'staff'] } } },
    '/dashboard/settings/**': { auth: { user: { role: ['admin', 'staff'] } } },
    '/dashboard/submissions/**': { auth: { user: { role: ['admin', 'staff'] } } },
    '/dashboard/staff/**': { auth: { user: { role: 'admin' } } },
    '/ar/dashboard': { auth: { user: { role: ['admin', 'staff'] } } },
    '/ar/dashboard/overview': { auth: { user: { role: ['admin', 'staff'] } } },
    '/ar/dashboard/posts/**': { auth: { user: { role: ['admin', 'staff'] } } },
    '/ar/dashboard/pages/**': { auth: { user: { role: ['admin', 'staff'] } } },
    '/ar/dashboard/blocks/**': { auth: { user: { role: ['admin', 'staff'] } } },
    '/ar/dashboard/forms/**': { auth: { user: { role: ['admin', 'staff'] } } },
    '/ar/dashboard/settings/**': { auth: { user: { role: ['admin', 'staff'] } } },
    '/ar/dashboard/submissions/**': { auth: { user: { role: ['admin', 'staff'] } } },
    '/ar/dashboard/staff/**': { auth: { user: { role: 'admin' } } },

    // Guest-only flows — already-signed-in users get bounced to the dashboard.
    '/dashboard/login': { auth: 'guest' },
    '/dashboard/forgot-password': { auth: 'guest' },
    '/dashboard/reset-password': { auth: 'guest' },
    '/ar/dashboard/login': { auth: 'guest' },
    '/ar/dashboard/forgot-password': { auth: 'guest' },
    '/ar/dashboard/reset-password': { auth: 'guest' }
  },

  compatibilityDate: '2025-01-15',

  // Better Auth (Phase 4). Login lives under the dashboard; protected routes
  // 302 there with a `?redirect=` query param for safe return-to behavior.
  auth: {
    redirects: {
      login: '/dashboard/login',
      guest: '/dashboard'
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // @nuxt/image (S12): blog assets live on the public Tigris bucket
  // (`<bucket>.fly.storage.tigris.dev`, see server/utils/storage/tigris.ts).
  // Allow-list that host so `<NuxtImg>`/`<NuxtPicture>` will optimize/transform
  // remote blog images. The default IPX provider serves resized/WebP variants.
  image: {
    domains: ['fly.storage.tigris.dev'],
    // Shared responsive breakpoints for blog hero + card imagery.
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    }
  },

  ogImage: {
    defaults: {
      width: 1200,
      height: 630,
      cacheMaxAgeSeconds: 60 * 60 * 24 * 7
    },
    zeroRuntime: !ogImageSecret,
    security: ogImageSecret
      ? {
          secret: ogImageSecret,
          strict: true
        }
      : undefined
  },

  robots: {
    blockNonSeoBots: true,
    groups: [
      { userAgent: '*', disallow: ['/design-demos/', '/dashboard/'] }
    ]
  },

  schemaOrg: {
    identity: 'Organization'
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/design-demos/**']
  }
})
