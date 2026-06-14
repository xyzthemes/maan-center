<script setup lang="ts">
definePageMeta({
  alias: ['/ar/dashboard/posts/:id'],
  layout: 'dashboard'
})

const route = useRoute()
const { t, isArabic } = useDashboardI18n()
const { posts, loadPosts } = usePosts()
const {
  postForm,
  saveError,
  saveSuccess,
  isSaving,
  autoSaveStatus,
  isDirty,
  statusLabel,
  editPost,
  newPost,
  savePost,
  enableAutoSave
} = usePostForm(loadPosts)
const dashToast = useDashboardToast()

// Auto-save runs client-side only (it relies on debounce timers + the live
// form). Enabling it here — and not in the list page — keeps the list's use of
// usePostForm (statusOptions only) free of any save behavior.
onMounted(enableAutoSave)

// Fire a toast every time the save flow flips a flag. The inline
// success/error panels in PostEditorForm remain — the toast is the
// belt-and-suspenders global confirmation.
watch(saveSuccess, (msg) => {
  if (msg) dashToast.saved(msg)
})
watch(saveError, (msg) => {
  if (msg) dashToast.failed(msg)
})

const id = computed(() => String(route.params.id))
const isNew = computed(() => id.value === 'new')
const notFound = ref(false)
const backHref = computed(() => isArabic.value ? '/ar/dashboard/posts' : '/dashboard/posts')

// Live preview link (S9): renders the current saved post in the real public
// article layout, including unpublished drafts. Only available once the post
// has a real id (a brand-new unsaved /new post has nothing to preview yet);
// auto-save gains an id quickly, after which the button appears.
const previewHref = computed(() =>
  isArabic.value ? `/ar/dashboard/posts/${id.value}/preview` : `/dashboard/posts/${id.value}/preview`
)

// A brand-new post auto-saves once to gain an id; reflect that in the URL so a
// refresh lands on the real record instead of /new (replace = no history spam).
watch(() => postForm.id, (newId) => {
  if (isNew.value && newId) {
    navigateTo(isArabic.value ? `/ar/dashboard/posts/${newId}` : `/dashboard/posts/${newId}`, { replace: true })
  }
})

const primeForm = async () => {
  notFound.value = false

  if (isNew.value) {
    newPost()

    return
  }

  if (posts.value.length === 0) {
    await loadPosts()
  }

  const post = posts.value.find(p => p.id === id.value)

  if (!post) {
    notFound.value = true

    return
  }

  editPost(post)
}

const onSave = async () => {
  const savedId = await savePost()

  if (isNew.value && savedId) {
    await navigateTo(isArabic.value ? `/ar/dashboard/posts/${savedId}` : `/dashboard/posts/${savedId}`, { replace: true })
  }
}

watch(() => route.params.id, () => {
  if (route.path.includes('/dashboard/posts/')) {
    primeForm()
  }
}, { immediate: true })
</script>

<template>
  <UDashboardPanel id="post-edit">
    <template #header>
      <UDashboardNavbar :title="isNew ? t.createPost : (postForm.title || t.editPost)">
        <template #leading>
          <!--
            Back-arrow direction follows reading order: left arrow in
            LTR (English), right arrow in RTL (Arabic). The previous
            `class="ltr:[&_.iconify]:rtl:rotate-180"` was a contradictory
            variant chain (ltr: and rtl: are mutually exclusive in
            Tailwind, so the rule never matched). Swapping the icon
            name by locale is clearer + avoids CSS transforms.
          -->
          <UButton
            :to="backHref"
            :icon="isArabic ? 'i-lucide-arrow-right' : 'i-lucide-arrow-left'"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            :aria-label="t.posts"
          />
        </template>
        <template #right>
          <UButton
            v-if="!isNew && postForm.id"
            :to="previewHref"
            target="_blank"
            icon="i-lucide-eye"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            {{ t.previewDraft }}
          </UButton>
          <UBadge
            color="secondary"
            variant="subtle"
          >
            {{ statusLabel(postForm.status) }}
          </UBadge>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Warn before leaving with unsaved edits (route changes + tab close). -->
      <DashboardUnsavedGuard
        :dirty="isDirty"
        :save="savePost"
      />

      <UAlert
        v-if="notFound"
        color="error"
        variant="soft"
        :title="t.untitledPost"
        :description="`#${id}`"
        class="mb-4"
      />

      <PostEditorForm
        v-else
        v-model="postForm"
        :is-saving="isSaving"
        :save-error="saveError"
        :save-success="saveSuccess"
        :auto-save-status="autoSaveStatus"
        @save="onSave"
        @clear="primeForm"
      />
    </template>
  </UDashboardPanel>
</template>
