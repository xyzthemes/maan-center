<script setup lang="ts">
// S8: Category management. Single-page CRUD over /api/dashboard/categories
// (S7 routes). The slug is the stable key stored in Post.categories String[];
// editing a name only changes the display label, editing a slug does NOT
// rewrite existing posts (they fall back to the raw slug — see useCategories).
//
// Gated by the same `posts` permission scope as the posts list (the route is
// reachable only through the sidebar entry which filters on that scope, and
// every API call is server-side requirePermission('posts')).

import type { DashboardCategory } from '~/composables/useCategories'

definePageMeta({
  alias: ['/ar/dashboard/categories'],
  layout: 'dashboard'
})

const { t, isArabic } = useDashboardI18n()
const {
  categories,
  categoriesError,
  isLoading,
  loadCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = useCategories()

const lang = computed<'en' | 'ar'>(() => isArabic.value ? 'ar' : 'en')
const labelFor = (c: DashboardCategory) => lang.value === 'ar' ? c.name_ar : c.name_en

const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = [...categories.value].sort((a, b) => {
    if (a.sort != null && b.sort != null && a.sort !== b.sort) return a.sort - b.sort
    if (a.sort != null && b.sort == null) return -1
    if (a.sort == null && b.sort != null) return 1
    return a.name_en.localeCompare(b.name_en)
  })
  if (!q) return list
  return list.filter(c => `${c.name_en} ${c.name_ar} ${c.slug}`.toLowerCase().includes(q))
})

// ── Editor modal ──────────────────────────────────────────────────────────
const isFormOpen = ref(false)
const editingId = ref<string | null>(null)
const formError = ref('')
const isSaving = ref(false)
const draft = reactive({ slug: '', name_en: '', name_ar: '', sort: '' as string })

const openCreate = () => {
  editingId.value = null
  draft.slug = ''
  draft.name_en = ''
  draft.name_ar = ''
  draft.sort = ''
  formError.value = ''
  isFormOpen.value = true
}

const openEdit = (c: DashboardCategory) => {
  editingId.value = c.id
  draft.slug = c.slug
  draft.name_en = c.name_en
  draft.name_ar = c.name_ar
  draft.sort = c.sort == null ? '' : String(c.sort)
  formError.value = ''
  isFormOpen.value = true
}

const { saved: toastSaved, deleted: toastDeleted, deleteFailed: toastDeleteFailed } = useDashboardToast()

const onSubmit = async () => {
  formError.value = ''
  if (!draft.name_en.trim() || !draft.name_ar.trim()) {
    formError.value = t.value.categoryNamesRequired
    return
  }
  isSaving.value = true
  const payload = {
    slug: draft.slug.trim() || undefined,
    name_en: draft.name_en.trim(),
    name_ar: draft.name_ar.trim(),
    sort: draft.sort.trim() === '' ? null : Number(draft.sort)
  }
  const result = editingId.value
    ? await updateCategory(editingId.value, payload)
    : await createCategory(payload)
  isSaving.value = false

  if (result.ok) {
    isFormOpen.value = false
    toastSaved(result.data.name_en)
  } else {
    formError.value = result.error
  }
}

// ── Delete modal ──────────────────────────────────────────────────────────
const isDeleteOpen = ref(false)
const deletingTarget = ref<DashboardCategory | null>(null)
const isDeleting = ref(false)

const openDelete = (c: DashboardCategory) => {
  deletingTarget.value = c
  isDeleteOpen.value = true
}

const onDelete = async () => {
  if (!deletingTarget.value) return
  isDeleting.value = true
  const result = await deleteCategory(deletingTarget.value.id)
  isDeleting.value = false
  if (result.ok) {
    isDeleteOpen.value = false
    deletingTarget.value = null
    toastDeleted()
  } else {
    toastDeleteFailed(result.error)
  }
}

onMounted(() => loadCategories(true))
</script>

<template>
  <UDashboardPanel id="categories-list">
    <template #header>
      <UDashboardNavbar
        :title="t.manageCategories"
        icon="i-lucide-tags"
      >
        <template #right>
          <UBadge
            color="neutral"
            variant="subtle"
            class="hidden sm:inline-flex"
          >
            {{ categories.length }}
          </UBadge>
          <UButton
            icon="i-lucide-plus"
            size="sm"
            @click="openCreate"
          >
            {{ t.newCategory }}
          </UButton>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="search"
            :placeholder="t.searchCategories"
            icon="i-lucide-search"
            size="sm"
            class="w-full max-w-xs"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UAlert
        v-if="categoriesError"
        color="error"
        variant="soft"
        :title="categoriesError"
        class="mb-4"
      />

      <div
        v-if="isLoading && categories.length === 0"
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <MaanSkeletonGrid :count="6" />
      </div>

      <MaanEmptyState
        v-else-if="!categoriesError && categories.length === 0"
        icon="i-lucide-tags"
        :title="t.noCategoriesYet"
        :description="t.createFirstCategoryHint"
      />

      <div
        v-else
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="category in filtered"
          :key="category.id"
          class="maan-card flex flex-col gap-3 p-5 text-start"
          style="border-top: 4px solid var(--maan-autism);"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3
                class="truncate text-base font-semibold"
                style="color: var(--maan-ink);"
              >
                {{ labelFor(category) }}
              </h3>
              <p
                class="mt-1 truncate text-xs"
                style="color: var(--maan-ink-muted);"
              >
                {{ lang === 'ar' ? category.name_en : category.name_ar }}
              </p>
            </div>
            <code
              class="shrink-0 rounded-md border px-1.5 py-0.5 text-[11px]"
              style="border-color: var(--maan-line); color: var(--maan-ink-muted);"
              dir="ltr"
            >{{ category.slug }}</code>
          </div>

          <div class="mt-auto flex items-center gap-2">
            <UButton
              color="neutral"
              variant="subtle"
              size="xs"
              icon="i-lucide-pencil"
              @click="openEdit(category)"
            >
              {{ t.edit }}
            </UButton>
            <UButton
              color="error"
              variant="ghost"
              size="xs"
              icon="i-lucide-trash-2"
              @click="openDelete(category)"
            >
              {{ t.delete }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Create / edit modal -->
      <UModal v-model:open="isFormOpen">
        <template #content>
          <form
            class="grid gap-4 p-6"
            @submit.prevent="onSubmit"
          >
            <h3 class="text-lg font-semibold text-highlighted">
              {{ editingId ? t.editCategory : t.createCategory }}
            </h3>

            <UAlert
              v-if="formError"
              color="error"
              variant="soft"
              :title="formError"
            />

            <label>
              <span class="mb-1.5 block text-sm font-semibold text-highlighted">{{ t.categoryNameEn }}</span>
              <input
                v-model="draft.name_en"
                class="maan-form-input"
                dir="ltr"
                required
              >
            </label>

            <label>
              <span class="mb-1.5 block text-sm font-semibold text-highlighted">{{ t.categoryNameAr }}</span>
              <input
                v-model="draft.name_ar"
                class="maan-form-input"
                dir="rtl"
                required
              >
            </label>

            <label>
              <span class="mb-1.5 block text-sm font-semibold text-highlighted">{{ t.categorySlug }}</span>
              <input
                v-model="draft.slug"
                class="maan-form-input"
                dir="ltr"
                placeholder="category-slug"
              >
              <span class="mt-1 block text-xs leading-5 text-muted">{{ t.categorySlugHint }}</span>
            </label>

            <label>
              <span class="mb-1.5 block text-sm font-semibold text-highlighted">{{ t.categorySort }}</span>
              <input
                v-model="draft.sort"
                class="maan-form-input"
                type="number"
                dir="ltr"
              >
            </label>

            <div class="mt-2 flex justify-end gap-3">
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                :disabled="isSaving"
                @click="isFormOpen = false"
              >
                {{ t.cancel }}
              </UButton>
              <UButton
                type="submit"
                icon="i-lucide-save"
                :loading="isSaving"
              >
                {{ t.save }}
              </UButton>
            </div>
          </form>
        </template>
      </UModal>

      <!-- Delete confirm modal -->
      <UModal v-model:open="isDeleteOpen">
        <template #content>
          <div class="p-6">
            <h3 class="text-lg font-semibold text-highlighted">
              {{ t.deleteCategory }}
            </h3>
            <p class="mt-2 text-sm text-muted">
              {{ t.confirmDeleteCategory }}
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
