<script setup lang="ts">
// Per-staff edit page. Identity / role / permissions in the shared
// StaffEditorForm component; account actions (resend invite, ban,
// delete) sit below in a dedicated panel.

definePageMeta({
  alias: ['/ar/dashboard/staff/:id'],
  layout: 'dashboard'
})

const route = useRoute()
const { t, isArabic } = useDashboardI18n()
const { user } = useDashboardUser()
const { loadStaff, deleteStaff, resendInvite, banStaff, unbanStaff } = useDashboardStaff()
const { staffForm, saveError, saveSuccess, isSaving, editStaff, newStaff, saveStaff } = useStaffForm(loadStaff)
const dashToast = useDashboardToast()

watch(saveSuccess, (msg) => {
  if (msg) dashToast.saved(msg)
})
watch(saveError, (msg) => {
  if (msg) dashToast.failed(msg)
})

const id = computed(() => String(route.params.id))
const isNew = computed(() => id.value === 'new')
const notFound = ref(false)
const backHref = computed(() => isArabic.value ? '/ar/dashboard/staff' : '/dashboard/staff')

const isSelf = computed(() => user.value?.id === staffForm.id)

// Track the original record for the action buttons (ban state, etc.)
// since the form draft only carries the editable fields.
const original = ref<{
  banned: boolean
  banReason: string | null
  lastSignInAt: string | null
} | null>(null)

const primeForm = async () => {
  notFound.value = false
  if (isNew.value) {
    newStaff()
    return
  }
  try {
    const res = await $fetch<{ data?: Parameters<typeof editStaff>[0] & { banned: boolean, banReason: string | null, lastSignInAt: string | null } }>(`/api/dashboard/staff/${id.value}`)
    if (res?.data) {
      editStaff(res.data)
      original.value = {
        banned: !!res.data.banned,
        banReason: res.data.banReason || null,
        lastSignInAt: res.data.lastSignInAt || null
      }
    } else {
      notFound.value = true
    }
  } catch {
    notFound.value = true
  }
}

const onSave = () => saveStaff()

// ── Account actions ──────────────────────────────────────────────────

const isResending = ref(false)
const onResendInvite = async () => {
  if (!staffForm.id) return
  isResending.value = true
  const res = await resendInvite(staffForm.id)
  isResending.value = false
  if (res.ok) {
    dashToast.saved(t.value.inviteSent)
  } else {
    dashToast.failed(res.error || t.value.inviteSendFailed)
  }
}

const isBanOpen = ref(false)
const isBanning = ref(false)
const banReason = ref('')
const onBanConfirm = async () => {
  if (!staffForm.id) return
  isBanning.value = true
  const res = await banStaff(staffForm.id, { reason: banReason.value || undefined })
  isBanning.value = false
  if (res.ok) {
    isBanOpen.value = false
    banReason.value = ''
    if (original.value) original.value.banned = true
    dashToast.saved(t.value.staffSavedSuccess)
  } else {
    dashToast.failed(res.error)
  }
}

const onUnban = async () => {
  if (!staffForm.id) return
  const res = await unbanStaff(staffForm.id)
  if (res.ok) {
    if (original.value) original.value.banned = false
    dashToast.saved(t.value.staffSavedSuccess)
  } else {
    dashToast.failed(res.error)
  }
}

const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const onDelete = async () => {
  if (!staffForm.id) return
  isDeleting.value = true
  const res = await deleteStaff(staffForm.id)
  isDeleting.value = false
  if (res.ok) {
    isDeleteOpen.value = false
    dashToast.deleted()
    await navigateTo(backHref.value, { replace: true })
  } else {
    dashToast.deleteFailed(res.error)
  }
}

watch(() => route.params.id, () => {
  if (route.path.includes('/dashboard/staff/')) {
    primeForm()
  }
}, { immediate: true })
</script>

<template>
  <UDashboardPanel id="staff-edit">
    <template #header>
      <UDashboardNavbar :title="staffForm.name || t.editStaff">
        <template #leading>
          <UButton
            :to="backHref"
            :icon="isArabic ? 'i-lucide-arrow-right' : 'i-lucide-arrow-left'"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            :aria-label="t.staff"
          />
        </template>
        <template #right>
          <UBadge
            v-if="original?.banned"
            color="error"
            variant="subtle"
            icon="i-lucide-ban"
          >
            {{ t.staffBanned }}
          </UBadge>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UAlert
        v-if="notFound"
        color="error"
        variant="soft"
        :title="t.noStaffYet"
        :description="`#${id}`"
        class="mb-4"
      />

      <div
        v-else
        class="grid gap-6"
      >
        <StaffEditorForm
          v-model="staffForm"
          mode="edit"
          :is-saving="isSaving"
          :save-error="saveError"
          :save-success="saveSuccess"
          :is-self="isSelf"
          @save="onSave"
        />

        <!-- Account actions — only available for existing users -->
        <section
          v-if="staffForm.id"
          class="maan-card p-6"
        >
          <h3
            class="mb-4 text-sm font-bold uppercase tracking-wider"
            :style="{ color: 'var(--maan-ink)' }"
          >
            {{ t.editStaff }}
          </h3>

          <div class="grid gap-3 sm:grid-cols-2">
            <UButton
              icon="i-lucide-mail"
              color="neutral"
              variant="outline"
              :loading="isResending"
              @click="onResendInvite"
            >
              {{ t.resendInvite }}
            </UButton>

            <UButton
              v-if="!original?.banned"
              icon="i-lucide-ban"
              color="warning"
              variant="outline"
              :disabled="isSelf"
              @click="isBanOpen = true"
            >
              {{ t.banStaff }}
            </UButton>
            <UButton
              v-else
              icon="i-lucide-circle-check"
              color="success"
              variant="outline"
              @click="onUnban"
            >
              {{ t.unbanStaff }}
            </UButton>

            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="outline"
              :disabled="isSelf"
              class="sm:col-span-2"
              @click="isDeleteOpen = true"
            >
              {{ t.deleteStaffConfirmTitle }}
            </UButton>
          </div>
        </section>
      </div>

      <!-- Ban confirm modal -->
      <UModal v-model:open="isBanOpen">
        <template #content>
          <div class="p-6">
            <h3 class="text-lg font-semibold text-highlighted">
              {{ t.banStaff }}
            </h3>
            <label class="mt-4 block">
              <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.banReasonOptional }}</span>
              <textarea
                v-model="banReason"
                class="maan-form-input min-h-20"
                rows="3"
              />
            </label>
            <div class="mt-5 flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="ghost"
                :disabled="isBanning"
                @click="isBanOpen = false"
              >
                {{ t.cancel }}
              </UButton>
              <UButton
                color="warning"
                icon="i-lucide-ban"
                :loading="isBanning"
                @click="onBanConfirm"
              >
                {{ t.banStaff }}
              </UButton>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Delete confirm modal -->
      <UModal v-model:open="isDeleteOpen">
        <template #content>
          <div class="p-6">
            <h3 class="text-lg font-semibold text-highlighted">
              {{ t.deleteStaffConfirmTitle }}
            </h3>
            <p class="mt-2 text-sm text-muted">
              {{ t.deleteStaffConfirmDescription }}
            </p>
            <div class="mt-5 flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="ghost"
                :disabled="isDeleting"
                @click="isDeleteOpen = false"
              >
                {{ t.cancel }}
              </UButton>
              <UButton
                color="error"
                icon="i-lucide-trash-2"
                :loading="isDeleting"
                @click="onDelete"
              >
                {{ t.confirmDelete }}
              </UButton>
            </div>
          </div>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
