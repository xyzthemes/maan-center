<script setup lang="ts">
// Standalone public form page. Each admin-created form gets a stable
// URL: /forms/<slug> (English) and /ar/forms/<slug> (Arabic). Posts
// and external channels link here to direct visitors to a survey or
// intake without needing a bespoke page per form.

const route = useRoute()
const { getFormBySlug } = useMaanForms()

const slug = computed(() => String(route.params.slug || ''))

const { data: formBlock } = await useAsyncData<MaanFormBlock | undefined>(
  `maan-form-${slug.value}-en`,
  () => getFormBySlug(slug.value, 'en')
)

// 404 if the slug isn't published — keeps inactive surveys invisible to
// the public without requiring an extra "draft" badge in the editor.
if (!formBlock.value) {
  throw createError({ statusCode: 404, statusMessage: 'Form not found' })
}

const title = computed(() => formBlock.value?.form.title || 'Form')
const description = computed(() => formBlock.value?.headline || formBlock.value?.form.title || 'Form')

useSeoMeta({
  title: () => title.value,
  description: () => description.value,
  robots: 'noindex, nofollow' // surveys are rarely meant for the index
})
</script>

<template>
  <div class="maan-page">
    <section class="maan-blog-hero py-12 sm:py-16">
      <UContainer>
        <NuxtLink
          to="/"
          class="text-xs font-semibold uppercase tracking-wider hover:underline"
          style="color: var(--maan-autism);"
        >
          ← Maan
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
          locale="en"
          variant="card"
        />
      </UContainer>
    </section>
  </div>
</template>
