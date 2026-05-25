// Public read of a Form by its stable slug. Used by the new
// `/forms/<slug>` and `/ar/forms/<slug>` pages. Returns the form
// wrapped in a synthetic FormBlock so MaanForm.vue can render it
// without a separate code path.
//
// Bilingual fields are passed through as JSON envelopes; the client
// composable (useMaanForms.getFormBySlug) resolves to one locale via
// pickLocale().

import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug is required.' })

  const form = await prisma.form.findUnique({
    where: { slug },
    include: { fields: { orderBy: { sort: 'asc' } } }
  })

  if (!form || !form.isActive) return { block: null }

  return {
    block: {
      id: `slug-${form.slug}`,
      headline: form.title,
      tagline: null,
      form: {
        id: form.id,
        slug: form.slug,
        title: form.title,
        isActive: form.isActive,
        submitLabel: form.submitLabel,
        onSuccess: form.onSuccess,
        successMessage: form.successMessage,
        successRedirectUrl: form.successRedirectUrl,
        fields: form.fields.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          help: f.help,
          validation: f.validation,
          width: f.width,
          choices: f.choices,
          required: f.required,
          sort: f.sort
        }))
      }
    }
  }
})
