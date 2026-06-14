<script setup lang="ts">
// Warns before leaving the post editor with unsaved changes. Two layers:
//   1. In-app route changes (back arrow, sidebar, etc.) → branded confirm modal
//      with Save-and-leave / Leave-without-saving / Keep-editing.
//   2. Browser-level tab close / refresh / external navigation → native
//      `beforeunload` prompt (the only thing browsers allow there).
// Auto-save already persists most edits within a couple of seconds; this covers
// the gap where the debounce/save is still pending or a save failed.
import { onBeforeRouteLeave } from 'vue-router'

const props = defineProps<{
  /** True when the live form has unsaved changes (usePostForm.isDirty). */
  dirty: boolean
  /** Persists the form. Returns a truthy id on success, falsy on failure. */
  save: () => Promise<unknown>
  /** Freeze auto-save while the modal is open (so it can't save/toast mid-decision). */
  pause?: () => void
  /** Re-arm auto-save when the user chooses to keep editing. */
  resume?: () => void
}>()

const { t } = useDashboardI18n()

const open = ref(false)
const saving = ref(false)
const pendingPath = ref<string | null>(null)
// Set just before we re-issue the navigation the user confirmed, so the guard
// lets that second pass through instead of re-prompting.
const bypass = ref(false)

onBeforeRouteLeave((to) => {
  if (bypass.value || !props.dirty) return true
  pendingPath.value = to.fullPath
  open.value = true
  // Stop the pending debounced auto-save from firing (and toasting "saved")
  // while the user decides.
  props.pause?.()
  return false
})

const proceed = async () => {
  bypass.value = true
  open.value = false
  if (pendingPath.value) await navigateTo(pendingPath.value)
}

const saveAndLeave = async () => {
  saving.value = true
  let ok = false
  try {
    ok = Boolean(await props.save())
  } finally {
    saving.value = false
  }
  // On failure keep the modal open — the editor's save-error toast explains why,
  // and the user can still choose to discard or keep editing.
  if (ok) await proceed()
}

const discardAndLeave = () => proceed()

const keepEditing = () => {
  open.value = false
  pendingPath.value = null
  props.resume?.()
}

// Browser-level guard. Native dialog text isn't customisable; presence is what
// matters. Only armed while there are genuinely unsaved changes.
const onBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!props.dirty) return
  event.preventDefault()
  event.returnValue = ''
}
onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <div class="flex items-start gap-3">
          <UIcon
            name="i-lucide-triangle-alert"
            class="mt-0.5 size-5 shrink-0 text-warning"
          />
          <div>
            <h2 class="text-base font-semibold text-highlighted">
              {{ t.unsavedTitle }}
            </h2>
            <p class="mt-1 text-sm text-muted">
              {{ t.unsavedBody }}
            </p>
          </div>
        </div>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <UButton
            color="neutral"
            variant="ghost"
            @click="keepEditing"
          >
            {{ t.unsavedStay }}
          </UButton>
          <UButton
            color="error"
            variant="subtle"
            @click="discardAndLeave"
          >
            {{ t.unsavedDiscardLeave }}
          </UButton>
          <UButton
            color="primary"
            icon="i-lucide-save"
            :loading="saving"
            @click="saveAndLeave"
          >
            {{ t.unsavedSaveLeave }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
