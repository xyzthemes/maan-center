<script setup lang="ts">
// Shared blog-article renderer. Factored out of `app/pages/blog/[slug].vue`
// (S9) so the authenticated dashboard draft preview renders an unpublished
// post through the EXACT same hero + prose markup as the published page —
// preview == published, no divergence.
//
// Page-specific chrome (related aside, share row, author, CTA) stays in the
// page via slots, so the public article keeps its existing layout untouched.
defineProps<{
  post: MaanPost
}>()
</script>

<template>
  <article class="maan-page">
    <section class="maan-blog-hero border-b">
      <UContainer class="py-14 sm:py-20">
        <div class="mx-auto max-w-3xl">
          <span class="maan-eyebrow">
            {{ post.category }}
          </span>
          <h1 class="maan-hero-title mt-5 text-4xl font-bold sm:text-5xl">
            {{ post.title }}
          </h1>
          <p class="maan-hero-copy mt-5 text-lg">
            {{ post.description }}
          </p>
          <div
            class="mt-6 flex flex-wrap items-center gap-3 text-sm"
            style="color: var(--maan-ink-muted);"
          >
            <span class="inline-flex items-center gap-1.5">
              <UIcon
                name="i-lucide-calendar"
                class="size-4"
              />
              <NuxtTime
                :datetime="post.publishedAt"
                month="long"
                day="numeric"
                year="numeric"
              />
            </span>
            <span aria-hidden="true">·</span>
            <span class="inline-flex items-center gap-1.5">
              <UIcon
                name="i-lucide-clock"
                class="size-4"
              />
              {{ post.readTime }}
            </span>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_18rem]">
        <div class="maan-prose-card">
          <NuxtImg
            v-if="post.image"
            :src="post.image"
            :alt="post.title"
            sizes="100vw md:768px lg:760px"
            format="webp"
            loading="lazy"
            class="mb-10 aspect-video w-full rounded-2xl object-cover"
          />
          <!-- v-html: admin-authored rich text from dashboard editor; sanitize at source if XSS becomes a concern -->
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="maan-prose"
            v-html="post.content"
          />
          <!-- eslint-enable vue/no-v-html -->

          <!-- Footer region (share / author / CTA) is page-specific. -->
          <slot name="body-footer" />
        </div>

        <aside class="space-y-6">
          <slot name="aside" />
        </aside>
      </div>
    </UContainer>
  </article>
</template>
