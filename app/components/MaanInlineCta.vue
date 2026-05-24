<script setup lang="ts">
// Phase 8 — Small, embeddable mid-article CTA. Use anywhere inside a long
// post body to give the reader a clear next action without leaving the page.
// A/B-ready: pass `variant="now"` for "Book now" or `variant="journey"` for
// "Start your child’s journey" — both flow to /contact.

const props = withDefaults(defineProps<{
  locale?: 'en' | 'ar'
  variant?: 'now' | 'journey'
}>(), {
  locale: 'en',
  variant: 'now'
})

const isAr = computed(() => props.locale === 'ar')

const labelEn = computed(() => props.variant === 'journey' ? 'Start your child’s journey' : 'Book now')
const labelAr = computed(() => props.variant === 'journey' ? 'ابدأ رحلة طفلك' : 'احجز الآن')
const ctaLabel = computed(() => isAr.value ? labelAr.value : labelEn.value)

const heading = computed(() => isAr.value
  ? 'هل تحتاجون لاستشارة سريعة؟'
  : 'Need a quick consultation?')
const lead = computed(() => isAr.value
  ? 'املأوا طلب استشارة قصير، وسيتابع معكم أخصائي من فريق مركز معاً.'
  : 'Fill a short consultation request — a Maan specialist will follow up with you.')
const contactPath = computed(() => isAr.value ? '/ar/contact' : '/contact')
</script>

<template>
  <aside
    class="my-8 grid gap-3 rounded-2xl p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4 sm:p-6"
    style="background: linear-gradient(135deg, var(--maan-autism-soft), var(--maan-down-soft)); border: 1px solid var(--maan-line);"
  >
    <div>
      <p
        class="text-base font-bold"
        style="color: var(--maan-ink);"
      >
        {{ heading }}
      </p>
      <p
        class="mt-1 text-sm"
        style="color: var(--maan-ink-muted);"
      >
        {{ lead }}
      </p>
    </div>
    <NuxtLink
      :to="contactPath"
      class="maan-cta-btn justify-center"
    >
      <UIcon
        name="i-lucide-calendar-check"
        class="size-5"
      />
      <span>{{ ctaLabel }}</span>
    </NuxtLink>
  </aside>
</template>
