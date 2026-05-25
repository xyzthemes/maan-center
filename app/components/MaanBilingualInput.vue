<script setup lang="ts">
// Bilingual input pair — English ALWAYS on the left, Arabic ALWAYS on
// the right. The wrapper forces `dir="ltr"` so column order doesn't
// flip on `/ar/dashboard` (where the dashboard layout itself is RTL).
// Each side carries an always-visible language tag + a colored edge so
// admins can scan at a glance which input is which.
//
// Language labels are hardcoded in their own languages ("English" /
// "العربية") because they refer to the input's content language, not
// the admin's UI language.

import type { BilingualText } from '~/utils/i18n-text'

const props = defineProps<{
  modelValue: BilingualText
  /** Optional shared label rendered above both inputs (e.g. "Label", "Placeholder"). */
  label?: string
  placeholder?: BilingualText
  multiline?: boolean
  required?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BilingualText]
}>()

const onEnInput = (e: Event) => {
  emit('update:modelValue', {
    ...props.modelValue,
    en: (e.target as HTMLInputElement | HTMLTextAreaElement).value
  })
}
const onArInput = (e: Event) => {
  emit('update:modelValue', {
    ...props.modelValue,
    ar: (e.target as HTMLInputElement | HTMLTextAreaElement).value
  })
}

const enPlaceholder = computed(() => props.placeholder?.en || 'Type in English…')
const arPlaceholder = computed(() => props.placeholder?.ar || 'اكتب بالعربية…')
</script>

<template>
  <div class="maan-bilingual">
    <p
      v-if="label"
      class="maan-bilingual-label"
    >
      {{ label }}
    </p>

    <!-- dir="ltr" forces the grid to put column 1 on the left no
         matter the document direction. So EN stays left, AR stays
         right whether the admin is on /dashboard or /ar/dashboard. -->
    <div
      class="maan-bilingual-pair"
      dir="ltr"
    >
      <!-- English side -->
      <div class="maan-bilingual-side maan-bilingual-side--en">
        <div class="maan-bilingual-tag maan-bilingual-tag--en">
          <UIcon
            name="i-lucide-languages"
            class="size-3"
          />
          <span>English</span>
        </div>
        <textarea
          v-if="multiline"
          dir="ltr"
          class="maan-form-input maan-bilingual-input maan-bilingual-input--en min-h-20"
          :value="modelValue.en"
          :placeholder="enPlaceholder"
          :required="required && !modelValue.ar"
          @input="onEnInput"
        />
        <input
          v-else
          dir="ltr"
          type="text"
          class="maan-form-input maan-bilingual-input maan-bilingual-input--en"
          :value="modelValue.en"
          :placeholder="enPlaceholder"
          :required="required && !modelValue.ar"
          @input="onEnInput"
        >
      </div>

      <!-- Arabic side -->
      <div class="maan-bilingual-side maan-bilingual-side--ar">
        <div class="maan-bilingual-tag maan-bilingual-tag--ar">
          <span>العربية</span>
          <UIcon
            name="i-lucide-languages"
            class="size-3"
          />
        </div>
        <textarea
          v-if="multiline"
          dir="rtl"
          lang="ar"
          class="maan-form-input maan-bilingual-input maan-bilingual-input--ar min-h-20"
          :value="modelValue.ar"
          :placeholder="arPlaceholder"
          :required="required && !modelValue.en"
          @input="onArInput"
        />
        <input
          v-else
          dir="rtl"
          lang="ar"
          type="text"
          class="maan-form-input maan-bilingual-input maan-bilingual-input--ar"
          :value="modelValue.ar"
          :placeholder="arPlaceholder"
          :required="required && !modelValue.en"
          @input="onArInput"
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.maan-bilingual {
  display: block;
}

.maan-bilingual-label {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--maan-ink);
}

.maan-bilingual-pair {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
@media (min-width: 640px) {
  .maan-bilingual-pair {
    grid-template-columns: 1fr 1fr;
  }
}

.maan-bilingual-side {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

/* Each tag pinned to its language's edge so the relationship to the
 * input below is unambiguous, even after the admin tabs between fields. */
.maan-bilingual-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  align-self: flex-start;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.maan-bilingual-tag--en {
  background: var(--maan-autism-soft);
  color: var(--maan-autism);
  align-self: flex-start;
}

/* "العربية" should not be uppercased; Arabic has no case. */
.maan-bilingual-tag--ar {
  background: var(--maan-down-soft);
  color: var(--maan-down);
  align-self: flex-end;
  text-transform: none;
  letter-spacing: 0;
  font-family: var(--font-sans);
}

/* Colored edge anchor — left bar on EN, right bar on AR. Sits on the
 * input's outer border so peripheral vision keeps the side identity
 * even while the admin is mid-edit. */
.maan-bilingual-input--en {
  border-inline-start: 3px solid var(--maan-autism);
}
.maan-bilingual-input--ar {
  border-inline-end: 3px solid var(--maan-down);
}

.maan-bilingual-input--en:focus,
.maan-bilingual-input--en:focus-visible {
  border-color: var(--maan-autism);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--maan-autism) 18%, transparent);
}
.maan-bilingual-input--ar:focus,
.maan-bilingual-input--ar:focus-visible {
  border-color: var(--maan-down);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--maan-down) 18%, transparent);
}
</style>
