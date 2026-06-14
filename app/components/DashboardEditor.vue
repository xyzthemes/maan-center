<script setup lang="ts">
// Phase 6: shared rich-text editor for the dashboard, wraps Nuxt UI's UEditor
// with a Tigris-backed image upload button. Both PostEditorForm and
// PageEditorForm consume this; the toolbar item set is identical, and the
// image upload is the same flow.

import type { EditorToolbarItem, EditorCustomHandlers } from '@nuxt/ui'
// FontSize lives in @tiptap/extension-text-style (it requires the TextStyle
// mark). Neither is in UEditor's default extension set, so we register both
// via the `extensions` prop below. This is the one direct @tiptap dep we add.
import { TextStyle, FontSize } from '@tiptap/extension-text-style'

// Structural alias: the Editor type lives in @tiptap/vue-3 (a transitive of
// @nuxt/ui, not a direct dep). Pulling it through the handler signature keeps
// us from depending on @tiptap directly while still getting the correct API.
type EditorArg = Parameters<EditorCustomHandlers[string]['execute']>[0]

// TextStyle + FontSize are SSR-safe (pure ProseMirror schema extensions, no
// browser-only globals at import or construct time), so registering them
// statically is fine under Nuxt's SSR.
const editorExtensions = [TextStyle, FontSize]

// Font-size choices offered in the toolbar dropdown. The empty value clears any
// inline size back to the stylesheet default.
const fontSizeItems = [
  { label: 'Default', value: '' },
  { label: 'Small', value: '0.875rem' },
  { label: 'Normal', value: '1rem' },
  { label: 'Large', value: '1.25rem' },
  { label: 'X-Large', value: '1.5rem' },
  { label: 'Heading', value: '2rem' }
]

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
    // `link` is a built-in UEditor handler — it prompts for a URL when none is
    // provided, and toggles/removes the link on the current selection.
    { kind: 'link', icon: 'i-lucide-link', tooltip: { text: 'Insert link' } },
    { kind: 'image', icon: 'i-lucide-image', tooltip: { text: 'Insert image' } },
    { kind: 'undo', icon: 'i-lucide-undo-2', tooltip: { text: 'Undo' } },
    { kind: 'redo', icon: 'i-lucide-redo-2', tooltip: { text: 'Redo' } },
    { kind: 'clearFormatting', icon: 'i-lucide-eraser', tooltip: { text: 'Clear formatting' } }
  ]
]

// Apply (or clear) an inline font size on the current selection via the
// FontSize extension. Empty value → unset back to the stylesheet default.
function applyFontSize(editor: EditorArg, size: string) {
  const chain = editor.chain().focus()
  if (size) {
    chain.setFontSize(size).run()
  } else {
    chain.unsetFontSize().run()
  }
}

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
      :extensions="editorExtensions"
      :mention="false"
      class="maan-dashboard-editor"
      :ui="{ content: 'min-h-72 px-4 py-3 focus:outline-none' }"
    >
      <template #default="{ editor }">
        <div class="flex flex-wrap items-center gap-1 border-b border-default px-2 py-2">
          <UEditorToolbar
            :editor="editor"
            :items="editorToolbarItems"
            class="border-0 p-0"
          />
          <USelectMenu
            :model-value="undefined"
            :items="fontSizeItems"
            :search-input="false"
            value-key="value"
            placeholder="Font size"
            icon="i-lucide-type"
            size="sm"
            class="w-36"
            :ui="{ base: 'rounded-md' }"
            @update:model-value="(value: string) => applyFontSize(editor, value)"
          />
        </div>
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
