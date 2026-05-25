// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = process.env.NUXT_SITE_URL || 'http://127.0.0.1:3000'
const siteName = 'Maan Special Education Center'
const siteDescription = 'Individualized education, therapy, and family support for children with diverse learning needs.'
const ogImageSecret = process.env.NUXT_OG_IMAGE_SECRET
const indexable = process.env.NUXT_SITE_INDEXABLE
  ? process.env.NUXT_SITE_INDEXABLE === 'true'
  : process.env.NODE_ENV === 'production' || process.env.NUXT_SITE_ENV === 'production'

export default defineNuxtConfig({
  modules: ['@nuxtjs/seo', '@nuxt/eslint', '@nuxt/ui', '@onmax/nuxt-better-auth'],

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
    // Dashboard pages — admins only. Non-admin signed-in users hit 403.
    '/dashboard': { auth: { user: { role: 'admin' } } },
    '/dashboard/overview': { auth: { user: { role: 'admin' } } },
    '/dashboard/posts/**': { auth: { user: { role: 'admin' } } },
    '/dashboard/pages/**': { auth: { user: { role: 'admin' } } },
    '/dashboard/blocks/**': { auth: { user: { role: 'admin' } } },
    '/dashboard/forms/**': { auth: { user: { role: 'admin' } } },
    '/dashboard/settings/**': { auth: { user: { role: 'admin' } } },
    '/dashboard/submissions/**': { auth: { user: { role: 'admin' } } },
    '/ar/dashboard': { auth: { user: { role: 'admin' } } },
    '/ar/dashboard/overview': { auth: { user: { role: 'admin' } } },
    '/ar/dashboard/posts/**': { auth: { user: { role: 'admin' } } },
    '/ar/dashboard/pages/**': { auth: { user: { role: 'admin' } } },
    '/ar/dashboard/blocks/**': { auth: { user: { role: 'admin' } } },
    '/ar/dashboard/forms/**': { auth: { user: { role: 'admin' } } },
    '/ar/dashboard/settings/**': { auth: { user: { role: 'admin' } } },
    '/ar/dashboard/submissions/**': { auth: { user: { role: 'admin' } } },

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
