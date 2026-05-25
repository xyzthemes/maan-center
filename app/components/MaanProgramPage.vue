<script setup lang="ts">
import type { ProgramContent } from '~/composables/useMaanPrograms'

const props = withDefaults(defineProps<{
  program: ProgramContent
  locale: 'en' | 'ar'
  posts: MaanPost[]
  /**
   * Layer 2 — admin-added FAQ items appended to the structural FAQ from
   * useMaanPrograms. Optional + empty by default so the component stays
   * back-compat with callers that don't yet fetch them.
   */
  extraFaqs?: Array<{ q: string, a: string }>
}>(), {
  extraFaqs: () => []
})

const resolvedFaqs = computed(() => [
  ...props.program.faqs.map(f => ({ q: f.q, a: f.a })),
  ...props.extraFaqs
])

const isAr = computed(() => props.locale === 'ar')

const bandClass = computed(() => {
  switch (props.program.variant) {
    case 'down': return 'maan-band--down'
    case 'ld': return 'maan-band--ld'
    default: return 'maan-band--autism'
  }
})
const eyebrowClass = computed(() => {
  switch (props.program.variant) {
    case 'down': return 'maan-eyebrow--down'
    case 'ld': return 'maan-eyebrow--ld'
    default: return ''
  }
})
const iconClass = computed(() => {
  switch (props.program.variant) {
    case 'down': return 'maan-card-icon--down'
    case 'ld': return 'maan-card-icon--ld'
    default: return ''
  }
})

const contactPath = computed(() => isAr.value ? '/ar/contact' : '/contact')
const blogPath = computed(() => isAr.value ? '/ar/blog' : '/blog')
const whatsappHref = computed(() => isAr.value
  ? 'https://wa.me/97332055666?text=' + encodeURIComponent('أود استشارة بخصوص طفلي')
  : 'https://wa.me/97332055666?text=' + encodeURIComponent('I would like a consultation about my child')
)
</script>

<template>
  <div class="maan-page">
    <!-- HERO -->
    <section :class="['maan-hero border-b']">
      <UContainer class="py-14 sm:py-20">
        <div class="mx-auto max-w-3xl text-center">
          <span :class="['maan-eyebrow', eyebrowClass]">
            {{ program.eyebrow }}
          </span>
          <h1 class="maan-hero-title mt-5 text-4xl font-bold sm:text-5xl">
            {{ program.title }}
          </h1>
          <p class="maan-hero-copy mx-auto mt-5 max-w-2xl text-lg">
            {{ program.lead }}
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <NuxtLink
              :to="contactPath"
              class="maan-cta-btn"
            >
              <UIcon
                name="i-lucide-calendar-check"
                class="size-5"
              />
              <span>{{ program.ctaPrimaryLabel }}</span>
            </NuxtLink>
            <a
              :href="whatsappHref"
              target="_blank"
              rel="noopener noreferrer"
              class="maan-ghost-btn"
            >
              <UIcon
                name="i-lucide-message-circle"
                class="size-5"
              />
              <span>{{ program.ctaSecondaryLabel }}</span>
            </a>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- WHO -->
    <section :class="['maan-section maan-band', bandClass]">
      <UContainer class="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div class="lg:sticky lg:top-28">
          <h2 class="maan-h2">
            {{ program.whoHeading }}
          </h2>
        </div>
        <ul class="grid gap-3">
          <li
            v-for="(item, i) in program.whoItems"
            :key="i"
            class="maan-card flex items-start gap-3"
          >
            <UIcon
              name="i-lucide-check-circle-2"
              class="size-5 mt-0.5 shrink-0"
              :style="`color: var(--maan-${program.variant === 'autism' ? 'autism' : program.variant === 'down' ? 'down' : 'ld'});`"
            />
            <span
              class="text-base"
              style="color: var(--maan-ink);"
            >{{ item }}</span>
          </li>
        </ul>
      </UContainer>
    </section>

    <!-- ASSESSMENT -->
    <section class="maan-section">
      <UContainer>
        <div class="mx-auto max-w-2xl text-center">
          <span :class="['maan-eyebrow', eyebrowClass]">{{ program.assessHeading }}</span>
          <h2 class="maan-h2 mt-4">
            {{ program.assessHeading }}
          </h2>
          <p class="maan-lead mx-auto mt-4">
            {{ program.assessIntro }}
          </p>
        </div>
        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <div
            v-for="tool in program.assessItems"
            :key="tool.name"
            class="maan-card"
          >
            <div :class="['maan-card-icon', iconClass]">
              <UIcon
                :name="tool.icon"
                class="size-6"
              />
            </div>
            <h3 class="maan-card-title">
              {{ tool.name }}
            </h3>
            <p class="maan-card-body mt-2">
              {{ tool.desc }}
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- METHODS -->
    <section :class="['maan-section maan-band', bandClass]">
      <UContainer>
        <div class="mx-auto max-w-2xl text-center">
          <span :class="['maan-eyebrow', eyebrowClass]">{{ program.methodsHeading }}</span>
          <h2 class="maan-h2 mt-4">
            {{ program.methodsHeading }}
          </h2>
          <p class="maan-lead mx-auto mt-4">
            {{ program.methodsIntro }}
          </p>
        </div>
        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <div
            v-for="m in program.methodsItems"
            :key="m.name"
            class="maan-card"
          >
            <div :class="['maan-card-icon', iconClass]">
              <UIcon
                :name="m.icon"
                class="size-6"
              />
            </div>
            <h3 class="maan-card-title">
              {{ m.name }}
            </h3>
            <p class="maan-card-body mt-2">
              {{ m.desc }}
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- FAMILY INVOLVEMENT -->
    <section class="maan-section">
      <UContainer class="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <span :class="['maan-eyebrow', eyebrowClass]">{{ program.involvementHeading }}</span>
          <h2 class="maan-h2 mt-4">
            {{ program.involvementHeading }}
          </h2>
          <p class="maan-lead mt-4">
            {{ program.involvementBody }}
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <NuxtLink
              :to="contactPath"
              class="maan-cta-btn"
            >
              <UIcon
                name="i-lucide-calendar-check"
                class="size-5"
              />
              <span>{{ program.ctaPrimaryLabel }}</span>
            </NuxtLink>
          </div>
        </div>
        <div class="maan-card p-8">
          <ol class="space-y-5">
            <li
              v-for="(step, i) in program.processSteps"
              :key="step.title"
              class="flex gap-4"
            >
              <span
                class="grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold"
                :style="`background: color-mix(in srgb, var(--maan-${program.variant === 'autism' ? 'autism' : program.variant === 'down' ? 'down' : 'ld'}) 18%, transparent); color: var(--maan-${program.variant === 'autism' ? 'autism' : program.variant === 'down' ? 'down' : 'ld'});`"
              >
                {{ isAr ? ['١', '٢', '٣', '٤'][i] : i + 1 }}
              </span>
              <div>
                <p
                  class="font-semibold"
                  style="color: var(--maan-ink);"
                >
                  {{ step.title }}
                </p>
                <p
                  class="mt-1 text-sm"
                  style="color: var(--maan-ink-muted);"
                >
                  {{ step.body }}
                </p>
              </div>
            </li>
          </ol>
        </div>
      </UContainer>
    </section>

    <!-- FAQ -->
    <section :class="['maan-section maan-band', bandClass]">
      <UContainer class="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div class="lg:sticky lg:top-28">
          <span :class="['maan-eyebrow', eyebrowClass]">{{ program.faqHeading }}</span>
          <h2 class="maan-h2 mt-4">
            {{ program.faqHeading }}
          </h2>
        </div>
        <MaanFaq :items="resolvedFaqs" />
      </UContainer>
    </section>

    <!-- RELATED ARTICLES -->
    <section
      v-if="posts.length"
      class="maan-section"
    >
      <UContainer>
        <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 class="maan-h2">
            {{ program.relatedHeading }}
          </h2>
          <NuxtLink
            :to="blogPath"
            class="maan-ghost-btn"
          >
            <span>{{ isAr ? 'كل المقالات' : 'All articles' }}</span>
            <UIcon
              :name="isAr ? 'i-lucide-arrow-left' : 'i-lucide-arrow-right'"
              class="size-4"
            />
          </NuxtLink>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <article
            v-for="post in posts"
            :key="post.slug"
            class="maan-card group"
          >
            <UBadge
              color="primary"
              variant="subtle"
            >
              {{ post.category }}
            </UBadge>
            <h3 class="maan-card-title mt-4">
              <NuxtLink
                :to="`${blogPath}/${post.slug}`"
                class="hover:underline"
              >
                {{ post.title }}
              </NuxtLink>
            </h3>
            <p class="maan-card-body mt-2 line-clamp-3">
              {{ post.description }}
            </p>
          </article>
        </div>
      </UContainer>
    </section>

    <!-- FINAL CTA -->
    <section class="maan-section maan-band">
      <UContainer>
        <div class="maan-card mx-auto max-w-4xl p-8 text-center sm:p-12">
          <h2 class="maan-h2">
            {{ program.ctaHeading }}
          </h2>
          <p class="maan-lead mx-auto mt-4">
            {{ program.ctaBody }}
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <NuxtLink
              :to="contactPath"
              class="maan-cta-btn"
            >
              <UIcon
                name="i-lucide-calendar-check"
                class="size-5"
              />
              <span>{{ program.ctaPrimaryLabel }}</span>
            </NuxtLink>
            <a
              :href="whatsappHref"
              target="_blank"
              rel="noopener noreferrer"
              class="maan-ghost-btn"
            >
              <UIcon
                name="i-lucide-message-circle"
                class="size-5"
              />
              <span>{{ program.ctaSecondaryLabel }}</span>
            </a>
          </div>
          <p
            class="mt-6 text-xs"
            style="color: var(--maan-ink-muted);"
          >
            {{ isAr ? 'بياناتكم مشفرة وآمنة ولا يتم مشاركتها.' : 'Your data is encrypted, secure, and never shared.' }}
          </p>
        </div>
      </UContainer>
    </section>
  </div>
</template>
