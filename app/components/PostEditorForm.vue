<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'
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

const editorToolbarItems: EditorToolbarItem[][] = [
  [
    { kind: 'paragraph', icon: 'i-lucide-pilcrow', tooltip: { text: 'Paragraph' } },
    { kind: 'heading', level: 2, label: 'H2', tooltip: { text: 'Heading 2' } },
    { kind: 'heading', level: 3, label: 'H3', tooltip: { text: 'Heading 3' } }
  ],
  [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: 'Bold' } },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: 'Italic' } },
    { kind: 'blockquote', icon: 'i-lucide-quote', tooltip: { text: 'Quote' } }
  ],
  [
    { kind: 'bulletList', icon: 'i-lucide-list', tooltip: { text: 'Bullet list' } },
    { kind: 'orderedList', icon: 'i-lucide-list-ordered', tooltip: { text: 'Numbered list' } }
  ],
  [
    { kind: 'undo', icon: 'i-lucide-undo-2', tooltip: { text: 'Undo' } },
    { kind: 'redo', icon: 'i-lucide-redo-2', tooltip: { text: 'Redo' } },
    { kind: 'clearFormatting', icon: 'i-lucide-eraser', tooltip: { text: 'Clear formatting' } }
  ]
]
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
      <UEditor
        v-model="form.content"
        content-type="html"
        :placeholder="t.contentPlaceholder"
        :image="false"
        :mention="false"
        class="maan-dashboard-editor"
        :ui="{ content: 'min-h-72 px-4 py-3 focus:outline-none' }"
      >
        <template #default="{ editor }">
          <UEditorToolbar
            :editor="editor"
            :items="editorToolbarItems"
            class="border-b border-default px-2 py-2"
          />
        </template>
      </UEditor>
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
