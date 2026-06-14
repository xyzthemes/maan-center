// S8: API-loaded category taxonomy. Replaces the static POST_CATEGORIES
// list from useMaanTaxonomy as the *UI option source* for the editor
// category select + the dashboard list filter. The slug strings stay the
// stable key stored in Post.categories String[]; this composable just
// supplies the editable display labels (name_en/name_ar) from the DB.
//
// Two surfaces consume it:
//   • The management page (CRUD) — uses the mutation helpers.
//   • Read-only option sources (PostEditorForm, posts list filter) — use
//     `loadCategories` + the cached `categories` state + `labelForSlug`.
//
// Degrade-gracefully contract: a fetch failure leaves `categories` empty
// and surfaces `categoriesError`; callers fall back to the raw slug as the
// label so the post editor + public list never hard-crash on an API error
// or an orphaned slug from a deleted category.

import type { DashboardCategoryShape } from '~~/server/utils/dashboard-shapes'

export type DashboardCategory = DashboardCategoryShape

type MutationResult
  = | { ok: true, data: DashboardCategory }
    | { ok: false, error: string }

type DeleteResult
  = | { ok: true }
    | { ok: false, error: string }

export type CategoryInput = {
  slug?: string
  name_en: string
  name_ar: string
  sort?: number | null
}

const errorMessage = (error: unknown, fallback: string): string => {
  const e = error as { data?: { message?: string }, statusMessage?: string }
  return e?.data?.message || e?.statusMessage || fallback
}

export const useCategories = () => {
  const { t } = useDashboardI18n()
  // Shared across every consumer of the composable so the editor select,
  // the list filter, and the management page all read one cached list.
  const categories = useState<DashboardCategory[]>('dashboard-categories', () => [])
  const categoriesError = useState<string>('dashboard-categories-error', () => '')
  const isLoading = useState<boolean>('dashboard-categories-loading', () => false)
  const hasLoaded = useState<boolean>('dashboard-categories-loaded', () => false)

  const loadCategories = async (force = false) => {
    if (hasLoaded.value && !force) return
    categoriesError.value = ''
    isLoading.value = true
    try {
      const response = await $fetch<{ categories: DashboardCategory[] }>('/api/dashboard/categories')
      categories.value = response.categories
      hasLoaded.value = true
    } catch (error) {
      // Defensive: never throw. An empty list + the slug fallback keeps the
      // editor and list filter usable even if the API is down.
      categoriesError.value = errorMessage(error, t.value.readCategoriesError)
    } finally {
      isLoading.value = false
    }
  }

  const createCategory = async (input: CategoryInput): Promise<MutationResult> => {
    try {
      const res = await $fetch<{ data: DashboardCategory }>('/api/dashboard/categories', {
        method: 'POST',
        body: input
      })
      categories.value = [...categories.value, res.data]
      return { ok: true, data: res.data }
    } catch (error) {
      return { ok: false, error: errorMessage(error, t.value.saveCategoryError) }
    }
  }

  const updateCategory = async (id: string, input: CategoryInput): Promise<MutationResult> => {
    try {
      const res = await $fetch<{ data: DashboardCategory }>(`/api/dashboard/categories/${id}`, {
        method: 'PATCH',
        body: input
      })
      const idx = categories.value.findIndex(c => c.id === id)
      if (idx !== -1) categories.value[idx] = res.data
      return { ok: true, data: res.data }
    } catch (error) {
      return { ok: false, error: errorMessage(error, t.value.saveCategoryError) }
    }
  }

  const deleteCategory = async (id: string): Promise<DeleteResult> => {
    try {
      await $fetch(`/api/dashboard/categories/${id}`, { method: 'DELETE' })
      categories.value = categories.value.filter(c => c.id !== id)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: errorMessage(error, t.value.deleteCategoryError) }
    }
  }

  return {
    categories,
    categoriesError,
    isLoading,
    hasLoaded,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
}

/**
 * Build `{ value: slug, label }` option list for a USelect/USelectMenu in the
 * given locale. Used by the editor select + the list filter.
 */
export const categoryOptionsFor = (
  list: ReadonlyArray<DashboardCategory>,
  locale: 'en' | 'ar'
): Array<{ value: string, label: string }> =>
  list.map(c => ({
    value: c.slug,
    label: locale === 'ar' ? c.name_ar : c.name_en
  }))

/**
 * Resolve a stored slug to its localized label, FALLING BACK to the raw slug
 * when the category was deleted/renamed — so existing posts carrying an
 * orphaned slug still render a sensible chip instead of a blank.
 */
export const labelForCategorySlug = (
  list: ReadonlyArray<DashboardCategory>,
  slug: string,
  locale: 'en' | 'ar'
): string => {
  const found = list.find(c => c.slug === slug)
  if (!found) return slug
  return locale === 'ar' ? found.name_ar : found.name_en
}
