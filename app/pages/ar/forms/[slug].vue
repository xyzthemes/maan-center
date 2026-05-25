<script setup lang="ts">
// Arabic mirror of `/forms/[slug]` — same form, Arabic side of the
// bilingual envelope. The composable handles `pickLocale` so this
// component stays nearly identical to the English version.

const route = useRoute()
const { getFormBySlug } = useMaanForms()

const slug = computed(() => String(route.params.slug || ''))

const { data: formBlock } = await useAsyncData<MaanFormBlock | undefined>(
  `maan-form-${slug.value}-ar`,
  () => getFormBySlug(slug.value, 'ar')
)

if (!formBlock.value) {
  throw createError({ statusCode: 404, statusMessage: 'النموذج غير موجود' })
}

const title = computed(() => formBlock.value?.form.title || 'نموذج')
const description = computed(() => formBlock.value?.headline || formBlock.value?.form.title || 'نموذج')

useSeoMeta({
  title: () => title.value,
  description: () => description.value,
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div
    class="maan-page"
    dir="rtl"
  >
    <section class="maan-blog-hero py-12 sm:py-16">
      <UContainer>
        <NuxtLink
          to="/ar"
          class="text-xs font-semibold uppercase tracking-wider hover:underline"
          style="color: var(--maan-autism);"
        >
          → معاً
        </NuxtLink>
        <h1
          class="maan-hero-title mt-3 text-3xl sm:text-4xl"
          style="color: var(--maan-ink);"
        >
          {{ title }}
        </h1>
      </UContainer>
    </section>

    <section class="maan-section">
      <UContainer class="max-w-3xl">
        <MaanForm
          :block="formBlock"
          locale="ar"
          variant="card"
        />
      </UContainer>
    </section>
  </div>
</template>
