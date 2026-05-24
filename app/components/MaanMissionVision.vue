<script setup lang="ts">
defineProps<{
  locale?: 'en' | 'ar'
}>()
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
        <template v-if="locale === 'ar'">
          أن يكون مركز معاً مرجعاً موثوقاً في البحرين لتمكين الأطفال ذوي اضطراب طيف التوحد ومتلازمة داون وصعوبات التعلم،
          ودعم أسرهم برؤية علمية وإنسانية.
        </template>
        <template v-else>
          To be a trusted reference in Bahrain for empowering children with autism spectrum disorder,
          Down syndrome, and learning difficulties — and supporting their families with a scientific and humane vision.
        </template>
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
        <template v-if="locale === 'ar'">
          نقدم تقييماً دقيقاً وخططاً تعليمية فردية وجلسات علاجية متكاملة في بيئة آمنة وهادئة،
          ونرافق الأسرة في كل خطوة على الطريق.
        </template>
        <template v-else>
          We provide accurate assessment, individualized education plans, and integrated therapy sessions in a calm, safe
          environment — walking alongside the family at every step of the journey.
        </template>
      </p>
    </div>
  </div>
</template>
