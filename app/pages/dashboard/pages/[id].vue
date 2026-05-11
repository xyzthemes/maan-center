<script setup lang="ts">
definePageMeta({
  alias: ['/ar/dashboard/pages/:id'],
  layout: 'dashboard'
})

const route = useRoute()
const { t, isArabic } = useDashboardI18n()
const { pages, loadPages } = usePagesAdmin()
const {
  pageForm,
  saveError,
  saveSuccess,
  isSaving,
  statusLabel,
  editPage,
  newPage,
  savePage,
  deletePage
} = usePageForm(loadPages)

const id = computed(() => String(route.params.id))
const isNew = computed(() => id.value === 'new')
const notFound = ref(false)
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const backHref = computed(() => isArabic.value ? '/ar/dashboard/pages' : '/dashboard/pages')

const onDelete = async () => {
  if (!pageForm.id) {
    return
  }

  isDeleting.value = true
  const ok = await deletePage(pageForm.id)
  isDeleting.value = false

  if (ok) {
    isDeleteOpen.value = false
    await navigateTo(backHref.value, { replace: true })
  }
}

const primeForm = async () => {
  notFound.value = false

  if (isNew.value) {
    newPage()

    return
  }

  if (pages.value.length === 0) {
    await loadPages()
  }

  const page = pages.value.find(p => p.id === id.value)

  if (!page) {
    notFound.value = true

    return
  }

  editPage(page)
}

const onSave = async () => {
  const savedId = await savePage()

  if (isNew.value && savedId) {
    await navigateTo(isArabic.value ? `/ar/dashboard/pages/${savedId}` : `/dashboard/pages/${savedId}`, { replace: true })
  }
}

watch(() => route.params.id, () => {
  if (route.path.includes('/dashboard/pages/')) {
    primeForm()
  }
}, { immediate: true })
</script>

<template>
  <UDashboardPanel id="page-edit">
    <template #header>
      <UDashboardNavbar :title="isNew ? t.createPage : (pageForm.title || t.editPage)">
        <template #leading>
          <UButton
            :to="backHref"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            :aria-label="t.websitePages"
            class="ltr:[&_.iconify]:rtl:rotate-180"
          />
        </template>
        <template #right>
          <UBadge
            color="secondary"
            variant="subtle"
          >
            {{ statusLabel(pageForm.status) }}
          </UBadge>
          <UButton
            v-if="!isNew && pageForm.id"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            :aria-label="t.deletePage"
            @click="isDeleteOpen = true"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UAlert
        v-if="notFound"
        color="error"
        variant="soft"
        :title="t.untitledPage"
        :description="`#${id}`"
        class="mb-4"
      />

      <PageEditorForm
        v-else
        v-model="pageForm"
        :is-saving="isSaving"
        :save-error="saveError"
        :save-success="saveSuccess"
        @save="onSave"
        @clear="primeForm"
      />
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="isDeleteOpen"
    :title="t.deletePageConfirmTitle"
    :description="t.deletePageConfirmDescription"
  >
    <template #footer>
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
    </template>
  </UModal>
</template>
