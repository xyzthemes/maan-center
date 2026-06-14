<script setup lang="ts">
// Phase 6: shared rich-text editor for the dashboard, wraps Nuxt UI's UEditor
// with a Tigris-backed image upload button. Both PostEditorForm and
// PageEditorForm consume this; the toolbar item set is identical, and the
// image upload is the same flow.

import type { EditorToolbarItem, EditorCustomHandlers } from '@nuxt/ui'
// FontSize lives in @tiptap/extension-text-style (it requires the TextStyle
// mark). Neither is in UEditor's default extension set, so we register both
// via the `extensions` prop below.
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
// Node primitive for the minimal video/audio embed extensions (StarterKit has
// no media nodes, so without these ProseMirror would strip inserted <video>/
// <audio> tags on parse). Both are direct @tiptap deps added for S3/S4.
import { Node } from '@tiptap/core'

// Structural alias: the Editor type lives in @tiptap/vue-3 (a transitive of
// @nuxt/ui, not a direct dep). Pulling it through the handler signature keeps
// us from depending on @tiptap directly while still getting the correct API.
type EditorArg = Parameters<EditorCustomHandlers[string]['execute']>[0]

// Minimal block node that round-trips a <video controls src="…"> element so
// embedded media survives the ProseMirror parse/serialize cycle and renders in
// saved HTML. SSR-safe (pure schema, no browser globals).
const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes: () => ({
    src: { default: null }
  }),
  parseHTML: () => [{ tag: 'video[src]' }],
  renderHTML: ({ HTMLAttributes }) => [
    'video',
    { controls: 'true', style: 'max-width:100%', ...HTMLAttributes }
  ]
})

const Audio = Node.create({
  name: 'audio',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes: () => ({
    src: { default: null }
  }),
  parseHTML: () => [{ tag: 'audio[src]' }],
  renderHTML: ({ HTMLAttributes }) => [
    'audio',
    { controls: 'true', ...HTMLAttributes }
  ]
})

// All custom extensions registered on UEditor. SSR-safe schema extensions.
const editorExtensions = [TextStyle, FontSize, Video, Audio]

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

// The three upload modes the hidden file input can be opened in. Each maps to a
// distinct `accept` filter and a distinct insertion into the document.
type UploadKind = 'image' | 'file' | 'media'

const fileInput = ref<HTMLInputElement | null>(null)
const pendingEditor = ref<EditorArg | null>(null)
const pendingKind = ref<UploadKind>('image')
const isUploading = ref(false)
const uploadError = ref<string | null>(null)

const ACCEPT_BY_KIND: Record<UploadKind, string> = {
  image: 'image/png,image/jpeg,image/webp,image/avif,image/gif',
  // Documents — must match the server allow-list in upload.post.ts.
  file: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ].join(','),
  media: 'video/*,audio/*'
}

// Shared opener for the hidden file input. Records which kind of upload the
// picker is serving so `onFilePicked` can insert the right node afterwards.
function openPicker(editor: EditorArg, kind: UploadKind) {
  pendingEditor.value = editor
  pendingKind.value = kind
  uploadError.value = null
  fileInput.value?.click()
  // Returning the chain keeps focus inside the editor; the upload async chain
  // runs out-of-band and inserts content when it completes.
  return editor.chain().focus()
}

// Custom handlers — each overrides any default URL prompt and routes through the
// hidden file-input upload flow. `image` keeps the existing setImage behavior;
// `file`/`media` insert plain HTML (download link / <video>/<audio>).
const handlers = {
  image: {
    canExecute: (editor: EditorArg) => editor.can().setImage({ src: '' }),
    execute: (editor: EditorArg) => openPicker(editor, 'image'),
    isActive: (editor: EditorArg) => editor.isActive('image'),
    isDisabled: (editor: EditorArg) => !editor.isEditable || isUploading.value
  },
  file: {
    canExecute: (editor: EditorArg) => editor.isEditable,
    execute: (editor: EditorArg) => openPicker(editor, 'file'),
    isActive: () => false,
    isDisabled: (editor: EditorArg) => !editor.isEditable || isUploading.value
  },
  media: {
    canExecute: (editor: EditorArg) => editor.isEditable,
    execute: (editor: EditorArg) => openPicker(editor, 'media'),
    isActive: () => false,
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
    { kind: 'file', icon: 'i-lucide-paperclip', tooltip: { text: 'Attach file (PDF, doc)' } },
    { kind: 'media', icon: 'i-lucide-clapperboard', tooltip: { text: 'Embed video / audio' } },
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

const accept = computed(() => ACCEPT_BY_KIND[pendingKind.value])

// Escape user-controlled text before it goes into raw inserted HTML (filename,
// alt) — the URL comes from our own upload response but escape it too for safety.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function onFilePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  // Reset right away so picking the same file twice still triggers `change`.
  input.value = ''
  const editor = pendingEditor.value
  const kind = pendingKind.value
  if (!file || !editor) return

  // Accessibility — every <img> in our content needs alt text. Ask before upload.
  const alt = kind === 'image'
    ? (window.prompt('Describe this image (alt text for screen readers)', '')?.trim() ?? '')
    : ''

  uploadError.value = null
  isUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<{ url: string, contentType: string }>('/api/upload', { method: 'POST', body: fd })
    insertUpload(editor, kind, res.url, res.contentType, file.name)
  } catch (err) {
    const fetchError = err as { data?: { message?: string }, statusMessage?: string, message?: string }
    uploadError.value = fetchError.data?.message || fetchError.statusMessage || fetchError.message || 'Upload failed.'
  } finally {
    isUploading.value = false
    pendingEditor.value = null
  }

  // Insert the uploaded asset based on its kind.
  function insertUpload(editor: EditorArg, kind: UploadKind, url: string, contentType: string, filename: string) {
    if (kind === 'image') {
      editor.chain().focus().setImage({ src: url, alt }).run()
      return
    }
    const safeUrl = escapeHtml(url)
    if (kind === 'media' && contentType.startsWith('video/')) {
      editor.chain().focus().insertContent(
        `<video controls src="${safeUrl}" style="max-width:100%"></video>`
      ).run()
      return
    }
    if (kind === 'media' && contentType.startsWith('audio/')) {
      editor.chain().focus().insertContent(
        `<audio controls src="${safeUrl}"></audio>`
      ).run()
      return
    }
    // Document attachment → styled download link labelled with the filename.
    const label = escapeHtml(filename || 'Download file')
    editor.chain().focus().insertContent(
      `<a href="${safeUrl}" download rel="noopener" class="maan-attachment">${label}</a>`
    ).run()
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

    <!-- Hidden file input driven by the image / file / media toolbar handlers.
         `accept` switches with the active upload kind. -->
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      @change="onFilePicked"
    >

    <p
      v-if="isUploading"
      class="mt-2 text-xs text-muted"
    >
      Uploading…
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
