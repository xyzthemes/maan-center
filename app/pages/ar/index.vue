<script setup lang="ts">
const { getPosts } = useMaanContent()

const { data: posts } = await useAsyncData<MaanPost[]>('maan-home-posts-ar', async () => {
  const items = await getPosts('ar')

  return items.slice(0, 3)
}, {
  default: () => []
})

const services = [
  {
    icon: 'i-lucide-clipboard-check',
    title: 'خطط تعليمية فردية',
    description: 'أهداف عملية مبنية على التقييم والملاحظة ومراجعة التقدم بصورة مستمرة.'
  },
  {
    icon: 'i-lucide-message-circle-heart',
    title: 'النطق والتواصل',
    description: 'دعم للتواصل اللفظي والبديل والتفاعل الاجتماعي داخل الصف وخارجه.'
  },
  {
    icon: 'i-lucide-hand-heart',
    title: 'العلاج الوظيفي',
    description: 'دعم للمهارات الحركية الدقيقة والتنظيم الحسي ومهارات الحياة اليومية.'
  },
  {
    icon: 'i-lucide-users',
    title: 'إرشاد الأسرة',
    description: 'لقاءات وخطط منزلية تساعد الأسرة على مواصلة الدعم بثقة واتساق.'
  }
]

const pathways = [
  'التقييم الأولي والاستقبال',
  'خطة تعليمية فردية',
  'دعم علاجي وتعليمي',
  'مراجعة التقدم مع الأسرة'
]

useSeoMeta({
  title: 'مركز معا للتعليم الخاص',
  description: 'مركز معا للتعليم الخاص يقدم خططا تعليمية وعلاجية ودعما للأسرة للأطفال ذوي الاحتياجات التعليمية المتنوعة.'
})

useSchemaOrg([
  defineWebPage({
    name: 'مركز معا للتعليم الخاص',
    description: 'مركز معا للتعليم الخاص يقدم خططا تعليمية وعلاجية ودعما للأسرة للأطفال ذوي الاحتياجات التعليمية المتنوعة.',
    inLanguage: 'ar'
  }),
  defineItemList({
    name: 'دعم التعليم الخاص والعلاج',
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': service.title,
      'description': service.description
    }))
  })
])
</script>

<template>
  <div class="maan-page">
    <section class="maan-hero border-b border-default">
      <UContainer class="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div class="max-w-3xl">
          <UBadge
            color="primary"
            variant="subtle"
            class="mb-5"
          >
            مركز للتعليم الخاص
          </UBadge>
          <h1 class="maan-hero-title text-5xl font-semibold text-highlighted sm:text-6xl">
            دعم تعليمي مصمم حول احتياجات كل طفل.
          </h1>
          <p class="maan-hero-copy mt-6 max-w-2xl text-lg leading-8 text-muted">
            يساعد مركز معا الأطفال على بناء التواصل والاستقلالية والثقة الاجتماعية والاستعداد الأكاديمي من خلال خطط فردية وفريق علاجي وتعليمي متكامل.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              to="#programs"
              size="xl"
              trailing-icon="i-lucide-arrow-left"
            >
              استكشف البرامج
            </UButton>
            <UButton
              to="/ar/blog"
              color="neutral"
              variant="subtle"
              size="xl"
              icon="i-lucide-book-open"
            >
              اقرأ المدونة
            </UButton>
          </div>
        </div>

        <div class="maan-garden-visual">
          <div class="maan-photo-card">
            <img
              src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Autistic_children_receiving_individual_education_in_special_classes_%28FL63605208%29.jpg"
              alt="معلمة تدعم أطفالا خلال أنشطة تعليمية فردية"
            >
          </div>
          <div class="maan-path-card">
            ممارسة
          </div>
          <div class="maan-path-card">
            تكرار
          </div>
          <div class="maan-note-card">
            <p class="text-sm font-medium text-highlighted">
              فريق رعاية متكامل
            </p>
            <p class="mt-1 text-sm leading-6 text-muted">
              يعمل المعلمون والمعالجون والأسرة من خلال خطة مشتركة واحدة.
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <UPageSection
      id="programs"
      class="maan-programs"
      title="برامج تساعد على تقدم ثابت"
      description="خدمات تعليمية وعلاجية مصممة حول نقاط القوة والاحتياجات والروتين اليومي لكل طفل."
      :features="services"
    />

    <section class="maan-section-band border-y border-default">
      <UContainer class="grid gap-10 py-16 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div>
          <UBadge
            color="secondary"
            variant="subtle"
            class="mb-4"
          >
            آلية الدعم
          </UBadge>
          <h2 class="text-3xl font-semibold text-highlighted sm:text-4xl">
            خطوات واضحة للأسرة من التقييم إلى مراجعة التقدم.
          </h2>
          <p class="mt-5 text-base leading-7 text-muted">
            يحافظ المركز على خطة عملية وتعاونية بأهداف مفهومة للمعلمين والمعالجين ومقدمي الرعاية.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="(pathway, index) in pathways"
            :key="pathway"
            class="maan-garden-card p-6"
          >
            <div class="maan-step-number mb-5 flex size-10 items-center justify-center text-sm font-semibold">
              {{ index + 1 }}
            </div>
            <h3 class="text-lg font-semibold text-highlighted">
              {{ pathway }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-muted">
              خطوات عملية وملاحظات مشتركة وأهداف قابلة للقياس تساعد الخطة على التقدم.
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-16 sm:py-20">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <UBadge
            color="primary"
            variant="subtle"
            class="mb-4"
          >
            أحدث المقالات
          </UBadge>
          <h2 class="text-3xl font-semibold text-highlighted">
            إرشادات للدعم اليومي
          </h2>
        </div>
        <UButton
          to="/ar/blog"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-arrow-left"
        >
          عرض الكل
        </UButton>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <article
          v-for="post in posts"
          :key="post.slug"
          class="maan-garden-card group p-6 transition hover:-translate-y-1"
        >
          <UBadge
            color="neutral"
            variant="soft"
          >
            {{ post.category }}
          </UBadge>
          <h3 class="mt-5 text-xl font-semibold leading-7 text-highlighted">
            <NuxtLink :to="`/ar/blog/${post.slug}`">
              {{ post.title }}
            </NuxtLink>
          </h3>
          <p class="mt-3 line-clamp-3 text-sm leading-6 text-muted">
            {{ post.description }}
          </p>
          <div class="mt-6 flex items-center justify-between text-sm text-muted">
            <NuxtTime
              :datetime="post.publishedAt"
              month="short"
              day="numeric"
              locale="ar"
            />
            <UIcon
              name="i-lucide-arrow-left"
              class="size-4 text-primary transition group-hover:-translate-x-1"
            />
          </div>
        </article>
      </div>
    </UContainer>
  </div>
</template>
