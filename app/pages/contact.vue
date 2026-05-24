<script setup lang="ts">
const { getPageSeo } = useMaanContent()
const { getFormBlockById, getFormById } = useMaanForms()

const contactBlockId = '185eca12-4af1-4a1c-bfd7-4bc2fab52097'
const contactFormId = '36493b64-2bad-4c58-9d70-785ccb12ee26'
const fallbackContactForm = createMaanContactFormFallback('en')

const { data: pageSeo } = await useAsyncData<MaanSeo>('maan-page-seo-contact', () => getPageSeo('/contact', {
  title: 'Contact Maan Special Education Center',
  description: 'Contact Maan Special Education Center to ask about assessment, individualized education planning, therapy services, and family support.'
}))
const { data: contactForm } = await useAsyncData<MaanFormBlock>('maan-contact-form', async () => {
  const block = await getFormBlockById(contactBlockId)

  if (block) {
    return block
  }

  const form = await getFormById(contactFormId)

  return form
    ? {
        id: 'maan-contact-form-fallback',
        tagline: 'Contact',
        headline: 'Ask about assessment, therapy, and individualized education support',
        form
      }
    : fallbackContactForm
}, {
  default: () => fallbackContactForm
})

const resolvedSeo = useMaanSeo({
  seo: pageSeo.value || undefined,
  fallback: {
    title: 'Contact Maan Special Education Center',
    description: 'Contact Maan Special Education Center to ask about assessment, individualized education planning, therapy services, and family support.'
  },
  ogFallback: {
    title: 'Start a conversation about support',
    description: 'Ask about assessment, education plans, therapy services, and family guidance for your child.',
    eyebrow: 'Contact Maan',
    locale: 'en'
  }
})

useSchemaOrg([
  defineWebPage({
    name: resolvedSeo.title,
    description: resolvedSeo.description,
    inLanguage: 'en'
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Contact', item: '/contact' }
    ]
  })
])
</script>

<template>
  <div class="maan-page">
    <section class="maan-contact-hero border-b border-default">
      <UContainer class="grid gap-10 py-12 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div class="max-w-3xl pt-4 lg:order-first lg:pt-10">
          <UBadge
            color="primary"
            variant="subtle"
            class="mb-5"
          >
            Contact Maan
          </UBadge>
          <h1 class="maan-hero-title text-4xl font-semibold text-highlighted sm:text-5xl">
            Start with a conversation about your child’s needs.
          </h1>
          <p class="maan-hero-copy mt-5 text-lg leading-8 text-muted">
            Share what you are looking for and the Maan team will follow up about assessment, therapy, education planning, or family guidance.
          </p>
        </div>

        <div class="order-first lg:order-last">
          <MaanForm
            :block="contactForm"
            locale="en"
            variant="card"
          />
        </div>
      </UContainer>
    </section>
  </div>
</template>
