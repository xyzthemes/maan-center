<script setup lang="ts">
// Invite-a-new-member page. POST creates the user + dispatches an
// invitation email; on success the new staff record's id is returned
// and we navigate to the edit page for further tweaks.

definePageMeta({
  alias: ['/ar/dashboard/staff/new'],
  layout: 'dashboard'
})

const { t, isArabic } = useDashboardI18n()
const { loadStaff } = useDashboardStaff()
const { staffForm, saveError, saveSuccess, isSaving, newStaff, saveStaff } = useStaffForm(loadStaff)
const dashToast = useDashboardToast()

watch(saveSuccess, (msg) => {
  if (msg) dashToast.saved(msg)
})
watch(saveError, (msg) => {
  if (msg) dashToast.failed(msg)
})

const backHref = computed(() => isArabic.value ? '/ar/dashboard/staff' : '/dashboard/staff')

const onSave = async () => {
  const id = await saveStaff()
  if (id) {
    await navigateTo(isArabic.value ? `/ar/dashboard/staff/${id}` : `/dashboard/staff/${id}`, { replace: true })
  }
}

onMounted(newStaff)
</script>

<template>
  <UDashboardPanel id="staff-new">
    <template #header>
      <UDashboardNavbar :title="t.inviteStaff">
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
      </UDashboardNavbar>
    </template>

    <template #body>
      <StaffEditorForm
        v-model="staffForm"
        mode="invite"
        :is-saving="isSaving"
        :save-error="saveError"
        :save-success="saveSuccess"
        @save="onSave"
      />
    </template>
  </UDashboardPanel>
</template>
