<script setup lang="ts">
const props = defineProps<{
  locale?: 'en' | 'ar'
}>()
const isAr = computed(() => props.locale === 'ar')
const contactPath = computed(() => isAr.value ? '/ar/contact' : '/contact')
const waHref = computed(() => isAr.value
  ? 'https://wa.me/97332055666?text=' + encodeURIComponent('أود استشارة بخصوص طفلي')
  : 'https://wa.me/97332055666?text=' + encodeURIComponent('I would like a consultation about my child')
)
</script>

<template>
  <div
    class="maan-card p-6 sm:p-8"
    style="border-top: 4px solid var(--maan-cta);"
  >
    <p
      class="text-xs font-semibold uppercase tracking-wider"
      style="color: var(--maan-cta);"
    >
      {{ isAr ? 'استشارة' : 'Free consultation' }}
    </p>
    <h3
      class="mt-2 text-xl font-bold"
      style="color: var(--maan-ink);"
    >
      {{ isAr
        ? 'هل لديكم سؤال محدد عن طفلكم؟'
        : 'Have a specific question about your child?' }}
    </h3>
    <p
      class="mt-2 text-sm"
      style="color: var(--maan-ink-muted);"
    >
      {{ isAr
        ? 'فريق مركز معاً جاهز للرد خلال يوم العمل. لا توجد التزامات وكل تواصل يبقى سرياً.'
        : 'The Maan team replies within one working day. No obligation, every conversation stays confidential.' }}
    </p>
    <div class="mt-5 flex flex-wrap gap-3">
      <NuxtLink
        :to="contactPath"
        class="maan-cta-btn"
      >
        <UIcon
          name="i-lucide-calendar-check"
          class="size-5"
        />
        <span>{{ isAr ? 'احجز جلسة تقييم' : 'Book an assessment' }}</span>
      </NuxtLink>
      <a
        :href="waHref"
        target="_blank"
        rel="noopener noreferrer"
        class="maan-ghost-btn"
      >
        <UIcon
          name="i-lucide-message-circle"
          class="size-5"
        />
        <span>{{ isAr ? 'دردشة واتساب' : 'WhatsApp chat' }}</span>
      </a>
    </div>
  </div>
</template>
