<script setup lang="ts">
// Phase 6: shared rich-text editor for the dashboard, wraps Nuxt UI's UEditor
// with a Tigris-backed image upload button. Both PostEditorForm and
// PageEditorForm consume this; the toolbar item set is identical, and the
// image upload is the same flow.

import type { EditorToolbarItem, EditorCustomHandlers } from '@nuxt/ui'

// Structural alias: the Editor type lives in @tiptap/vue-3 (a transitive of
// @nuxt/ui, not a direct dep). Pulling it through the handler signature keeps
// us from depending on @tiptap directly while still getting the correct API.
type EditorArg = Parameters<EditorCustomHandlers[string]['execute']>[0]

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const content = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const fileInput = ref<HTMLInputElement | null>(null)
const pendingEditor = ref<EditorArg | null>(null)
const isUploading = ref(false)
const uploadError = ref<string | null>(null)

// Custom `image` handler — overrides UEditor's default URL prompt. Stashes the
// active editor instance, opens the hidden file input, and lets `onFilePicked`
// drive the rest of the flow asynchronously.
const handlers = {
  image: {
    canExecute: (editor: EditorArg) => editor.can().setImage({ src: '' }),
    execute: (editor: EditorArg) => {
      pendingEditor.value = editor
      uploadError.value = null
      fileInput.value?.click()
      // Returning the chain keeps focus inside the editor; the upload async
      // chain runs out-of-band and inserts the image when it completes.
      return editor.chain().focus()
    },
    isActive: (editor: EditorArg) => editor.isActive('image'),
    isDisabled: (editor: EditorArg) => !editor.isEditable || isUploading.value
  }
} satisfies EditorCustomHandlers

const editorToolbarItems: EditorToolbarItem<typeof handlers>[][] = [
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
    { kind: 'image', icon: 'i-lucide-image', tooltip: { text: 'Insert image' } },
    { kind: 'undo', icon: 'i-lucide-undo-2', tooltip: { text: 'Undo' } },
    { kind: 'redo', icon: 'i-lucide-redo-2', tooltip: { text: 'Redo' } },
    { kind: 'clearFormatting', icon: 'i-lucide-eraser', tooltip: { text: 'Clear formatting' } }
  ]
]

const ACCEPT = 'image/png,image/jpeg,image/webp,image/avif,image/gif'

async function onFilePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  // Reset right away so picking the same file twice still triggers `change`.
  input.value = ''
  const editor = pendingEditor.value
  if (!file || !editor) return

  // Accessibility — every <img> in our content needs alt text. Ask before upload.

  const alt = window.prompt('Describe this image (alt text for screen readers)', '')?.trim() ?? ''

  uploadError.value = null
  isUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body: fd })
    editor.chain().focus().setImage({ src: res.url, alt }).run()
  } catch (err) {
    const fetchError = err as { data?: { message?: string }, statusMessage?: string, message?: string }
    uploadError.value = fetchError.data?.message || fetchError.statusMessage || fetchError.message || 'Image upload failed.'
  } finally {
    isUploading.value = false
    pendingEditor.value = null
  }
}
</script>

<template>
  <div class="maan-dashboard-editor-shell">
    <UEditor
      v-model="content"
      content-type="html"
      :placeholder="placeholder"
      :handlers="handlers"
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

    <!-- Hidden file input driven by the custom `image` handler above. -->
    <input
      ref="fileInput"
      type="file"
      :accept="ACCEPT"
      class="hidden"
      @change="onFilePicked"
    >

    <p
      v-if="isUploading"
      class="mt-2 text-xs text-muted"
    >
      Uploading image…
    </p>
    <UAlert
      v-if="uploadError"
      class="mt-2"
      color="error"
      variant="soft"
      :title="uploadError"
    />
  </div>
</template>
