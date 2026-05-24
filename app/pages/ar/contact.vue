<script setup lang="ts">
const { getPageSeo } = useMaanContent()
const { getFormBlockById, getFormById } = useMaanForms()

const contactBlockId = '6e36ad33-e4a5-413f-8b7d-11e7fb909cf9'
const contactFormId = '36493b64-2bad-4c58-9d70-785ccb12ee26'
const fallbackContactForm = createMaanContactFormFallback('ar')

const { data: pageSeo } = await useAsyncData<MaanSeo>('maan-page-seo-contact-ar', () => getPageSeo('/ar/contact', {
  title: 'تواصل مع مركز معا للتعليم الخاص',
  description: 'تواصل مع مركز معا للتعليم الخاص للسؤال عن التقييم والخطط التعليمية الفردية والجلسات العلاجية وإرشاد الأسرة.'
}))
const { data: contactForm } = await useAsyncData<MaanFormBlock>('maan-contact-form-ar', async () => {
  const block = await getFormBlockById(contactBlockId)

  if (block) {
    return block
  }

  const form = await getFormById(contactFormId)

  return form
    ? {
        id: 'maan-contact-form-fallback-ar',
        tagline: 'تواصل',
        headline: 'اسأل عن التقييم والخدمات العلاجية والدعم التعليمي الفردي',
        form
      }
    : fallbackContactForm
}, {
  default: () => fallbackContactForm
})

const resolvedSeo = useMaanSeo({
  seo: pageSeo.value || undefined,
  fallback: {
    title: 'تواصل مع مركز معا للتعليم الخاص',
    description: 'تواصل مع مركز معا للتعليم الخاص للسؤال عن التقييم والخطط التعليمية الفردية والجلسات العلاجية وإرشاد الأسرة.'
  },
  ogFallback: {
    title: 'ابدأ الحديث عن الدعم المناسب',
    description: 'اسأل عن التقييم والخطط التعليمية والجلسات العلاجية وإرشاد الأسرة المناسب لطفلك.',
    eyebrow: 'تواصل مع مركز معا',
    locale: 'ar'
  }
})

useSchemaOrg([
  defineWebPage({
    name: resolvedSeo.title,
    description: resolvedSeo.description,
    inLanguage: 'ar'
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'تواصل معنا', item: '/ar/contact' }
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
            تواصل مع مركز معا
          </UBadge>
          <h1 class="maan-hero-title text-4xl font-semibold text-highlighted sm:text-5xl">
            ابدأ الحديث عن احتياجات طفلك.
          </h1>
          <p class="maan-hero-copy mt-5 text-lg leading-8 text-muted">
            شارك ما تبحث عنه وسيتابع فريق مركز معا معك حول التقييم أو العلاج أو الخطة التعليمية أو إرشاد الأسرة.
          </p>
        </div>

        <div class="order-first lg:order-last">
          <MaanForm
            :block="contactForm"
            locale="ar"
            variant="card"
          />
        </div>
      </UContainer>
    </section>
  </div>
</template>
