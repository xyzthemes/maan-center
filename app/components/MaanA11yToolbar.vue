<script setup lang="ts">
const props = defineProps<{ locale?: 'en' | 'ar' }>()
const { state, load, cycleScale, toggleMonochrome, toggleDyslexia, reset } = useMaanA11y()

onMounted(load)

const open = ref(false)
const t = computed(() => props.locale === 'ar'
  ? {
      open: 'إعدادات الوصول',
      close: 'إغلاق',
      title: 'إعدادات الوصول',
      scaleTitle: 'حجم الخط',
      scaleHint: { base: 'حجم افتراضي', lg: 'حجم متوسط', xl: 'حجم كبير' },
      monoTitle: 'وضع تباين هادئ',
      monoHint: 'يقلل المثيرات البصرية',
      dysTitle: 'خط مناسب لعسر القراءة',
      dysHint: 'يستخدم Atkinson Hyperlegible',
      reset: 'إعادة تعيين'
    }
  : {
      open: 'Accessibility settings',
      close: 'Close',
      title: 'Accessibility',
      scaleTitle: 'Text size',
      scaleHint: { base: 'Default', lg: 'Larger', xl: 'Largest' },
      monoTitle: 'Low-distraction mode',
      monoHint: 'Reduces visual stimulation',
      dysTitle: 'Dyslexia-friendly font',
      dysHint: 'Uses Atkinson Hyperlegible',
      reset: 'Reset'
    })
const scaleLabel = computed(() => t.value.scaleHint[state.value.scale])
</script>

<template>
  <div>
    <!-- Trigger -->
    <button
      type="button"
      class="maan-a11y-trigger"
      :aria-label="t.open"
      :aria-expanded="open"
      :title="t.open"
      @click="open = !open"
    >
      <UIcon
        name="i-lucide-accessibility"
        class="size-5"
      />
    </button>

    <!-- Drawer -->
    <Transition name="maan-fade">
      <div
        v-if="open"
        class="maan-a11y-panel"
        role="dialog"
        :aria-label="t.title"
      >
        <div class="flex items-center justify-between">
          <h2
            class="text-base font-bold"
            style="color: var(--maan-ink);"
          >
            {{ t.title }}
          </h2>
          <button
            type="button"
            class="rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus-visible:ring-2"
            style="--tw-ring-color: var(--maan-autism);"
            :aria-label="t.close"
            @click="open = false"
          >
            <UIcon
              name="i-lucide-x"
              class="size-4"
              style="color: var(--maan-ink-muted);"
            />
          </button>
        </div>

        <div class="mt-4 space-y-3">
          <!-- Text size -->
          <button
            type="button"
            class="maan-a11y-row"
            @click="cycleScale"
          >
            <span class="flex items-center gap-2.5">
              <UIcon
                name="i-lucide-type"
                class="size-4"
                style="color: var(--maan-autism);"
              />
              <span>
                <span
                  class="block font-semibold text-sm"
                  style="color: var(--maan-ink);"
                >{{ t.scaleTitle }}</span>
                <span
                  class="block text-xs"
                  style="color: var(--maan-ink-muted);"
                >{{ scaleLabel }}</span>
              </span>
            </span>
            <span
              class="maan-a11y-chip"
              :data-active="state.scale !== 'base'"
            >{{ state.scale === 'base' ? 'A' : state.scale === 'lg' ? 'A+' : 'A++' }}</span>
          </button>

          <!-- Monochrome -->
          <button
            type="button"
            class="maan-a11y-row"
            :data-active="state.monochrome"
            @click="toggleMonochrome"
          >
            <span class="flex items-center gap-2.5">
              <UIcon
                name="i-lucide-contrast"
                class="size-4"
                style="color: var(--maan-autism);"
              />
              <span>
                <span
                  class="block font-semibold text-sm"
                  style="color: var(--maan-ink);"
                >{{ t.monoTitle }}</span>
                <span
                  class="block text-xs"
                  style="color: var(--maan-ink-muted);"
                >{{ t.monoHint }}</span>
              </span>
            </span>
            <span
              class="maan-a11y-switch"
              :data-on="state.monochrome"
              aria-hidden="true"
            />
          </button>

          <!-- Dyslexia font -->
          <button
            type="button"
            class="maan-a11y-row"
            :data-active="state.dyslexia"
            @click="toggleDyslexia"
          >
            <span class="flex items-center gap-2.5">
              <UIcon
                name="i-lucide-book-a"
                class="size-4"
                style="color: var(--maan-autism);"
              />
              <span>
                <span
                  class="block font-semibold text-sm"
                  style="color: var(--maan-ink);"
                >{{ t.dysTitle }}</span>
                <span
                  class="block text-xs"
                  style="color: var(--maan-ink-muted);"
                >{{ t.dysHint }}</span>
              </span>
            </span>
            <span
              class="maan-a11y-switch"
              :data-on="state.dyslexia"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            class="maan-ghost-btn w-full justify-center text-sm"
            @click="reset"
          >
            <UIcon
              name="i-lucide-rotate-ccw"
              class="size-4"
            />
            <span>{{ t.reset }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
/* Toolbar styles use globally-available tokens, so .maan-* classes work
 * everywhere and don't depend on Vue's scoped style hoisting. */
.maan-a11y-trigger {
  position: fixed;
  bottom: 1.25rem;
  inset-inline-start: 1.25rem;
  z-index: 60;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  background: var(--maan-surface-alt);
  color: var(--maan-autism);
  border: 1px solid var(--maan-line);
  box-shadow: 0 12px 28px -8px rgba(15, 39, 65, 0.18);
  transition: transform .15s, box-shadow .2s;
}
.maan-a11y-trigger:hover { transform: translateY(-2px); box-shadow: 0 18px 36px -8px rgba(15, 39, 65, 0.22); }
.maan-a11y-trigger:focus-visible { outline: 3px solid var(--maan-autism); outline-offset: 3px; }
@media (max-width: 640px) { .maan-a11y-trigger { bottom: 5.25rem; } }

.maan-a11y-panel {
  position: fixed;
  bottom: 5.25rem;
  inset-inline-start: 1.25rem;
  z-index: 60;
  width: 19rem;
  max-width: calc(100vw - 2.5rem);
  border-radius: 1.25rem;
  border: 1px solid var(--maan-line);
  background: var(--maan-surface-alt);
  padding: 1rem;
  box-shadow: 0 30px 60px -28px rgba(15, 39, 65, 0.3);
}
@media (max-width: 640px) { .maan-a11y-panel { bottom: 9.5rem; } }

.maan-a11y-row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  padding: .65rem .75rem;
  border-radius: .85rem;
  border: 1px solid var(--maan-line);
  background: var(--maan-surface);
  text-align: start;
  cursor: pointer;
}
.maan-a11y-row:hover { background: color-mix(in srgb, var(--maan-autism-soft) 60%, var(--maan-surface)); }
.maan-a11y-row[data-active="true"] { border-color: var(--maan-autism); background: var(--maan-autism-soft); }
.maan-a11y-row:focus-visible { outline: 2px solid var(--maan-autism); outline-offset: 2px; }

.maan-a11y-chip {
  display: inline-grid;
  place-items: center;
  min-width: 2rem;
  height: 1.5rem;
  padding: 0 .5rem;
  border-radius: .6rem;
  background: var(--maan-surface);
  border: 1px solid var(--maan-line);
  font-weight: 700;
  font-size: .8rem;
  color: var(--maan-ink);
}
.maan-a11y-chip[data-active="true"] { background: var(--maan-autism); color: white; border-color: var(--maan-autism); }

.maan-a11y-switch {
  display: inline-block;
  position: relative;
  width: 2.25rem;
  height: 1.25rem;
  border-radius: 999px;
  background: var(--maan-line);
  transition: background-color .15s;
}
.maan-a11y-switch::after {
  content: "";
  position: absolute;
  inset-block-start: 2px;
  inset-inline-start: 2px;
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
  background: white;
  transition: transform .15s;
}
.maan-a11y-switch[data-on="true"] { background: var(--maan-autism); }
.maan-a11y-switch[data-on="true"]::after { transform: translateX(1rem); }
[dir="rtl"] .maan-a11y-switch[data-on="true"]::after { transform: translateX(-1rem); }

/* Apply preferences to the page. */
html.maan-text-lg { font-size: 17.5px; }
html.maan-text-xl { font-size: 20px; }

html.maan-monochrome,
html.maan-monochrome body {
  filter: grayscale(1) contrast(0.95);
}

html.maan-dyslexia,
html.maan-dyslexia body,
html.maan-dyslexia [class*="maan-"] {
  font-family: "Atkinson Hyperlegible", "Tajawal", system-ui, sans-serif !important;
  letter-spacing: 0.01em;
  word-spacing: 0.06em;
}

.maan-fade-enter-active, .maan-fade-leave-active { transition: opacity .15s, transform .15s; }
.maan-fade-enter-from, .maan-fade-leave-to { opacity: 0; transform: translateY(.5rem); }
</style>
