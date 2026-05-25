<script setup lang="ts">
// Dr. Osama Madbooly biography card.
//
// Reads the `dr-osama-bio` SiteSetting (Layer 3) when present, falling
// back to the structural placeholder copy below. We deliberately
// don't invent credentials — when the admin fills in the setting, the
// real bio shows; otherwise the safe placeholder is visible.

const props = withDefaults(defineProps<{
  locale?: 'en' | 'ar'
  /** Override the headline shown above the name (e.g. "Center Team"). */
  eyebrow?: string
  /** Admin-provided name override. */
  name?: string
  /** Admin-provided one-line role/headline. */
  headline?: string
  /** Admin-provided bio body (plain text or HTML). */
  bio?: string
  /** Admin-provided specialty chips. Falls back to the structural three. */
  tags?: string[]
}>(), {
  locale: 'en',
  eyebrow: '',
  name: '',
  headline: '',
  bio: '',
  tags: () => []
})

const isAr = computed(() => props.locale === 'ar')

const resolvedEyebrow = computed(() => props.eyebrow
  || (isAr.value ? 'فريق المركز' : 'Center Team'))

const resolvedName = computed(() => props.name
  || (isAr.value ? 'د. أسامة مدبولي' : 'Dr. Osama Madbooly'))

// `headline` is a NEW concept (e.g. "Founder & Director") that's optional.
// Renders in a subdued line below the name when present.
const resolvedHeadline = computed(() => props.headline || '')

const resolvedBio = computed(() => {
  if (props.bio) return props.bio
  return isAr.value
    ? 'مؤسس مركز معاً للتربية الخاصة ومرجع متخصص في تقييم اضطراب طيف التوحد ومتلازمة داون وصعوبات التعلم. يقود د. أسامة تصميم الخطط التعليمية الفردية وتدريب الفرق العلاجية ومرافقة الأسر خطوة بخطوة.'
    : 'Founder of Maan Special Education Center and a specialist reference in assessing autism spectrum disorder, Down syndrome, and learning difficulties. Dr. Osama leads the design of individualized education plans, the training of therapy teams, and family guidance throughout the journey.'
})

// Each chip gets a colour by index — autism / down / ld — matching the
// program palette. When admins provide their own tag list, we still
// cycle through the three brand colours so the visual rhythm holds.
const fallbackTags = computed<string[]>(() => isAr.value
  ? ['اضطراب طيف التوحد', 'متلازمة داون', 'صعوبات التعلم']
  : ['Autism Spectrum', 'Down Syndrome', 'Learning Difficulties'])

const resolvedTags = computed(() => props.tags.length ? props.tags : fallbackTags.value)

const tagPalette = ['autism', 'down', 'ld'] as const
const tagStyle = (i: number): string => {
  const colour = tagPalette[i % tagPalette.length]
  return `background: var(--maan-${colour}-soft); color: var(--maan-${colour});`
}
</script>

<template>
  <section class="maan-card flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-start">
    <div
      class="size-24 shrink-0 rounded-full bg-linear-to-br from-sky-100 to-emerald-100 grid place-items-center md:size-28"
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
        {{ resolvedEyebrow }}
      </span>
      <h3 class="maan-h2 mt-3 text-2xl sm:text-3xl">
        {{ resolvedName }}
      </h3>
      <p
        v-if="resolvedHeadline"
        class="mt-1 text-sm font-medium"
        style="color: var(--maan-autism);"
      >
        {{ resolvedHeadline }}
      </p>
      <p
        class="maan-card-body mt-3 whitespace-pre-line"
      >
        {{ resolvedBio }}
      </p>
      <ul
        v-if="resolvedTags.length"
        class="mt-4 flex flex-wrap gap-2 text-xs font-medium"
      >
        <li
          v-for="(tag, i) in resolvedTags"
          :key="tag"
          class="rounded-full px-3 py-1"
          :style="tagStyle(i)"
        >
          {{ tag }}
        </li>
      </ul>
    </div>
  </section>
</template>
