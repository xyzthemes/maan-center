<script setup lang="ts">
// Section permission checkbox grid for the staff editor. One toggle
// per scope; ticking the box grants read+write access to that
// section. Source of truth for the scope list is
// app/utils/permissions.ts so adding a new section is a one-line edit
// there + an i18n entry below.

import { PERMISSION_SCOPES, type PermissionScope } from '~/utils/permissions'

const props = defineProps<{
  modelValue: PermissionScope[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PermissionScope[]]
}>()

const { t } = useDashboardI18n()

// Each scope gets a label + one-line description + Lucide icon.
// Keeping these locally instead of in i18n keys would lock them out
// of Arabic — so we look them up via t.value.
const sectionMeta = computed(() => ({
  posts: { label: t.value.sectionPosts, hint: t.value.sectionPostsHint, icon: 'i-lucide-file-pen-line' },
  pages: { label: t.value.sectionPages, hint: t.value.sectionPagesHint, icon: 'i-lucide-files' },
  blocks: { label: t.value.sectionBlocks, hint: t.value.sectionBlocksHint, icon: 'i-lucide-blocks' },
  forms: { label: t.value.sectionForms, hint: t.value.sectionFormsHint, icon: 'i-lucide-clipboard-list' },
  submissions: { label: t.value.sectionSubmissions, hint: t.value.sectionSubmissionsHint, icon: 'i-lucide-inbox' },
  settings: { label: t.value.sectionSettings, hint: t.value.sectionSettingsHint, icon: 'i-lucide-settings' }
} satisfies Record<PermissionScope, { label: string, hint: string, icon: string }>))

const isChecked = (scope: PermissionScope) => props.modelValue.includes(scope)

const toggle = (scope: PermissionScope) => {
  if (props.disabled) return
  const next = isChecked(scope)
    ? props.modelValue.filter(s => s !== scope)
    : [...props.modelValue, scope]
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <label
      v-for="scope in PERMISSION_SCOPES"
      :key="scope"
      class="maan-permission-row"
      :class="{ 'maan-permission-row--checked': isChecked(scope), 'maan-permission-row--disabled': disabled }"
    >
      <input
        type="checkbox"
        :checked="isChecked(scope)"
        :disabled="disabled"
        class="mt-1 size-4 shrink-0"
        :style="{ accentColor: 'var(--maan-autism)' }"
        @change="toggle(scope)"
      >
      <div class="maan-permission-row-icon">
        <UIcon
          :name="sectionMeta[scope].icon"
          class="size-5"
        />
      </div>
      <div class="min-w-0">
        <p
          class="text-sm font-semibold"
          :style="{ color: 'var(--maan-ink)' }"
        >
          {{ sectionMeta[scope].label }}
        </p>
        <p
          class="mt-0.5 text-xs"
          :style="{ color: 'var(--maan-ink-muted)' }"
        >
          {{ sectionMeta[scope].hint }}
        </p>
      </div>
    </label>
  </div>
</template>

<style scoped>
.maan-permission-row {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid var(--maan-line);
  background: var(--maan-surface-alt);
  cursor: pointer;
  transition: border-color .12s, background-color .12s, transform .12s;
}
.maan-permission-row:hover {
  border-color: color-mix(in srgb, var(--maan-autism) 40%, var(--maan-line));
}
.maan-permission-row--checked {
  border-color: var(--maan-autism);
  background: color-mix(in srgb, var(--maan-autism) 8%, var(--maan-surface-alt));
}
.maan-permission-row--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.maan-permission-row--disabled:hover {
  border-color: var(--maan-line);
  background: var(--maan-surface-alt);
}

.maan-permission-row-icon {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.55rem;
  background: var(--maan-autism-soft);
  color: var(--maan-autism);
}
</style>
