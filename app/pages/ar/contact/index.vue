<script setup lang="ts">
const { getPageSeo } = useMaanContent()
const { getFormBlockById, getFormById } = useMaanForms()

const contactBlockId = '6e36ad33-e4a5-413f-8b7d-11e7fb909cf9'
const contactFormId = '36493b64-2bad-4c58-9d70-785ccb12ee26'
const fallbackContactForm = createMaanContactFormFallback('ar')

const { data: pageSeo } = await useAsyncData<MaanSeo>('maan-page-seo-contact-ar', () => getPageSeo('/ar/contact', {
  title: 'تواصل مع مركز معاً للتربية الخاصة | البحرين',
  description: 'تواصلوا مع مركز معاً للتربية الخاصة في البحرين عبر واتساب أو الهاتف أو نموذج الاستفسار.'
}))
const { data: contactForm } = await useAsyncData<MaanFormBlock>('maan-contact-form-ar', async () => {
  const block = await getFormBlockById(contactBlockId)
  if (block) return block

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
    title: 'تواصل مع مركز معاً للتربية الخاصة | البحرين',
    description: 'تواصلوا مع مركز معاً للتربية الخاصة في البحرين عبر واتساب أو الهاتف أو نموذج الاستفسار.'
  },
  ogFallback: {
    title: 'ابدأ الحديث عن دعم طفلك',
    description: 'واتساب، اتصال، أو نموذج استفسار — اختر القناة الأنسب لك.',
    eyebrow: 'تواصل مع مركز معاً',
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
    <!-- HERO -->
    <section class="maan-contact-hero border-b">
      <UContainer class="py-14 sm:py-20">
        <div class="mx-auto max-w-3xl text-center">
          <span class="maan-eyebrow">
            <UIcon
              name="i-lucide-message-circle-heart"
              class="size-3.5"
            />
            تواصل مع مركز معاً
          </span>
          <h1 class="maan-hero-title mt-5 text-4xl font-bold sm:text-5xl">
            ابدأ الحديث عن دعم طفلك.
          </h1>
          <p class="maan-hero-copy mx-auto mt-5 max-w-2xl text-lg">
            اختر القناة الأنسب لكم — نتابع معكم خلال يوم العمل، وكل تواصل يبقى سرياً.
          </p>
        </div>
      </UContainer>
    </section>

    <!-- CHANNEL CARDS -->
    <section class="maan-section">
      <UContainer>
        <MaanContactChannels locale="ar" />
      </UContainer>
    </section>

    <!-- FORM -->
    <section
      id="enquiry-form"
      class="maan-section maan-band"
    >
      <UContainer class="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div class="lg:sticky lg:top-28">
          <span class="maan-eyebrow">استفسار الأسرة</span>
          <h2 class="maan-h2 mt-4">
            شاركونا تفاصيل بسيطة عن طفلكم.
          </h2>
          <p class="maan-lead mt-4">
            نستخدم هذه المعلومات لاقتراح الخطوة الأولى المناسبة — تقييم أولي أو جلسة علاجية محددة
            أو استشارة أسرية.
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
              <span>بياناتكم مشفرة وآمنة ولا يتم مشاركتها.</span>
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
              <span>الرد خلال يوم العمل.</span>
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
              <span>تتحدثون مع أخصائي وليس روبوت محادثة.</span>
            </li>
          </ul>
        </div>

        <div>
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
