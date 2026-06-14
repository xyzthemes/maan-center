<script setup lang="ts">
import type { PostForm, AutoSaveStatus } from '~/composables/usePostForm'

const props = defineProps<{
  modelValue: PostForm
  isSaving: boolean
  saveError: string
  saveSuccess: string
  // Optional: only the [id] editor page drives auto-save; defaults to 'idle'.
  autoSaveStatus?: AutoSaveStatus
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PostForm]
  'save': []
  'clear': []
}>()

const { t, isArabic } = useDashboardI18n()
// S8: category options now come from the DB (admin-managed Category table)
// via useCategories instead of the static useMaanTaxonomy list. Degrades
// gracefully — a fetch failure leaves the list empty and the editor still
// renders; labels fall back to the raw slug for any orphaned category.
const { categories: dbCategories, loadCategories } = useCategories()
onMounted(loadCategories)

const form = computed({
  get: () => props.modelValue,
  set: (value: PostForm) => emit('update:modelValue', value)
})

// Dashboard locale drives label rendering inside USelectMenu so an
// Arabic-side editor sees Arabic option labels even though the slug
// stored in the DB stays canonical.
const lang = computed<'en' | 'ar'>(() => isArabic.value ? 'ar' : 'en')

// Option `value` stays a plain `string` so USelectMenu's inferred option
// type doesn't narrow — keeps form.categories typed as `string[]` (matches
// the DB column shape). Validation of unknown slugs still happens
// server-side (S7: DB-backed against the Category table on create/update).
//
// Orphan handling: any slug already stored on this post that no longer
// exists in the DB list (category deleted/renamed) is appended as an option
// labelled with its raw slug, so it stays visible + selectable instead of
// silently dropping out of the multi-select.
const categoryOptions = computed<Array<{ value: string, label: string }>>(() => {
  const opts = categoryOptionsFor(dbCategories.value, lang.value)
  const known = new Set(opts.map(o => o.value))
  for (const slug of form.value.categories || []) {
    if (!known.has(slug)) {
      opts.push({ value: slug, label: slug })
      known.add(slug)
    }
  }
  return opts
})
// Placement options are no longer rendered as a flat select — the
// visual picker (MaanPlacementPicker) reads the taxonomy directly.

// Auto-save indicator. Maps the composable's status to a bilingual label +
// icon/color; hidden while idle so it only appears once auto-save is active.
const autoSaveIndicator = computed(() => {
  switch (props.autoSaveStatus) {
    case 'saving':
      return { label: t.value.autoSaving, icon: 'i-lucide-loader-circle', class: 'text-muted', iconClass: 'size-4 animate-spin' }
    case 'saved':
      return { label: t.value.autoSaved, icon: 'i-lucide-check', class: 'text-success', iconClass: 'size-4' }
    case 'error':
      return { label: t.value.autoSaveError, icon: 'i-lucide-triangle-alert', class: 'text-error', iconClass: 'size-4' }
    default:
      return null
  }
})
</script>

<template>
  <form
    class="grid gap-5"
    @submit.prevent="emit('save')"
  >
    <p class="text-sm text-muted">
      {{ t.savedThroughCms }}
    </p>

    <label>
      <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.titleLabel }}</span>
      <input
        v-model="form.title"
        class="maan-form-input"
        required
      >
    </label>

    <label>
      <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.slug }}</span>
      <input
        v-model="form.slug"
        class="maan-form-input"
        placeholder="post-url-slug"
      >
    </label>

    <div class="grid gap-5 md:grid-cols-2">
      <label>
        <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.status }}</span>
        <select
          v-model="form.status"
          class="maan-form-input"
        >
          <option value="draft">
            {{ t.draft }}
          </option>
          <option value="in_review">
            {{ t.inReview }}
          </option>
          <option value="published">
            {{ t.published }}
          </option>
        </select>
      </label>

      <label>
        <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.publishedAt }}</span>
        <input
          v-model="form.published_at"
          class="maan-form-input"
          type="datetime-local"
        >
      </label>
    </div>

    <label>
      <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.description }}</span>
      <textarea
        v-model="form.description"
        class="maan-form-input min-h-24"
      />
    </label>

    <!--
      Layer 1 taxonomy — categories describe WHAT the post is about,
      placements describe WHERE on the site it surfaces. Both validate
      server-side against useMaanTaxonomy, so admins can only pick from
      the canonical list — typos can't silently disable a placement.

      Categories remain a chip multi-select (subject tags benefit from
      density); placements get the visual MaanPlacementPicker so admins
      see "Homepage — Latest articles" as a real destination rather
      than a slug string.
    -->
    <div>
      <label
        for="post-categories"
        class="mb-2 block text-sm font-semibold text-highlighted"
      >{{ t.categories }}</label>
      <USelectMenu
        id="post-categories"
        v-model="form.categories"
        :items="categoryOptions"
        value-key="value"
        multiple
        :placeholder="t.pickCategories"
        class="w-full"
      />
      <p class="mt-1 text-xs leading-5 text-muted">
        {{ t.categoriesHint }}
      </p>
    </div>

    <div>
      <p class="mb-2 block text-sm font-semibold text-highlighted">
        {{ t.placements }}
      </p>
      <p class="mb-3 text-xs leading-5 text-muted">
        {{ t.placementsHint }}
      </p>
      <MaanPlacementPicker v-model="form.placements" />
    </div>

    <div>
      <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.content }}</span>
      <DashboardEditor
        v-model="form.content"
        :placeholder="t.contentPlaceholder"
      />
      <p class="mt-2 text-xs leading-5 text-muted">
        {{ t.savedAsHtml }}
      </p>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <label>
        <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.seoTitle }}</span>
        <input
          v-model="form.seo.title"
          class="maan-form-input"
        >
      </label>
      <label>
        <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.focusKeyphrase }}</span>
        <input
          v-model="form.seo.focus_keyphrase"
          class="maan-form-input"
        >
      </label>
    </div>

    <label>
      <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.seoDescription }}</span>
      <textarea
        v-model="form.seo.meta_description"
        class="maan-form-input min-h-24"
      />
    </label>

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

    <div class="flex flex-wrap items-center gap-3">
      <UButton
        type="submit"
        size="xl"
        icon="i-lucide-save"
        :loading="isSaving"
      >
        {{ t.save }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="subtle"
        @click="emit('clear')"
      >
        {{ t.clear }}
      </UButton>
      <span
        v-if="autoSaveIndicator"
        class="inline-flex items-center gap-1.5 text-sm"
        :class="autoSaveIndicator.class"
        role="status"
        aria-live="polite"
      >
        <UIcon
          :name="autoSaveIndicator.icon"
          :class="autoSaveIndicator.iconClass"
        />
        {{ autoSaveIndicator.label }}
      </span>
    </div>
  </form>
</template>
