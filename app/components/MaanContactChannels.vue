<script setup lang="ts">
// HeyLink-replacement: a grid of direct contact channels.
//
// Phase 3 rule: do not invent social links. Only the WhatsApp + phone number
// provided by the client are wired. Everything else is marked TODO until
// confirmed and removed from this list rather than fabricated.
const props = defineProps<{
  locale?: 'en' | 'ar'
}>()

type Channel = {
  id: string
  label: string
  hint: string
  href: string
  icon: string
  variant: 'cta' | 'whatsapp' | 'call' | 'mail' | 'social'
  external?: boolean
}

const t = computed(() => props.locale === 'ar'
  ? {
      whatsappLabel: 'دردشة واتساب',
      whatsappHint: 'الأسرع للرد على الاستفسارات',
      callLabel: 'اتصال هاتفي',
      callHint: 'تواصل مباشر مع المركز',
      assessLabel: 'احجز جلسة تقييم',
      assessHint: 'املأ النموذج بالأسفل',
      scientificLabel: 'المرجع العلمي',
      scientificHint: 'مقالات وأدلة متخصصة',
      programsLabel: 'برامجنا',
      programsHint: 'توحد · داون · صعوبات التعلم',
      socialPending: 'سيتم إضافة الحسابات الرسمية للمركز هنا فور توفرها.'
    }
  : {
      whatsappLabel: 'WhatsApp chat',
      whatsappHint: 'Fastest way to reach the team',
      callLabel: 'Call us',
      callHint: 'Direct line to the center',
      assessLabel: 'Book assessment',
      assessHint: 'Fill the form below',
      scientificLabel: 'Scientific Reference',
      scientificHint: 'In-depth articles & guides',
      programsLabel: 'Our programs',
      programsHint: 'Autism · Down · Learning Difficulties',
      socialPending: 'Official social profiles will appear here once confirmed.'
    })

const isAr = computed(() => props.locale === 'ar')

const channels = computed<Channel[]>(() => [
  {
    id: 'whatsapp',
    label: t.value.whatsappLabel,
    hint: t.value.whatsappHint,
    href: 'https://wa.me/97332055666?text=' + encodeURIComponent('أود استشارة بخصوص طفلي'),
    icon: 'i-lucide-message-circle',
    variant: 'whatsapp',
    external: true
  },
  {
    id: 'call',
    label: t.value.callLabel,
    hint: t.value.callHint + ' · +97332055666',
    href: 'tel:+97332055666',
    icon: 'i-lucide-phone',
    variant: 'call'
  },
  {
    id: 'assess',
    label: t.value.assessLabel,
    hint: t.value.assessHint,
    href: '#enquiry-form',
    icon: 'i-lucide-calendar-check',
    variant: 'cta'
  },
  {
    id: 'scientific',
    label: t.value.scientificLabel,
    hint: t.value.scientificHint,
    href: isAr.value ? '/ar/blog' : '/blog',
    icon: 'i-lucide-book-open',
    variant: 'social'
  },
  {
    id: 'programs',
    label: t.value.programsLabel,
    hint: t.value.programsHint,
    href: isAr.value ? '/ar#programs' : '/#programs',
    icon: 'i-lucide-sparkles',
    variant: 'social'
  }
])

const styleFor = (variant: Channel['variant']) => {
  switch (variant) {
    case 'cta': return 'border-top: 4px solid var(--maan-cta);'
    case 'whatsapp': return 'border-top: 4px solid #25D366;'
    case 'call': return 'border-top: 4px solid var(--maan-autism);'
    case 'mail': return 'border-top: 4px solid var(--maan-ld);'
    default: return 'border-top: 4px solid var(--maan-down);'
  }
}
const iconColor = (variant: Channel['variant']) => {
  switch (variant) {
    case 'cta': return 'var(--maan-cta)'
    case 'whatsapp': return '#25D366'
    case 'call': return 'var(--maan-autism)'
    case 'mail': return 'var(--maan-ld)'
    default: return 'var(--maan-down)'
  }
}
</script>

<template>
  <div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!--
        We render the card markup once for the "external/href" case (anchor)
        and once for the "internal/route" case (NuxtLink). Using
        <component :is="'NuxtLink'"> with a string doesn't resolve the
        Nuxt component — the browser renders a literal <nuxtlink> element,
        which silently ignores clicks. The explicit branch fixes that.
      -->
      <template
        v-for="channel in channels"
        :key="channel.id"
      >
        <a
          v-if="channel.external || channel.href.startsWith('tel:') || channel.href.startsWith('mailto:') || channel.href.startsWith('#')"
          :href="channel.href"
          :target="channel.external ? '_blank' : undefined"
          :rel="channel.external ? 'noopener noreferrer' : undefined"
          class="maan-card group flex items-start gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :style="styleFor(channel.variant) + ' --tw-ring-color: var(--maan-autism);'"
        >
          <div
            class="grid size-12 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105"
            :style="`background: color-mix(in srgb, ${iconColor(channel.variant)} 14%, var(--maan-surface-alt)); color: ${iconColor(channel.variant)};`"
          >
            <UIcon
              :name="channel.icon"
              class="size-6"
            />
          </div>
          <div class="flex-1">
            <p
              class="font-semibold"
              style="color: var(--maan-ink);"
            >
              {{ channel.label }}
            </p>
            <p
              class="mt-1 text-sm"
              style="color: var(--maan-ink-muted);"
            >
              {{ channel.hint }}
            </p>
          </div>
          <UIcon
            name="i-lucide-arrow-up-right"
            class="size-4 opacity-50 transition group-hover:opacity-100"
            style="color: var(--maan-ink-muted);"
          />
        </a>

        <NuxtLink
          v-else
          :to="channel.href"
          class="maan-card group flex items-start gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :style="styleFor(channel.variant) + ' --tw-ring-color: var(--maan-autism);'"
        >
          <div
            class="grid size-12 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105"
            :style="`background: color-mix(in srgb, ${iconColor(channel.variant)} 14%, var(--maan-surface-alt)); color: ${iconColor(channel.variant)};`"
          >
            <UIcon
              :name="channel.icon"
              class="size-6"
            />
          </div>
          <div class="flex-1">
            <p
              class="font-semibold"
              style="color: var(--maan-ink);"
            >
              {{ channel.label }}
            </p>
            <p
              class="mt-1 text-sm"
              style="color: var(--maan-ink-muted);"
            >
              {{ channel.hint }}
            </p>
          </div>
          <UIcon
            name="i-lucide-arrow-up-right"
            class="size-4 opacity-50 transition group-hover:opacity-100"
            style="color: var(--maan-ink-muted);"
          />
        </NuxtLink>
      </template>
    </div>

    <!-- TODO_IMPLEMENTATION_REFERENCES: official social links (Instagram,
         Facebook, YouTube, etc.) — do not invent. -->
    <p
      class="mt-4 text-center text-xs"
      style="color: var(--maan-ink-muted);"
    >
      {{ t.socialPending }}
    </p>
  </div>
</template>
