<script setup lang="ts">
const { getPageSeo } = useMaanContent()
const { getFormBlockById, getFormById } = useMaanForms()

const contactBlockId = '185eca12-4af1-4a1c-bfd7-4bc2fab52097'
const contactFormId = '36493b64-2bad-4c58-9d70-785ccb12ee26'
const fallbackContactForm = createMaanContactFormFallback('en')

const { data: pageSeo } = await useAsyncData<MaanSeo>('maan-page-seo-contact', () => getPageSeo('/contact', {
  title: 'Contact Maan Special Education Center | Bahrain',
  description: 'Reach Maan Special Education Center in Bahrain. WhatsApp, phone, or the enquiry form — choose the channel that suits you.'
}))
const { data: contactForm } = await useAsyncData<MaanFormBlock>('maan-contact-form', async () => {
  const block = await getFormBlockById(contactBlockId, 'en')
  if (block) return block

  const form = await getFormById(contactFormId, 'en')
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
    title: 'Contact Maan Special Education Center | Bahrain',
    description: 'Reach Maan Special Education Center in Bahrain. WhatsApp, phone, or the enquiry form — choose the channel that suits you.'
  },
  ogFallback: {
    title: 'Start a conversation about your child’s support',
    description: 'WhatsApp, phone, or a written enquiry — three calm ways to reach the Maan team.',
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
    <!-- HERO -->
    <section class="maan-contact-hero border-b">
      <UContainer class="py-14 sm:py-20">
        <div class="mx-auto max-w-3xl text-center">
          <span class="maan-eyebrow">
            <UIcon
              name="i-lucide-message-circle-heart"
              class="size-3.5"
            />
            Contact Maan
          </span>
          <h1 class="maan-hero-title mt-5 text-4xl font-bold sm:text-5xl">
            Start a conversation about your child’s support.
          </h1>
          <p class="maan-hero-copy mx-auto mt-5 max-w-2xl text-lg">
            Choose the channel that suits you — we follow up within one working day. All conversations
            stay confidential.
          </p>
        </div>
      </UContainer>
    </section>

    <!-- CHANNEL CARDS (HeyLink replacement) -->
    <section class="maan-section">
      <UContainer>
        <MaanContactChannels locale="en" />
      </UContainer>
    </section>

    <!-- ENQUIRY FORM -->
    <section
      id="enquiry-form"
      class="maan-section maan-band"
    >
      <UContainer class="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div class="lg:sticky lg:top-28">
          <span class="maan-eyebrow">Family enquiry</span>
          <h2 class="maan-h2 mt-4">
            Tell us a little about your child.
          </h2>
          <p class="maan-lead mt-4">
            We use these details to recommend the right first step — initial assessment, a specific
            therapy, or a family consultation.
          </p>

          <ul class="mt-6 space-y-3 text-sm">
            <li
              class="flex items-start gap-2.5"
              style="color: var(--maan-ink);"
            >
              <UIcon
                name="i-lucide-shield-check"
                class="size-5 mt-0.5"
                style="color: var(--maan-down);"
              />
              <span>Your data is encrypted, secure, and never shared.</span>
            </li>
            <li
              class="flex items-start gap-2.5"
              style="color: var(--maan-ink);"
            >
              <UIcon
                name="i-lucide-clock"
                class="size-5 mt-0.5"
                style="color: var(--maan-autism);"
              />
              <span>Response within one working day.</span>
            </li>
            <li
              class="flex items-start gap-2.5"
              style="color: var(--maan-ink);"
            >
              <UIcon
                name="i-lucide-users-round"
                class="size-5 mt-0.5"
                style="color: var(--maan-ld);"
              />
              <span>You always speak with a specialist, not a chatbot.</span>
            </li>
          </ul>
        </div>

        <div>
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
