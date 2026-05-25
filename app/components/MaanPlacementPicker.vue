<script setup lang="ts">
// Visual placement picker — used by both Post + Block editors.
//
// Renders each placement option as a card with: icon, label, target
// page, and a hint about where on that page the content lands. Click
// to toggle. Keeps the model type as `string[]` so server-side
// sanitization (`sanitizePlacements`) needs no changes.
//
// Picker UI replaces the prior flat USelectMenu chip list, which
// surfaced slug strings ("autism-program-related") that didn't tell
// admins much about WHERE the content would actually appear.

const props = defineProps<{
  modelValue: string[]
  locale?: 'en' | 'ar'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const { placements: taxonomyPlacements } = useMaanTaxonomy()
const { isArabic } = useDashboardI18n()
const lang = computed<'en' | 'ar'>(() => props.locale ?? (isArabic.value ? 'ar' : 'en'))

const selected = computed({
  get: () => props.modelValue,
  set: (v: string[]) => emit('update:modelValue', v)
})

const isSelected = (id: string) => selected.value.includes(id)

const toggle = (id: string) => {
  const next = isSelected(id)
    ? selected.value.filter(x => x !== id)
    : [...selected.value, id]
  selected.value = next
}

// Accent → CSS variable map. Mirrors the same palette used by
// MaanProgramCard so the picker reads as "this content belongs to the
// autism program" at a glance.
const accentVar = (accent: 'autism' | 'down' | 'ld' | 'cta'): string => `var(--maan-${accent})`
const accentSoft = (accent: 'autism' | 'down' | 'ld' | 'cta'): string => {
  // `cta` doesn't have a `-soft` token; use the brand colour mixed
  // into the surface as a soft tint instead.
  if (accent === 'cta') return 'color-mix(in srgb, var(--maan-cta) 14%, var(--maan-surface))'
  return `var(--maan-${accent}-soft)`
}
</script>

<template>
  <div
    class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    role="group"
    :aria-label="lang === 'ar' ? 'مواقع الظهور' : 'Placements'"
  >
    <button
      v-for="placement in taxonomyPlacements"
      :key="placement.id"
      type="button"
      :aria-pressed="isSelected(placement.id)"
      class="maan-placement-card group text-start"
      :data-selected="isSelected(placement.id)"
      :style="`
        --picker-accent: ${accentVar(placement.accent)};
        --picker-accent-soft: ${accentSoft(placement.accent)};
      `"
      @click="toggle(placement.id)"
    >
      <div class="flex items-start gap-3">
        <div
          class="grid size-10 shrink-0 place-items-center rounded-lg"
          style="background: var(--picker-accent-soft); color: var(--picker-accent);"
        >
          <UIcon
            :name="placement.icon"
            class="size-5"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p
            class="text-sm font-semibold"
            style="color: var(--maan-ink);"
          >
            {{ placement.label[lang] }}
          </p>
          <p
            class="mt-0.5 text-[11px] font-mono uppercase tracking-wide"
            style="color: var(--maan-ink-muted);"
          >
            {{ placement.page[lang] }}
          </p>
          <p
            class="mt-1.5 text-xs leading-snug"
            style="color: var(--maan-ink-muted);"
          >
            {{ placement.hint[lang] }}
          </p>
        </div>
        <!-- Selection checkbox lives at the top corner so the card
             reads as a labelled checkbox even at a glance. -->
        <span
          class="maan-placement-check"
          aria-hidden="true"
        >
          <UIcon
            v-if="isSelected(placement.id)"
            name="i-lucide-check"
            class="size-3.5"
          />
        </span>
      </div>
    </button>
  </div>
</template>

<style>
/* Global so the placement-card surface picks up theme tokens via
 * data-attribute selectors. Scoped styles wouldn't survive
 * `<button>`'s reset, and the data-selected pattern is much cleaner
 * than passing class strings via props. */
.maan-placement-card {
  position: relative;
  background: var(--maan-surface-alt);
  border: 1px solid var(--maan-line);
  border-radius: 14px;
  padding: 14px;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
  cursor: pointer;
}
.maan-placement-card:hover {
  border-color: var(--picker-accent);
  box-shadow: 0 4px 14px -8px var(--picker-accent);
}
.maan-placement-card:focus-visible {
  outline: 2px solid var(--picker-accent);
  outline-offset: 2px;
}
.maan-placement-card[data-selected="true"] {
  border-color: var(--picker-accent);
  background: var(--picker-accent-soft);
  box-shadow: inset 0 0 0 1px var(--picker-accent);
}

.maan-placement-check {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1.5px solid var(--maan-line);
  background: var(--maan-surface);
  color: white;
  flex-shrink: 0;
}
.maan-placement-card[data-selected="true"] .maan-placement-check {
  background: var(--picker-accent);
  border-color: var(--picker-accent);
}
</style>
