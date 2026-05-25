<script setup lang="ts">
// Form editor — bilingual identity + repeating fields. Save runs through
// useFormForm which is shaped after useBlockForm so the parent page
// keeps the same v-model + save-button pattern as posts / blocks.
//
// UX notes:
// - Each field card is collapsible. Newly-added fields auto-expand and
//   scroll into view so the editor never loses the admin's place once
//   the form gets long.
// - The "Choices" sub-section (for select / radio / checkbox_group) is
//   independently collapsible. A select with 20 options would otherwise
//   dominate the field card visually.

import type { FormDraft, FormFieldDraft, FieldType } from '~/composables/useFormForm'
import { emptyField } from '~/composables/useFormForm'

const props = defineProps<{
  modelValue: FormDraft
  isSaving: boolean
  saveError: string
  saveSuccess: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FormDraft]
  'save': []
  'clear': []
}>()

const { t, isArabic } = useDashboardI18n()

const form = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const fieldTypeOptions = computed(() => [
  { value: 'text', label: t.value.fieldTypeText },
  { value: 'textarea', label: t.value.fieldTypeTextarea },
  { value: 'email', label: t.value.fieldTypeEmail },
  { value: 'phone', label: t.value.fieldTypePhone },
  { value: 'number', label: t.value.fieldTypeNumber },
  { value: 'date', label: t.value.fieldTypeDate },
  { value: 'select', label: t.value.fieldTypeSelect },
  { value: 'radio', label: t.value.fieldTypeRadio },
  { value: 'checkbox', label: t.value.fieldTypeCheckbox },
  { value: 'checkbox_group', label: t.value.fieldTypeCheckboxGroup },
  { value: 'hidden', label: t.value.fieldTypeHidden }
])

const widthOptions = computed(() => [
  { value: '100', label: '100%' },
  { value: '67', label: '67%' },
  { value: '50', label: '50%' },
  { value: '33', label: '33%' }
])

const onSuccessOptions = computed(() => [
  { value: 'message', label: t.value.onSuccessMessage, icon: 'i-lucide-message-square' },
  { value: 'redirect', label: t.value.onSuccessRedirect, icon: 'i-lucide-link' }
])

const choiceTypes: ReadonlySet<FieldType> = new Set(['select', 'radio', 'checkbox_group'])
const isChoiceType = (type: FieldType) => choiceTypes.has(type)

// Short visual badge for each field type so collapsed cards still
// communicate what they are at a glance.
const typeBadge = (type: FieldType): { label: string, tone: 'choice' | 'text' | 'meta' } => {
  const map = unref(fieldTypeOptions).find(o => o.value === type)
  const label = map?.label || type
  if (choiceTypes.has(type)) return { label, tone: 'choice' }
  if (type === 'hidden') return { label, tone: 'meta' }
  return { label, tone: 'text' }
}

// ── Per-field UI state ────────────────────────────────────────────────
//
// Track expand/collapse state by stable UI key, not by index. Indices
// shift when fields are reordered or removed, which would otherwise
// scramble the open/closed state mid-edit.

let uiKeyCounter = 0
const uiKeys = ref<number[]>([])
const expanded = reactive<Record<number, boolean>>({})
const choicesExpanded = reactive<Record<number, boolean>>({})

// Initialise UI keys for fields hydrated from the server (edit mode).
// New keys get appended in addField(); removed indices are dropped in
// removeField(). Watch shields against external resets (newForm() etc).
watch(
  () => form.value.fields.length,
  (len) => {
    if (uiKeys.value.length === len) return
    if (uiKeys.value.length < len) {
      // Server-hydrated or external push — pad with fresh keys and start collapsed.
      while (uiKeys.value.length < len) {
        const k = uiKeyCounter++
        uiKeys.value.push(k)
        expanded[k] = false
        choicesExpanded[k] = false
      }
    } else {
      uiKeys.value = uiKeys.value.slice(0, len)
    }
  },
  { immediate: true }
)

const keyAt = (idx: number) => uiKeys.value[idx] ?? -1
const isExpanded = (idx: number) => expanded[keyAt(idx)] === true
const isChoicesExpanded = (idx: number) => choicesExpanded[keyAt(idx)] === true
const toggleExpanded = (idx: number) => {
  const k = keyAt(idx)
  expanded[k] = !expanded[k]
}
const toggleChoicesExpanded = (idx: number) => {
  const k = keyAt(idx)
  choicesExpanded[k] = !choicesExpanded[k]
}

const allExpanded = computed(() =>
  form.value.fields.length > 0 && uiKeys.value.every(k => expanded[k] === true)
)
const toggleAll = () => {
  const target = !allExpanded.value
  uiKeys.value.forEach((k) => {
    expanded[k] = target
  })
}

// ── Field operations + scroll-to-new ──────────────────────────────────

const fieldRefs = ref<Record<number, HTMLElement | null>>({})
const setFieldRef = (key: number) => (el: Element | ComponentPublicInstance | null) => {
  fieldRefs.value[key] = (el as HTMLElement | null)
}

const addField = async () => {
  const newKey = uiKeyCounter++
  uiKeys.value.push(newKey)
  expanded[newKey] = true
  choicesExpanded[newKey] = true
  form.value.fields.push(emptyField('text', form.value.fields.length))

  await nextTick()
  const el = fieldRefs.value[newKey]
  if (el && typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Focus the type select so the admin can start configuring without
    // an extra mouse step. Wait a tick for the expand transition to start.
    requestAnimationFrame(() => {
      const focusable = el.querySelector<HTMLElement>('[data-autofocus]')
      focusable?.focus()
    })
  }
}

const renumberSort = () => {
  form.value.fields.forEach((f, i) => {
    f.sort = i
  })
}

const removeField = (idx: number) => {
  form.value.fields.splice(idx, 1)
  const k = uiKeys.value.splice(idx, 1)[0]
  if (k !== undefined) {
    // Reflect.deleteProperty side-steps eslint's no-dynamic-delete rule;
    // semantics are identical to `delete obj[key]`.
    Reflect.deleteProperty(expanded, k)
    Reflect.deleteProperty(choicesExpanded, k)
    Reflect.deleteProperty(fieldRefs.value, k)
  }
  renumberSort()
}

const moveField = (idx: number, dir: -1 | 1) => {
  const j = idx + dir
  if (j < 0 || j >= form.value.fields.length) return
  const arr = form.value.fields
  ;[arr[idx], arr[j]] = [arr[j]!, arr[idx]!]
  const keys = uiKeys.value
  ;[keys[idx], keys[j]] = [keys[j]!, keys[idx]!]
  renumberSort()
}

const addChoice = (field: FormFieldDraft, fieldIdx: number) => {
  field.choices.push({ value: '', text: { en: '', ar: '' } })
  // Make sure the choices panel is open so the admin sees what they just added.
  choicesExpanded[keyAt(fieldIdx)] = true
}

const removeChoice = (field: FormFieldDraft, idx: number) => {
  field.choices.splice(idx, 1)
}

// ── Public URL preview + copy ─────────────────────────────────────────

const publicUrl = computed(() => form.value.slug ? `/forms/${form.value.slug}` : '')
const arPublicUrl = computed(() => form.value.slug ? `/ar/forms/${form.value.slug}` : '')

const dashToast = useDashboardToast()
const copyUrl = async (url: string) => {
  if (!url) return
  const fullUrl = (typeof window !== 'undefined' ? window.location.origin : '') + url
  try {
    await navigator.clipboard.writeText(fullUrl)
    dashToast.saved(t.value.copiedToast)
  } catch {
    /* silent — user can copy manually */
  }
}

// ── Slug auto-suggest from EN title ───────────────────────────────────

const slugify = (s: string) => s
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60)

let slugTouched = !!form.value.slug
const onSlugInput = () => {
  slugTouched = true
}
watch(() => form.value.title.en, (en) => {
  if (slugTouched) return
  if (!en) return
  form.value.slug = slugify(en)
})

// ── Field-name auto-suggest from EN label ─────────────────────────────

const slugifyName = (s: string) => slugify(s).replace(/[^a-z0-9_-]+/g, '-')
const onFieldLabelEnInput = (field: FormFieldDraft) => {
  if (field.name) return
  field.name = slugifyName(field.label.en)
}

// Display label for the collapsed-card preview: prefer EN, fall back to AR.
const previewLabel = (field: FormFieldDraft) =>
  field.label.en?.trim() || field.label.ar?.trim() || t.value.untitledField

const needsChoices = (field: FormFieldDraft) =>
  isChoiceType(field.type) && field.choices.length === 0

const onSave = () => emit('save')
</script>

<template>
  <div
    class="grid gap-6"
    :dir="isArabic ? 'rtl' : 'ltr'"
  >
    <UAlert
      v-if="saveError"
      color="error"
      variant="soft"
      :title="saveError"
    />
    <UAlert
      v-if="saveSuccess"
      color="success"
      variant="soft"
      :title="saveSuccess"
    />

    <!-- ── Identity ───────────────────────────────────────────────── -->
    <section class="maan-card p-6">
      <header class="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3
            class="text-sm font-bold uppercase tracking-wider"
            :style="{ color: 'var(--maan-ink)' }"
          >
            {{ t.formIdentity }}
          </h3>
          <p
            class="mt-1 text-xs"
            :style="{ color: 'var(--maan-ink-muted)' }"
          >
            {{ t.formSlugHint }}
          </p>
        </div>
        <label
          class="form-status-toggle"
          :class="form.isActive ? 'is-on' : 'is-off'"
        >
          <input
            v-model="form.isActive"
            type="checkbox"
            class="sr-only"
          >
          <span class="status-dot" />
          <span>{{ form.isActive ? t.formActive : t.formInactive }}</span>
        </label>
      </header>

      <div class="grid gap-4">
        <MaanBilingualInput
          v-model="form.title"
          :label="t.titleLabel"
          required
        />

        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.formSlug }}</span>
          <input
            v-model="form.slug"
            class="maan-form-input font-mono"
            placeholder="parent-survey"
            required
            @input="onSlugInput"
          >
        </label>

        <div
          v-if="form.slug"
          class="public-url-row"
        >
          <span class="public-url-label">{{ t.formPublicUrl }}</span>
          <button
            type="button"
            class="public-url-chip"
            @click="copyUrl(publicUrl)"
          >
            <UIcon
              name="i-lucide-copy"
              class="size-3.5 opacity-60"
            />
            <span class="font-mono">{{ publicUrl }}</span>
            <span class="public-url-lang">EN</span>
          </button>
          <button
            type="button"
            class="public-url-chip"
            @click="copyUrl(arPublicUrl)"
          >
            <UIcon
              name="i-lucide-copy"
              class="size-3.5 opacity-60"
            />
            <span class="font-mono">{{ arPublicUrl }}</span>
            <span class="public-url-lang">AR</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ── Submit handling ───────────────────────────────────────── -->
    <section class="maan-card p-6">
      <header class="mb-5">
        <h3
          class="text-sm font-bold uppercase tracking-wider"
          :style="{ color: 'var(--maan-ink)' }"
        >
          {{ t.formSuccessHandling }}
        </h3>
      </header>

      <div class="grid gap-5">
        <MaanBilingualInput
          v-model="form.submitLabel"
          :label="t.submitLabel"
        />

        <div>
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.formStatus }}</span>
          <div
            class="success-toggle"
            role="radiogroup"
            dir="ltr"
          >
            <button
              v-for="opt in onSuccessOptions"
              :key="opt.value"
              type="button"
              role="radio"
              :aria-checked="form.onSuccess === opt.value"
              class="success-toggle-btn"
              :class="{ 'is-active': form.onSuccess === opt.value }"
              @click="form.onSuccess = opt.value as 'message' | 'redirect'"
            >
              <UIcon
                :name="opt.icon"
                class="size-4"
              />
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </div>

        <Transition
          name="success-detail"
          mode="out-in"
        >
          <MaanBilingualInput
            v-if="form.onSuccess === 'message'"
            v-model="form.successMessage"
            :label="t.successMessage"
            multiline
          />
          <label
            v-else
            class="block"
          >
            <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.successRedirectUrl }}</span>
            <input
              v-model="form.successRedirectUrl"
              class="maan-form-input"
              placeholder="/contact/thank-you"
            >
          </label>
        </Transition>
      </div>
    </section>

    <!-- ── Fields ────────────────────────────────────────────────── -->
    <section class="maan-card p-6">
      <header class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-baseline gap-3">
          <h3
            class="text-sm font-bold uppercase tracking-wider"
            :style="{ color: 'var(--maan-ink)' }"
          >
            {{ t.formFields }}
          </h3>
          <span
            v-if="form.fields.length"
            class="text-xs"
            :style="{ color: 'var(--maan-ink-muted)' }"
          >{{ t.fieldsCount(form.fields.length) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            v-if="form.fields.length > 1"
            :icon="allExpanded ? 'i-lucide-chevrons-down-up' : 'i-lucide-chevrons-up-down'"
            size="sm"
            color="neutral"
            variant="ghost"
            @click="toggleAll"
          >
            {{ allExpanded ? t.collapseAllFields : t.expandAllFields }}
          </UButton>
          <UButton
            icon="i-lucide-plus"
            size="sm"
            color="primary"
            @click="addField"
          >
            {{ t.addField }}
          </UButton>
        </div>
      </header>

      <div
        v-if="form.fields.length === 0"
        class="field-empty"
      >
        <UIcon
          name="i-lucide-clipboard-list"
          class="size-7"
        />
        <p>{{ t.noFieldsYet }}</p>
      </div>

      <div
        v-else
        class="grid gap-3"
      >
        <article
          v-for="(field, idx) in form.fields"
          :key="uiKeys[idx]"
          :ref="setFieldRef(uiKeys[idx] ?? -1)"
          class="field-card"
          :class="{ 'is-open': isExpanded(idx), 'is-hidden-type': field.type === 'hidden' }"
        >
          <!-- Always-visible header row -->
          <div class="field-card-head">
            <div class="field-handles">
              <button
                type="button"
                class="field-handle-btn"
                :aria-label="t.moveFieldUp"
                :disabled="idx === 0"
                @click="moveField(idx, -1)"
              >
                <UIcon
                  name="i-lucide-chevron-up"
                  class="size-4"
                />
              </button>
              <button
                type="button"
                class="field-handle-btn"
                :aria-label="t.moveFieldDown"
                :disabled="idx === form.fields.length - 1"
                @click="moveField(idx, 1)"
              >
                <UIcon
                  name="i-lucide-chevron-down"
                  class="size-4"
                />
              </button>
            </div>

            <button
              type="button"
              class="field-summary"
              :aria-expanded="isExpanded(idx)"
              :aria-label="isExpanded(idx) ? t.collapseField : t.expandField"
              @click="toggleExpanded(idx)"
            >
              <span class="field-index">#{{ idx + 1 }}</span>
              <span
                class="field-type-badge"
                :data-tone="typeBadge(field.type).tone"
              >
                {{ typeBadge(field.type).label }}
              </span>
              <span class="field-preview-label">{{ previewLabel(field) }}</span>
              <span
                v-if="field.name"
                class="field-machine-name"
              >{{ field.name }}</span>
              <span
                v-if="field.required"
                class="field-required-dot"
                :title="t.fieldRequired"
              >*</span>
              <span
                v-if="needsChoices(field)"
                class="field-warning"
                :title="t.choicesNeedAttention"
              >
                <UIcon
                  name="i-lucide-alert-circle"
                  class="size-3.5"
                />
                <span>{{ t.choicesNeedAttention }}</span>
              </span>
              <UIcon
                :name="isExpanded(idx) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="field-chevron size-4"
              />
            </button>

            <button
              type="button"
              class="field-remove-btn"
              :aria-label="t.removeField"
              @click="removeField(idx)"
            >
              <UIcon
                name="i-lucide-trash-2"
                class="size-4"
              />
            </button>
          </div>

          <!-- Collapsible body -->
          <div
            class="field-card-body"
            :hidden="!isExpanded(idx)"
          >
            <div class="grid gap-3 md:grid-cols-2 pt-4">
              <label class="block">
                <span class="mb-1 block text-xs font-semibold text-highlighted">{{ t.fieldType }}</span>
                <select
                  v-model="field.type"
                  data-autofocus
                  class="maan-form-input"
                >
                  <option
                    v-for="opt in fieldTypeOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </label>

              <label class="block">
                <span class="mb-1 block text-xs font-semibold text-highlighted">{{ t.formFieldName }}</span>
                <input
                  v-model="field.name"
                  class="maan-form-input font-mono"
                  placeholder="parent-name"
                >
                <span
                  class="mt-1 block text-[11px]"
                  :style="{ color: 'var(--maan-ink-muted)' }"
                >{{ t.formFieldNameHint }}</span>
              </label>
            </div>

            <div
              v-if="field.type !== 'hidden'"
              class="mt-3"
            >
              <MaanBilingualInput
                :model-value="field.label"
                :label="t.fieldLabel"
                @update:model-value="(v) => {
                  field.label = v
                  if (!field.name && v.en) onFieldLabelEnInput(field)
                }"
              />
            </div>

            <div
              v-if="field.type !== 'hidden' && field.type !== 'checkbox' && field.type !== 'checkbox_group' && field.type !== 'radio'"
              class="mt-3"
            >
              <MaanBilingualInput
                v-model="field.placeholder"
                :label="t.fieldPlaceholder"
              />
            </div>

            <div
              v-if="field.type !== 'hidden'"
              class="mt-3"
            >
              <MaanBilingualInput
                v-model="field.help"
                :label="t.fieldHelp"
              />
            </div>

            <div class="mt-4 grid gap-3 md:grid-cols-3">
              <label class="field-required-toggle">
                <input
                  v-model="field.required"
                  type="checkbox"
                >
                <span>{{ t.fieldRequired }}</span>
              </label>
              <label class="block">
                <span class="mb-1 block text-xs font-semibold text-highlighted">{{ t.fieldWidth }}</span>
                <select
                  v-model="field.width"
                  class="maan-form-input"
                >
                  <option
                    v-for="opt in widthOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </label>
              <label class="block">
                <span class="mb-1 block text-xs font-semibold text-highlighted">{{ t.fieldValidation }}</span>
                <input
                  v-model="field.validation"
                  class="maan-form-input font-mono"
                  placeholder="email|max:255"
                >
                <span
                  class="mt-1 block text-[11px]"
                  :style="{ color: 'var(--maan-ink-muted)' }"
                >{{ t.fieldValidationHint }}</span>
              </label>
            </div>

            <!-- Choices for select / radio / checkbox_group -->
            <div
              v-if="isChoiceType(field.type)"
              class="choices-panel"
              :class="{ 'is-open': isChoicesExpanded(idx) }"
            >
              <button
                type="button"
                class="choices-head"
                :aria-expanded="isChoicesExpanded(idx)"
                @click="toggleChoicesExpanded(idx)"
              >
                <UIcon
                  :name="isChoicesExpanded(idx) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                  class="size-4 transition-transform"
                />
                <span class="choices-head-label">{{ t.fieldChoices }}</span>
                <span class="choices-head-count">
                  {{ field.choices.length ? t.choicesCount(field.choices.length) : t.noChoicesYet }}
                </span>
                <span class="choices-head-spacer" />
                <UButton
                  icon="i-lucide-plus"
                  size="xs"
                  variant="subtle"
                  color="primary"
                  @click.stop="addChoice(field, idx)"
                >
                  {{ t.addChoice }}
                </UButton>
              </button>

              <div
                class="choices-body"
                :hidden="!isChoicesExpanded(idx)"
              >
                <div
                  v-if="field.choices.length === 0"
                  class="choices-empty"
                >
                  {{ t.noChoicesYet }}
                </div>
                <div
                  v-else
                  class="grid gap-3"
                >
                  <div
                    v-for="(choice, cIdx) in field.choices"
                    :key="cIdx"
                    class="choice-row"
                  >
                    <span class="choice-index">#{{ cIdx + 1 }}</span>
                    <div class="choice-fields">
                      <label class="choice-value-label">
                        <span class="mb-1 block text-[11px] font-semibold uppercase tracking-wider"
                              :style="{ color: 'var(--maan-ink-muted)' }">
                          {{ t.choiceValue }}
                        </span>
                        <input
                          v-model="choice.value"
                          class="maan-form-input font-mono"
                          placeholder="e.g. autism"
                        >
                      </label>
                      <MaanBilingualInput
                        v-model="choice.text"
                        :label="t.fieldLabel"
                      />
                    </div>
                    <button
                      type="button"
                      class="choice-remove-btn"
                      :aria-label="t.removeChoice"
                      @click="removeChoice(field, cIdx)"
                    >
                      <UIcon
                        name="i-lucide-x"
                        class="size-4"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <div>
      <UButton
        icon="i-lucide-save"
        size="lg"
        :loading="isSaving"
        @click="onSave"
      >
        {{ t.save }}
      </UButton>
    </div>
  </div>
</template>

<style scoped>
/* ── Status toggle (Active / Inactive pill) ────────────────────────── */

.form-status-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--maan-line);
  background: var(--maan-surface);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  user-select: none;
}
.form-status-toggle .status-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 22%, transparent);
}
.form-status-toggle.is-on {
  color: #1f9d6b;
  background: color-mix(in srgb, #1f9d6b 10%, var(--maan-surface));
  border-color: color-mix(in srgb, #1f9d6b 30%, var(--maan-line));
}
.form-status-toggle.is-off {
  color: var(--maan-ink-muted);
}

/* ── Public URL chips ──────────────────────────────────────────────── */

.public-url-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.75rem;
  background: var(--maan-surface);
  border: 1px dashed var(--maan-line);
}
.public-url-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--maan-ink-muted);
}
.public-url-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid var(--maan-line);
  background: var(--maan-surface-alt);
  color: var(--maan-autism);
  font-size: 0.75rem;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  cursor: pointer;
}
.public-url-chip:hover {
  background: color-mix(in srgb, var(--maan-autism) 8%, var(--maan-surface-alt));
  border-color: color-mix(in srgb, var(--maan-autism) 35%, var(--maan-line));
}
.public-url-chip:active { transform: translateY(1px); }
.public-url-lang {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--maan-autism) 18%, transparent);
}

/* ── Success-handling segmented toggle ─────────────────────────────── */

.success-toggle {
  display: inline-flex;
  padding: 0.25rem;
  border-radius: 0.75rem;
  border: 1px solid var(--maan-line);
  background: var(--maan-surface);
  gap: 0.25rem;
}
.success-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.85rem;
  border-radius: 0.55rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--maan-ink-muted);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}
.success-toggle-btn:hover {
  color: var(--maan-ink);
}
.success-toggle-btn.is-active {
  background: var(--maan-surface-alt);
  color: var(--maan-ink);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(15, 39, 65, 0.08);
}

/* ── Fields section ────────────────────────────────────────────────── */

.field-empty {
  display: grid;
  place-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  border-radius: 1rem;
  border: 1px dashed var(--maan-line);
  background: var(--maan-surface);
  color: var(--maan-ink-muted);
  text-align: center;
  font-size: 0.875rem;
}

.field-card {
  border: 1px solid var(--maan-line);
  border-radius: 0.95rem;
  background: var(--maan-surface);
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.field-card.is-open {
  border-color: color-mix(in srgb, var(--maan-autism) 30%, var(--maan-line));
  box-shadow: 0 10px 24px -20px rgba(15, 39, 65, 0.35);
  background: var(--maan-surface-alt);
}
.field-card.is-hidden-type {
  border-style: dashed;
  opacity: 0.85;
}

.field-card-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
}

.field-handles {
  display: inline-flex;
  flex-direction: column;
  gap: 1px;
  flex-shrink: 0;
}
.field-handle-btn {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.05rem;
  border-radius: 0.3rem;
  color: var(--maan-ink-muted);
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.field-handle-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--maan-ink) 6%, transparent);
  color: var(--maan-ink);
}
.field-handle-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.field-summary {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.4rem;
  border-radius: 0.5rem;
  background: transparent;
  cursor: pointer;
  text-align: start;
  transition: background 0.15s ease;
}
.field-summary:hover {
  background: color-mix(in srgb, var(--maan-ink) 4%, transparent);
}
.field-card.is-open .field-summary {
  background: color-mix(in srgb, var(--maan-autism) 6%, transparent);
}

.field-index {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--maan-ink-muted);
  flex-shrink: 0;
}

.field-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}
.field-type-badge[data-tone='text'] {
  background: color-mix(in srgb, var(--maan-ink) 8%, transparent);
  color: var(--maan-ink);
}
.field-type-badge[data-tone='choice'] {
  background: var(--maan-autism-soft);
  color: var(--maan-autism);
}
.field-type-badge[data-tone='meta'] {
  background: color-mix(in srgb, var(--maan-ink-muted) 20%, transparent);
  color: var(--maan-ink-muted);
}

.field-preview-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--maan-ink);
}
.field-card:not(.is-open) .field-preview-label {
  color: var(--maan-ink-muted);
}

.field-machine-name {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.7rem;
  color: var(--maan-ink-muted);
  padding: 0.1rem 0.4rem;
  border-radius: 0.3rem;
  background: color-mix(in srgb, var(--maan-ink) 5%, transparent);
  flex-shrink: 0;
}

.field-required-dot {
  display: inline-grid;
  place-items: center;
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--maan-cta, #c44) 18%, transparent);
  color: var(--maan-cta, #c44);
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.field-warning {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, #d97706 18%, transparent);
  color: #b45309;
  font-size: 0.7rem;
  font-weight: 600;
  flex-shrink: 0;
}
.dark .field-warning {
  color: #f59e0b;
}

.field-chevron {
  margin-inline-start: auto;
  color: var(--maan-ink-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.field-remove-btn {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  color: var(--maan-ink-muted);
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  flex-shrink: 0;
}
.field-remove-btn:hover {
  background: color-mix(in srgb, #dc2626 12%, transparent);
  color: #dc2626;
}

/* Collapsible body — animated via grid-template-rows trick (works
   across browsers without needing measured heights). */
.field-card-body {
  padding: 0 1rem 1rem 1rem;
  animation: field-body-fade 0.2s ease;
}
.field-card-body[hidden] {
  display: none;
}

@keyframes field-body-fade {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.field-required-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.55rem;
  border: 1px solid var(--maan-line);
  background: var(--maan-surface);
  font-size: 0.875rem;
  cursor: pointer;
  align-self: flex-end;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.field-required-toggle:hover {
  border-color: color-mix(in srgb, var(--maan-autism) 30%, var(--maan-line));
}

/* ── Choices sub-section ───────────────────────────────────────────── */

.choices-panel {
  margin-top: 1rem;
  border: 1px solid var(--maan-line);
  border-radius: 0.75rem;
  background: var(--maan-surface);
  overflow: hidden;
}
.choices-panel.is-open {
  border-color: color-mix(in srgb, var(--maan-autism) 25%, var(--maan-line));
}

.choices-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  background: transparent;
  cursor: pointer;
  text-align: start;
  transition: background 0.15s ease;
}
.choices-head:hover {
  background: color-mix(in srgb, var(--maan-ink) 4%, transparent);
}
.choices-head-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--maan-ink);
}
.choices-head-count {
  font-size: 0.75rem;
  color: var(--maan-ink-muted);
}
.choices-head-spacer {
  flex: 1;
}

.choices-body {
  padding: 0 0.75rem 0.75rem 0.75rem;
  animation: field-body-fade 0.2s ease;
}
.choices-body[hidden] {
  display: none;
}

.choices-empty {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px dashed var(--maan-line);
  background: var(--maan-surface-alt);
  text-align: center;
  font-size: 0.8rem;
  color: var(--maan-ink-muted);
}

.choice-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem;
  border-radius: 0.65rem;
  background: var(--maan-surface-alt);
  border: 1px solid var(--maan-line);
}
.choice-index {
  flex-shrink: 0;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--maan-ink-muted);
  padding-top: 0.6rem;
}
.choice-fields {
  flex: 1;
  display: grid;
  gap: 0.6rem;
  min-width: 0;
}
.choice-value-label {
  display: block;
}
.choice-remove-btn {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.45rem;
  color: var(--maan-ink-muted);
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease;
}
.choice-remove-btn:hover {
  background: color-mix(in srgb, #dc2626 12%, transparent);
  color: #dc2626;
}

/* ── Transitions for success-handling detail swap ──────────────────── */

.success-detail-enter-active,
.success-detail-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.success-detail-enter-from,
.success-detail-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* Reduce motion preference: kill all decorative transitions. */
@media (prefers-reduced-motion: reduce) {
  .field-card,
  .field-card-body,
  .choices-body,
  .field-chevron,
  .public-url-chip,
  .success-toggle-btn,
  .form-status-toggle,
  .success-detail-enter-active,
  .success-detail-leave-active {
    transition: none !important;
    animation: none !important;
  }
}
</style>
