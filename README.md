# Maan Special Education Center

A bilingual Nuxt website and blog for a special education center. The site uses Nuxt UI, Nuxt SEO, and Directus content, and is prepared for one-click deployment on Railway.

## Stack

- Nuxt 4
- Nuxt UI
- Nuxt SEO
- Directus via `nuxt-directus`
- Railway Railpack deployment

## Deploy on Railway

This repo is ready to use as the source for a Railway template.

1. Push this repository to a public GitHub repo.
2. In Railway, create a new template from your workspace Templates page.
3. Add a service with this GitHub repo as the source.
4. Enable Public Networking with HTTP.
5. Confirm these service settings:
   - Pre-deploy command: leave blank
   - Start command: `pnpm start`
   - Healthcheck path: `/`
6. Add the variables below in the template composer.
7. Create the template, test deploy it, then publish it from the Railway Templates page.

Railway will read `railway.json`, which defines the Railpack builder, build command, start command, healthcheck, and restart policy. Do not put `pnpm build` in the pre-deploy command; pre-deploy runs after the image has already been built.

## Template Variables

Optional:

```bash
NUXT_PUBLIC_DIRECTUS_URL=https://your-directus.example
DIRECTUS_SERVER_TOKEN=directus-token-with-form-submission-create-access
NUXT_SITE_URL=https://your-domain.example
NUXT_SITE_INDEXABLE=true
NUXT_OG_IMAGE_SECRET=generated-secret
```

Leave `NUXT_PUBLIC_DIRECTUS_URL` blank for a public template unless the template also provisions a Directus service. Blank deployments use the bundled fallback posts and do not call Maan's production Directus backend.

`DIRECTUS_SERVER_TOKEN` is server-only and should not be prefixed with `NUXT_PUBLIC_`. It is required for live form submissions when Directus keeps anonymous users from creating `form_submissions`, which is the safer default.

If `NUXT_SITE_URL` is not set, the app will use Railway's `RAILWAY_PUBLIC_DOMAIN` when available. For local development, it falls back to `http://127.0.0.1:3000`.

Set `NUXT_SITE_INDEXABLE=false` for staging or private test deployments.

`NUXT_OG_IMAGE_SECRET` is only needed if you want dynamic OG image generation at runtime. Without it, Nuxt OG Image runs in zero-runtime mode so arbitrary image generation requests are disabled. Generate a secret with:

```bash
npx nuxt-og-image generate-secret
```

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Run the production server locally:

```bash
pnpm start
```

## Railway Template Publishing Notes

After creating the template, Railway gives you a template URL and template code. Add the public button to this README once you have that code:

```md
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/YOUR_TEMPLATE_CODE?utm_medium=integration&utm_source=template&utm_campaign=maan-special-education-center)
```

For a good public template listing, include:

- A live demo Railway project.
- A clear note that Directus is optional unless the template provisions its own CMS service.
- Screenshots of the English and Arabic pages.
- A note that deployers can eject the template repo into their own GitHub account after deployment.
