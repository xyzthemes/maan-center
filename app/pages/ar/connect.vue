<script setup lang="ts">
const groups = useMaanSocialLinks()

useSeoMeta({
  title: 'تواصل مع مركز معاً — جميع القنوات | مركز معاً للتربية الخاصة',
  description: 'كل قنوات مركز معاً للتربية الخاصة في مكان واحد — واتساب وإنستغرام وفيسبوك ويوتيوب ولينكدإن، إضافة إلى حسابات د. أسامة مدبولي الشخصية وحسابات التوعية.'
})

useSchemaOrg([
  defineWebPage({
    name: 'تواصل مع مركز معاً',
    description: 'كل قنوات التواصل والتوعية الرسمية لمركز معاً للتربية الخاصة وللدكتور أسامة مدبولي.',
    inLanguage: 'ar'
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'الرئيسية', item: '/ar' },
      { name: 'تواصل', item: '/ar/connect' }
    ]
  })
])
</script>

<template>
  <div class="maan-page">
    <section class="maan-hero border-b">
      <UContainer class="py-14 sm:py-20">
        <div class="mx-auto max-w-3xl text-center">
          <span class="maan-eyebrow">
            <UIcon
              name="i-lucide-share-2"
              class="size-3.5"
            />
            القنوات
          </span>
          <h1 class="maan-hero-title mt-5 text-4xl font-bold sm:text-5xl">
            كل طرق التواصل مع مركز معاً.
          </h1>
          <p class="maan-hero-copy mx-auto mt-5 max-w-2xl text-lg">
            القنوات الرسمية للمركز، وصوت د. أسامة مدبولي الشخصي،
            والمجتمعات المتخصصة التي يديرها حول متلازمة داون والتوحد
            وصعوبات التعلم والأمراض النادرة.
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <NuxtLink
              to="/ar/contact"
              class="maan-cta-btn"
            >
              <UIcon
                name="i-lucide-calendar-check"
                class="size-5"
              />
              <span>احجز جلسة تقييم</span>
            </NuxtLink>
            <a
              href="https://wa.me/97332055666?text=%D8%A3%D9%88%D8%AF%20%D8%A7%D8%B3%D8%AA%D8%B4%D8%A7%D8%B1%D8%A9%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%B7%D9%81%D9%84%D9%8A"
              target="_blank"
              rel="noopener noreferrer"
              class="maan-ghost-btn"
            >
              <UIcon
                name="i-lucide-message-circle"
                class="size-5"
              />
              <span>دردشة واتساب</span>
            </a>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <MaanSocialGrid
        :groups="groups"
        locale="ar"
      />
    </UContainer>
  </div>
</template>
