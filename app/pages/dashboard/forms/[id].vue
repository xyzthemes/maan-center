<script setup lang="ts">
definePageMeta({
  alias: ['/ar/dashboard/forms/:id'],
  layout: 'dashboard'
})

const route = useRoute()
const { t, isArabic } = useDashboardI18n()
const { loadForms, deleteForm } = useDashboardForms()
const {
  formForm,
  saveError,
  saveSuccess,
  isSaving,
  editForm,
  newForm,
  saveForm
} = useFormForm(loadForms)
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
const backHref = computed(() => isArabic.value ? '/ar/dashboard/forms' : '/dashboard/forms')

const isDeleteOpen = ref(false)
const isDeleting = ref(false)

const primeForm = async () => {
  notFound.value = false
  if (isNew.value) {
    newForm()
    return
  }
  try {
    const res = await $fetch<{ data?: Parameters<typeof editForm>[0] }>(`/api/dashboard/forms/${id.value}`)
    if (res?.data) {
      editForm(res.data)
    } else {
      notFound.value = true
    }
  } catch {
    notFound.value = true
  }
}

const onSave = async () => {
  const savedId = await saveForm()
  if (isNew.value && savedId) {
    await navigateTo(
      isArabic.value ? `/ar/dashboard/forms/${savedId}` : `/dashboard/forms/${savedId}`,
      { replace: true }
    )
  }
}

const onDelete = async () => {
  if (!formForm.id) return
  isDeleting.value = true
  const ok = await deleteForm(formForm.id)
  isDeleting.value = false
  if (ok) {
    isDeleteOpen.value = false
    dashToast.deleted()
    await navigateTo(backHref.value, { replace: true })
  } else {
    dashToast.deleteFailed()
  }
}

watch(() => route.params.id, () => {
  if (route.path.includes('/dashboard/forms/')) {
    primeForm()
  }
}, { immediate: true })
</script>

<template>
  <UDashboardPanel id="form-edit">
    <template #header>
      <UDashboardNavbar :title="isNew ? t.createForm : t.editForm">
        <template #leading>
          <UButton
            :to="backHref"
            :icon="isArabic ? 'i-lucide-arrow-right' : 'i-lucide-arrow-left'"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            :aria-label="t.forms"
          />
        </template>
        <template #right>
          <UButton
            v-if="!isNew && formForm.id"
            color="error"
            variant="outline"
            size="sm"
            icon="i-lucide-trash-2"
            @click="isDeleteOpen = true"
          >
            {{ t.deleteFormConfirmTitle }}
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UAlert
        v-if="notFound"
        color="error"
        variant="soft"
        :title="t.noFormsYet"
        :description="`#${id}`"
        class="mb-4"
      />

      <FormEditorForm
        v-else
        v-model="formForm"
        :is-saving="isSaving"
        :save-error="saveError"
        :save-success="saveSuccess"
        @save="onSave"
        @clear="primeForm"
      />

      <UModal v-model:open="isDeleteOpen">
        <template #content>
          <div class="p-6">
            <h3 class="text-lg font-semibold text-highlighted">
              {{ t.deleteFormConfirmTitle }}
            </h3>
            <p class="mt-2 text-sm text-muted">
              {{ t.deleteFormConfirmDescription }}
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
