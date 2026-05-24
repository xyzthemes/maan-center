<script setup lang="ts">
// Dr. Osama Madbooly biography card.
// We DELIBERATELY DO NOT INVENT credentials, qualifications, license numbers,
// or years of experience. The body uses a safe placeholder until an
// official bio is provided. See TODO_IMPLEMENTATION_REFERENCES.md.
defineProps<{
  locale?: 'en' | 'ar'
}>()
</script>

<template>
  <section class="maan-card flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-start">
    <div
      class="size-24 shrink-0 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 grid place-items-center md:size-28"
      style="background: linear-gradient(135deg, var(--maan-autism-soft), var(--maan-down-soft));"
      aria-hidden="true"
    >
      <UIcon
        name="i-lucide-user-round"
        class="size-12"
        style="color: var(--maan-autism);"
      />
      <!-- TODO_IMPLEMENTATION_REFERENCES: replace with official portrait. -->
    </div>
    <div class="flex-1">
      <span class="maan-eyebrow">
        {{ locale === 'ar' ? 'فريق المركز' : 'Center Team' }}
      </span>
      <h3 class="maan-h2 mt-3 text-2xl sm:text-3xl">
        {{ locale === 'ar' ? 'د. أسامة مدبولي' : 'Dr. Osama Madbooly' }}
      </h3>
      <p class="maan-card-body mt-3">
        <template v-if="locale === 'ar'">
          مؤسس مركز معاً للتربية الخاصة ومرجع متخصص في تقييم اضطراب طيف التوحد ومتلازمة داون وصعوبات التعلم.
          يقود د. أسامة تصميم الخطط التعليمية الفردية وتدريب الفرق العلاجية ومرافقة الأسر خطوة بخطوة.
        </template>
        <template v-else>
          Founder of Maan Special Education Center and a specialist reference in assessing autism spectrum disorder,
          Down syndrome, and learning difficulties. Dr. Osama leads the design of individualized education plans,
          the training of therapy teams, and family guidance throughout the journey.
        </template>
      </p>
      <!-- TODO_IMPLEMENTATION_REFERENCES:
           Full official biography (qualifications, accreditations, years of
           experience, languages) is pending from the client. Do not invent. -->
      <ul class="mt-4 flex flex-wrap gap-2 text-xs font-medium">
        <li
          class="rounded-full px-3 py-1"
          style="background: var(--maan-autism-soft); color: var(--maan-autism);"
        >
          {{ locale === 'ar' ? 'اضطراب طيف التوحد' : 'Autism Spectrum' }}
        </li>
        <li
          class="rounded-full px-3 py-1"
          style="background: var(--maan-down-soft); color: var(--maan-down);"
        >
          {{ locale === 'ar' ? 'متلازمة داون' : 'Down Syndrome' }}
        </li>
        <li
          class="rounded-full px-3 py-1"
          style="background: var(--maan-ld-soft); color: var(--maan-ld);"
        >
          {{ locale === 'ar' ? 'صعوبات التعلم' : 'Learning Difficulties' }}
        </li>
      </ul>
    </div>
  </section>
</template>
