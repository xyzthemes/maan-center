<script setup lang="ts">
import type { PostForm } from '~/composables/usePostForm'

const props = defineProps<{
  modelValue: PostForm
  isSaving: boolean
  saveError: string
  saveSuccess: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PostForm]
  'save': []
  'clear': []
}>()

const { t, isArabic } = useDashboardI18n()
const { categories: taxonomyCategories, placements: taxonomyPlacements } = useMaanTaxonomy()

const form = computed({
  get: () => props.modelValue,
  set: (value: PostForm) => emit('update:modelValue', value)
})

// Dashboard locale drives label rendering inside USelectMenu so an
// Arabic-side editor sees Arabic option labels even though the slug
// stored in the DB stays canonical.
const lang = computed<'en' | 'ar'>(() => isArabic.value ? 'ar' : 'en')

// Coerce option `value` back to plain `string` so USelectMenu's inferred
// option type doesn't narrow to the literal union — keeps form.categories
// typed as `string[]` (which matches the DB column shape) and avoids a
// pile of `as PostCategoryId[]` casts at every binding site. Validation
// of unknown ids still happens server-side via sanitizeCategories.
const categoryOptions = computed<Array<{ value: string, label: string }>>(() =>
  taxonomyCategories.map(c => ({ value: c.id, label: c.label[lang.value] }))
)
const placementOptions = computed<Array<{ value: string, label: string }>>(() =>
  taxonomyPlacements.map(p => ({ value: p.id, label: p.label[lang.value] }))
)
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
    -->
    <div class="grid gap-5 md:grid-cols-2">
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
        <label
          for="post-placements"
          class="mb-2 block text-sm font-semibold text-highlighted"
        >{{ t.placements }}</label>
        <USelectMenu
          id="post-placements"
          v-model="form.placements"
          :items="placementOptions"
          value-key="value"
          multiple
          :placeholder="t.pickPlacements"
          class="w-full"
        />
        <p class="mt-1 text-xs leading-5 text-muted">
          {{ t.placementsHint }}
        </p>
      </div>
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

    <div class="flex flex-wrap gap-3">
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
    </div>
  </form>
</template>
