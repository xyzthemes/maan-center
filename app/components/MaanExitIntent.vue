<script setup lang="ts">
// Phase 8 — Exit-intent popup offering a downloadable parent guide.
//
// DISABLED by default. Set `enabled` to `true` AND provide a real PDF URL
// once the client supplies the asset. Until then this component renders
// nothing — we never show an exit popup that points at a fake or missing
// download. See TODO_IMPLEMENTATION_REFERENCES.md.

const props = withDefaults(defineProps<{
  enabled?: boolean
  guideUrl?: string
  locale?: 'en' | 'ar'
}>(), {
  enabled: false,
  guideUrl: '',
  locale: 'en'
})

const visible = ref(false)
const dismissed = useState('maan-exit-intent-dismissed', () => false)

const t = computed(() => props.locale === 'ar'
  ? {
      title: 'قبل أن تغادر',
      lead: 'احصل على دليل الأسرة المجاني — خطوات عملية لدعم طفلك في المنزل.',
      cta: 'تحميل الدليل',
      no: 'لا، شكراً'
    }
  : {
      title: 'Before you go',
      lead: 'Get our free parent guide — practical steps for supporting your child at home.',
      cta: 'Download the guide',
      no: 'No thanks'
    })

const handleMouseOut = (e: MouseEvent) => {
  if (e.clientY <= 0 && !dismissed.value) visible.value = true
}

const dismiss = () => {
  visible.value = false
  dismissed.value = true
}

onMounted(() => {
  if (!props.enabled || !props.guideUrl) return
  document.addEventListener('mouseout', handleMouseOut)
})
onBeforeUnmount(() => {
  document.removeEventListener('mouseout', handleMouseOut)
})
</script>

<template>
  <!-- Rendered only when both the toggle is on AND a real guide URL exists. -->
  <Teleport
    v-if="enabled && guideUrl && visible"
    to="body"
  >
    <div
      class="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-6 backdrop-blur-sm"
      role="dialog"
      :aria-label="t.title"
      @click.self="dismiss"
    >
      <div
        class="maan-card max-w-md p-6 sm:p-8"
        style="border-top: 4px solid var(--maan-cta);"
      >
        <h2
          class="text-xl font-bold"
          style="color: var(--maan-ink);"
        >
          {{ t.title }}
        </h2>
        <p
          class="mt-3 text-sm"
          style="color: var(--maan-ink-muted);"
        >
          {{ t.lead }}
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a
            :href="guideUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="maan-cta-btn"
            @click="dismiss"
          >
            <UIcon
              name="i-lucide-download"
              class="size-5"
            />
            <span>{{ t.cta }}</span>
          </a>
          <button
            type="button"
            class="maan-ghost-btn"
            @click="dismiss"
          >
            {{ t.no }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
