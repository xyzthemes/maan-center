<script setup lang="ts">
const props = withDefaults(defineProps<{
  locale?: 'en' | 'ar'
  /**
   * Layer 3 — Admin-edited mission + vision from the SiteSetting. When
   * not provided (or empty strings), the component falls back to the
   * structural copy below so the page never blanks out.
   */
  mission?: string
  vision?: string
}>(), {
  locale: 'en',
  mission: '',
  vision: ''
})

const resolvedMission = computed(() => {
  if (props.mission) return props.mission
  return props.locale === 'ar'
    ? 'نقدم تقييماً دقيقاً وخططاً تعليمية فردية وجلسات علاجية متكاملة في بيئة آمنة وهادئة، ونرافق الأسرة في كل خطوة على الطريق.'
    : 'We provide accurate assessment, individualized education plans, and integrated therapy sessions in a calm, safe environment — walking alongside the family at every step of the journey.'
})

const resolvedVision = computed(() => {
  if (props.vision) return props.vision
  return props.locale === 'ar'
    ? 'أن يكون مركز معاً مرجعاً موثوقاً في البحرين لتمكين الأطفال ذوي اضطراب طيف التوحد ومتلازمة داون وصعوبات التعلم، ودعم أسرهم برؤية علمية وإنسانية.'
    : 'To be a trusted reference in Bahrain for empowering children with autism spectrum disorder, Down syndrome, and learning difficulties — and supporting their families with a scientific and humane vision.'
})
</script>

<template>
  <div class="grid gap-6 md:grid-cols-2">
    <div
      class="maan-card border-t-4"
      style="border-top-color: var(--maan-autism);"
    >
      <div class="maan-card-icon">
        <UIcon
          name="i-lucide-eye"
          class="size-6"
        />
      </div>
      <h3 class="maan-card-title">
        {{ locale === 'ar' ? 'رؤيتنا' : 'Our Vision' }}
      </h3>
      <p class="maan-card-body mt-2">
        {{ resolvedVision }}
      </p>
    </div>
    <div
      class="maan-card border-t-4"
      style="border-top-color: var(--maan-down);"
    >
      <div class="maan-card-icon maan-card-icon--down">
        <UIcon
          name="i-lucide-target"
          class="size-6"
        />
      </div>
      <h3 class="maan-card-title">
        {{ locale === 'ar' ? 'رسالتنا' : 'Our Mission' }}
      </h3>
      <p class="maan-card-body mt-2">
        {{ resolvedMission }}
      </p>
    </div>
  </div>
</template>
