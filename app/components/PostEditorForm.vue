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

const { t } = useDashboardI18n()

const form = computed({
  get: () => props.modelValue,
  set: (value: PostForm) => emit('update:modelValue', value)
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
