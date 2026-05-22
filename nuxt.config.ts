// https://nuxt.com/docs/api/configuration/nuxt-config
const railwaySiteUrl = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : undefined
const siteUrl = process.env.NUXT_SITE_URL || railwaySiteUrl || 'http://127.0.0.1:3000'
const siteName = 'Maan Special Education Center'
const siteDescription = 'Individualized education, therapy, and family support for children with diverse learning needs.'
const directusUrl = process.env.NUXT_PUBLIC_DIRECTUS_URL
  || process.env.DIRECTUS_URL
  || ''
const directusToken = process.env.DIRECTUS_SERVER_TOKEN
  || process.env.DIRECTUS_TOKEN
  || ''
const ogImageSecret = process.env.NUXT_OG_IMAGE_SECRET
const indexable = process.env.NUXT_SITE_INDEXABLE
  ? process.env.NUXT_SITE_INDEXABLE === 'true'
  : process.env.NODE_ENV === 'production' || process.env.NUXT_SITE_ENV === 'production'

export default defineNuxtConfig({
  modules: ['@nuxtjs/seo', '@nuxt/eslint', '@nuxt/ui', 'nuxt-directus'],

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

  runtimeConfig: {
    directusToken,
    public: {
      siteUrl,
      directus: {
        url: directusUrl
      }
    }
  },

  compatibilityDate: '2025-01-15',

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
