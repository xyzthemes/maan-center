<script setup lang="ts">
// Form editor — bilingual identity + repeating fields. Save runs through
// useFormForm which is shaped after useBlockForm so the parent page
// keeps the same v-model + save-button pattern as posts / blocks.

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
  { value: 'message', label: t.value.onSuccessMessage },
  { value: 'redirect', label: t.value.onSuccessRedirect }
])

const choiceTypes: ReadonlySet<FieldType> = new Set(['select', 'radio', 'checkbox_group'])
const isChoiceType = (type: FieldType) => choiceTypes.has(type)

// ── Field operations ──────────────────────────────────────────────────

const addField = () => {
  form.value.fields.push(emptyField('text', form.value.fields.length))
}

const renumberSort = () => {
  form.value.fields.forEach((f, i) => {
    f.sort = i
  })
}

const removeField = (idx: number) => {
  form.value.fields.splice(idx, 1)
  // Renormalise sort so the editor's listed order matches what the
  // server will persist.
  renumberSort()
}

const moveField = (idx: number, dir: -1 | 1) => {
  const j = idx + dir
  if (j < 0 || j >= form.value.fields.length) return
  const arr = form.value.fields
  ;[arr[idx], arr[j]] = [arr[j]!, arr[idx]!]
  renumberSort()
}

const addChoice = (field: FormFieldDraft) => {
  field.choices.push({ value: '', text: { en: '', ar: '' } })
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
      <h3
        class="mb-4 text-sm font-bold uppercase tracking-wider"
        :style="{ color: 'var(--maan-ink)' }"
      >
        {{ t.formIdentity }}
      </h3>

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
          <p
            class="mt-1 text-xs"
            :style="{ color: 'var(--maan-ink-muted)' }"
          >
            {{ t.formSlugHint }}
          </p>
        </label>

        <div
          v-if="form.slug"
          class="flex flex-wrap items-center gap-2 text-xs"
          :style="{ color: 'var(--maan-ink-muted)' }"
        >
          <span class="font-semibold uppercase tracking-wider">{{ t.formPublicUrl }}:</span>
          <button
            type="button"
            class="font-mono underline-offset-2 hover:underline"
            :style="{ color: 'var(--maan-autism)' }"
            @click="copyUrl(publicUrl)"
          >
            {{ publicUrl }}
          </button>
          <span :style="{ color: 'var(--maan-ink-muted)' }">·</span>
          <button
            type="button"
            class="font-mono underline-offset-2 hover:underline"
            :style="{ color: 'var(--maan-autism)' }"
            @click="copyUrl(arPublicUrl)"
          >
            {{ arPublicUrl }}
          </button>
        </div>

        <label class="flex items-center gap-2">
          <input
            v-model="form.isActive"
            type="checkbox"
          >
          <span class="text-sm">{{ form.isActive ? t.formActive : t.formInactive }}</span>
        </label>
      </div>
    </section>

    <!-- ── Submit handling ───────────────────────────────────────── -->
    <section class="maan-card p-6">
      <h3
        class="mb-4 text-sm font-bold uppercase tracking-wider"
        :style="{ color: 'var(--maan-ink)' }"
      >
        {{ t.formSuccessHandling }}
      </h3>

      <div class="grid gap-4">
        <MaanBilingualInput
          v-model="form.submitLabel"
          :label="t.submitLabel"
        />

        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.formStatus }}</span>
          <select
            v-model="form.onSuccess"
            class="maan-form-input"
          >
            <option
              v-for="opt in onSuccessOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </label>

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
      </div>
    </section>

    <!-- ── Fields ────────────────────────────────────────────────── -->
    <section class="maan-card p-6">
      <header class="mb-4 flex items-center justify-between gap-3">
        <h3
          class="text-sm font-bold uppercase tracking-wider"
          :style="{ color: 'var(--maan-ink)' }"
        >
          {{ t.formFields }}
        </h3>
        <UButton
          icon="i-lucide-plus"
          size="sm"
          color="primary"
          @click="addField"
        >
          {{ t.addField }}
        </UButton>
      </header>

      <div class="grid gap-4">
        <article
          v-for="(field, idx) in form.fields"
          :key="idx"
          class="rounded-2xl border p-4"
          :style="{ borderColor: 'var(--maan-line)', background: 'var(--maan-surface)' }"
        >
          <div class="mb-3 flex items-center justify-between gap-2">
            <span
              class="text-xs font-bold uppercase tracking-wider"
              :style="{ color: 'var(--maan-ink-muted)' }"
            >#{{ idx + 1 }}</span>
            <div class="flex items-center gap-1">
              <UButton
                icon="i-lucide-chevron-up"
                size="xs"
                color="neutral"
                variant="ghost"
                :aria-label="t.moveFieldUp"
                :disabled="idx === 0"
                @click="moveField(idx, -1)"
              />
              <UButton
                icon="i-lucide-chevron-down"
                size="xs"
                color="neutral"
                variant="ghost"
                :aria-label="t.moveFieldDown"
                :disabled="idx === form.fields.length - 1"
                @click="moveField(idx, 1)"
              />
              <UButton
                icon="i-lucide-trash-2"
                size="xs"
                color="error"
                variant="ghost"
                :aria-label="t.removeField"
                @click="removeField(idx)"
              />
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <label class="block">
              <span class="mb-1 block text-xs font-semibold text-highlighted">{{ t.fieldType }}</span>
              <select
                v-model="field.type"
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

          <div class="mt-3 grid gap-3 md:grid-cols-3">
            <label class="flex items-center gap-2 text-sm">
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
            class="mt-4 border-t pt-4"
            :style="{ borderColor: 'var(--maan-line)' }"
          >
            <header class="mb-2 flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider">{{ t.fieldChoices }}</span>
              <UButton
                icon="i-lucide-plus"
                size="xs"
                variant="subtle"
                @click="addChoice(field)"
              >
                {{ t.addChoice }}
              </UButton>
            </header>
            <div class="grid gap-4">
              <div
                v-for="(choice, cIdx) in field.choices"
                :key="cIdx"
                class="rounded-xl border p-3"
                :style="{ borderColor: 'var(--maan-line)', background: 'var(--maan-surface-alt)' }"
              >
                <div class="mb-2 flex items-center justify-between gap-2">
                  <span
                    class="text-[11px] font-bold uppercase tracking-wider"
                    :style="{ color: 'var(--maan-ink-muted)' }"
                  >#{{ cIdx + 1 }}</span>
                  <UButton
                    icon="i-lucide-x"
                    size="xs"
                    color="error"
                    variant="ghost"
                    :aria-label="t.removeChoice"
                    @click="removeChoice(field, cIdx)"
                  />
                </div>
                <label class="mb-3 block">
                  <span
                    class="mb-1 block text-xs font-semibold"
                    :style="{ color: 'var(--maan-ink-muted)' }"
                  >{{ t.choiceValue }}</span>
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
            </div>
          </div>
        </article>

        <p
          v-if="form.fields.length === 0"
          class="text-sm"
          :style="{ color: 'var(--maan-ink-muted)' }"
        >
          {{ t.addField }}
        </p>
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
