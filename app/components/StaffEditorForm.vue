<script setup lang="ts">
// Staff editor — identity + role + scoped permissions. Used by both
// the invite (`/dashboard/staff/new`) and edit (`/dashboard/staff/[id]`)
// pages. The parent passes `mode` to switch behaviour:
//   - 'invite': email is editable, role + permissions only.
//   - 'edit'  : email is read-only.
// Self-edit guards live in the parent page so the form stays generic.

import type { StaffDraft } from '~/composables/useStaffForm'

const props = defineProps<{
  modelValue: StaffDraft
  mode: 'invite' | 'edit'
  isSaving: boolean
  saveError: string
  saveSuccess: string
  /** When true the parent renders self-edit warnings + disables Role. */
  isSelf?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: StaffDraft]
  'save': []
}>()

const { t, isArabic } = useDashboardI18n()

// The parent's draft is a `reactive()` proxy (see useStaffForm). v-model
// on a reactive can't be reassigned via `staffForm = $event` in the
// parent, so the previous pattern of emitting a whole new object was
// silently dropped (clicking the Admin card looked unresponsive). Instead
// mutate `props.modelValue.X = Y` directly — Vue propagates the change
// through the same proxy. Mirrors how FormEditorForm handles the same
// shape.
const form = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})
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

    <!-- Identity -->
    <section class="maan-card p-6">
      <h3
        class="mb-4 text-sm font-bold uppercase tracking-wider"
        :style="{ color: 'var(--maan-ink)' }"
      >
        {{ t.formIdentity }}
      </h3>

      <div class="grid gap-4">
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.staffName }}</span>
          <input
            v-model="form.name"
            class="maan-form-input"
            required
          >
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.staffEmail }}</span>
          <input
            v-model="form.email"
            class="maan-form-input font-mono"
            type="email"
            :disabled="mode === 'edit'"
            required
          >
        </label>
      </div>
    </section>

    <!-- Role -->
    <section class="maan-card p-6">
      <h3
        class="mb-4 text-sm font-bold uppercase tracking-wider"
        :style="{ color: 'var(--maan-ink)' }"
      >
        {{ t.staffRole }}
      </h3>

      <UAlert
        v-if="isSelf"
        color="info"
        variant="soft"
        :title="t.cannotDemoteSelf"
        icon="i-lucide-info"
        class="mb-4"
      />

      <div class="grid gap-3 sm:grid-cols-2">
        <label
          class="maan-role-card"
          :class="{ 'maan-role-card--selected': form.role === 'admin', 'maan-role-card--disabled': isSelf }"
        >
          <input
            type="radio"
            name="role"
            value="admin"
            :checked="form.role === 'admin'"
            :disabled="isSelf"
            class="sr-only"
            @change="form.role = 'admin'"
          >
          <div class="maan-role-card-icon">
            <UIcon
              name="i-lucide-shield-check"
              class="size-5"
            />
          </div>
          <div>
            <p
              class="text-sm font-semibold"
              :style="{ color: 'var(--maan-ink)' }"
            >
              {{ t.roleAdmin }}
            </p>
            <p
              class="mt-0.5 text-xs"
              :style="{ color: 'var(--maan-ink-muted)' }"
            >
              {{ t.roleAdminDescription }}
            </p>
          </div>
        </label>

        <label
          class="maan-role-card"
          :class="{ 'maan-role-card--selected': form.role === 'staff', 'maan-role-card--disabled': isSelf }"
        >
          <input
            type="radio"
            name="role"
            value="staff"
            :checked="form.role === 'staff'"
            :disabled="isSelf"
            class="sr-only"
            @change="form.role = 'staff'"
          >
          <div
            class="maan-role-card-icon"
            :style="{ background: 'var(--maan-down-soft)', color: 'var(--maan-down)' }"
          >
            <UIcon
              name="i-lucide-user"
              class="size-5"
            />
          </div>
          <div>
            <p
              class="text-sm font-semibold"
              :style="{ color: 'var(--maan-ink)' }"
            >
              {{ t.roleStaff }}
            </p>
            <p
              class="mt-0.5 text-xs"
              :style="{ color: 'var(--maan-ink-muted)' }"
            >
              {{ t.roleStaffDescription }}
            </p>
          </div>
        </label>
      </div>
    </section>

    <!-- Permissions (staff role only) -->
    <section
      v-if="form.role === 'staff'"
      class="maan-card p-6"
    >
      <header class="mb-4">
        <h3
          class="text-sm font-bold uppercase tracking-wider"
          :style="{ color: 'var(--maan-ink)' }"
        >
          {{ t.staffPermissions }}
        </h3>
        <p
          class="mt-1 text-xs"
          :style="{ color: 'var(--maan-ink-muted)' }"
        >
          {{ t.permissionsHint }}
        </p>
      </header>

      <StaffPermissionsField v-model="form.permissions" />
    </section>

    <div>
      <UButton
        icon="i-lucide-save"
        size="lg"
        :loading="isSaving"
        @click="$emit('save')"
      >
        {{ mode === 'invite' ? t.inviteStaff : t.save }}
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.maan-role-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.85rem;
  align-items: center;
  padding: 1rem;
  border-radius: 0.85rem;
  border: 1px solid var(--maan-line);
  background: var(--maan-surface-alt);
  cursor: pointer;
  transition: border-color .12s, background-color .12s;
}
.maan-role-card:hover {
  border-color: color-mix(in srgb, var(--maan-autism) 40%, var(--maan-line));
}
.maan-role-card--selected {
  border-color: var(--maan-autism);
  background: color-mix(in srgb, var(--maan-autism) 8%, var(--maan-surface-alt));
}
.maan-role-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.maan-role-card-icon {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.7rem;
  background: var(--maan-autism-soft);
  color: var(--maan-autism);
}
</style>
