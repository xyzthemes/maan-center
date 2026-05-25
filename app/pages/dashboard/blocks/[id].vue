<script setup lang="ts">
definePageMeta({
  alias: ['/ar/dashboard/blocks/:id'],
  layout: 'dashboard'
})

const route = useRoute()
const { t, isArabic } = useDashboardI18n()
const { blocks, loadBlocks, deleteBlock } = useDashboardBlocks()
const {
  blockForm,
  saveError,
  saveSuccess,
  isSaving,
  statusLabel,
  editBlock,
  newBlock,
  saveBlock
} = useBlockForm(loadBlocks)

const id = computed(() => String(route.params.id))
const isNew = computed(() => id.value === 'new')
const notFound = ref(false)
const backHref = computed(() => isArabic.value ? '/ar/dashboard/blocks' : '/dashboard/blocks')

// `?type=` lets the New-block button pre-select a discriminator so admins
// landing from a "New testimonial" button don't have to pick it again.
const requestedType = computed(() => {
  const t = route.query.type
  return typeof t === 'string' ? t : 'testimonial'
})

const primeForm = async () => {
  notFound.value = false

  if (isNew.value) {
    newBlock(requestedType.value)
    return
  }

  if (blocks.value.length === 0) {
    await loadBlocks()
  }

  const block = blocks.value.find(b => b.id === id.value)
  if (!block) {
    notFound.value = true
    return
  }
  editBlock(block)
}

const onSave = async () => {
  const savedId = await saveBlock()
  if (isNew.value && savedId) {
    await navigateTo(isArabic.value ? `/ar/dashboard/blocks/${savedId}` : `/dashboard/blocks/${savedId}`, { replace: true })
  }
}

const confirmingDelete = ref(false)
const onDelete = async () => {
  if (!blockForm.id) return
  const ok = await deleteBlock(blockForm.id)
  if (ok) {
    confirmingDelete.value = false
    await navigateTo(backHref.value)
  }
}

watch(() => route.params.id, () => {
  if (route.path.includes('/dashboard/blocks/')) {
    primeForm()
  }
}, { immediate: true })
</script>

<template>
  <UDashboardPanel id="block-edit">
    <template #header>
      <UDashboardNavbar :title="isNew ? t.createBlock : t.editBlock">
        <template #leading>
          <UButton
            :to="backHref"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            :aria-label="t.contentBlocks"
            class="ltr:[&_.iconify]:rtl:rotate-180"
          />
        </template>
        <template #right>
          <UBadge
            color="secondary"
            variant="subtle"
          >
            {{ statusLabel(blockForm.status) }}
          </UBadge>
          <UButton
            v-if="!isNew && blockForm.id"
            color="error"
            variant="outline"
            size="sm"
            icon="i-lucide-trash-2"
            @click="confirmingDelete = true"
          >
            {{ t.deleteBlock }}
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UAlert
        v-if="notFound"
        color="error"
        variant="soft"
        :title="t.noBlocksFound"
        :description="`#${id}`"
        class="mb-4"
      />

      <BlockEditorForm
        v-else
        v-model="blockForm"
        :is-saving="isSaving"
        :save-error="saveError"
        :save-success="saveSuccess"
        @save="onSave"
        @clear="primeForm"
      />

      <UModal v-model:open="confirmingDelete">
        <template #content>
          <div class="p-6">
            <h3 class="text-lg font-semibold text-highlighted">
              {{ t.deleteBlockConfirmTitle }}
            </h3>
            <p class="mt-2 text-sm text-muted">
              {{ t.deleteBlockConfirmDescription }}
            </p>
            <div class="mt-5 flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="ghost"
                @click="confirmingDelete = false"
              >
                {{ t.cancel }}
              </UButton>
              <UButton
                color="error"
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
