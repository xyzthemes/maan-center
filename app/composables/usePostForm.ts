import type { DashboardPost } from './usePosts'

export type PostForm = {
  id?: string
  title: string
  slug: string
  description: string
  content: string
  status: string
  published_at: string
  // Layer 1 taxonomy. Bound to multi-select chips in PostEditorForm.
  // Server sanitises against useMaanTaxonomy before persisting.
  categories: string[]
  placements: string[]
  seo: {
    title: string
    meta_description: string
    focus_keyphrase: string
  }
}

export const emptyPostForm = (): PostForm => ({
  title: '',
  slug: '',
  description: '',
  content: '<p></p>',
  status: 'draft',
  published_at: '',
  categories: [],
  placements: [],
  seo: {
    title: '',
    meta_description: '',
    focus_keyphrase: ''
  }
})

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export const usePostForm = (onSaved?: () => unknown | Promise<unknown>) => {
  const { t } = useDashboardI18n()
  const postForm = reactive<PostForm>(emptyPostForm())
  const saveError = ref('')
  const saveSuccess = ref('')
  const isSaving = ref(false)
  const autoSaveStatus = ref<AutoSaveStatus>('idle')

  // Dirty tracking for the unsaved-changes guard. `lastSavedSnapshot` is the
  // serialized form at the last successful save (manual or auto) or at load;
  // `isDirty` is true whenever the live form has diverged from it. This is more
  // precise than `autoSaveStatus` (whose 'idle' covers both "clean" and
  // "edited, save pending"), so the guard only warns on genuinely unsaved work.
  const snapshot = () => JSON.stringify(postForm)
  const lastSavedSnapshot = ref(snapshot())
  const markPristine = () => {
    lastSavedSnapshot.value = snapshot()
  }
  const isDirty = computed(() => snapshot() !== lastSavedSnapshot.value)
  // When true, watcher-fired form changes are programmatic (load/save-induced)
  // and must NOT arm an auto-save — this is what stops a save storm on page open
  // and the self-trigger loop after savePost mutates postForm.id.
  let suspendAutoSave = false
  // Suppress auto-save arming for the duration of a synchronous, programmatic
  // form mutation (editPost/newPost), releasing once the watcher has flushed.
  const withSuspendedAutoSave = (mutate: () => void) => {
    suspendAutoSave = true
    mutate()
    nextTick(() => {
      suspendAutoSave = false
    })
  }

  const statusOptions = computed(() => [
    { value: 'all' as const, label: t.value.filterAll },
    { value: 'draft' as const, label: t.value.draft },
    { value: 'in_review' as const, label: t.value.inReview },
    { value: 'published' as const, label: t.value.published }
  ])

  const statusLabel = (status?: string) => {
    if (status === 'published') {
      return t.value.published
    }

    if (status === 'in_review') {
      return t.value.inReview
    }

    return t.value.draft
  }

  const editPost = (post: DashboardPost) => {
    withSuspendedAutoSave(() => {
      Object.assign(postForm, {
        id: post.id,
        title: post.title || '',
        slug: post.slug || '',
        description: post.description || '',
        content: post.content || '<p></p>',
        status: post.status || 'draft',
        published_at: post.published_at || '',
        categories: Array.isArray(post.categories) ? [...post.categories] : [],
        placements: Array.isArray(post.placements) ? [...post.placements] : [],
        seo: {
          title: post.seo?.title || post.title || '',
          meta_description: post.seo?.meta_description || post.description || '',
          focus_keyphrase: post.seo?.focus_keyphrase || ''
        }
      })
    })
    saveError.value = ''
    saveSuccess.value = ''
    autoSaveStatus.value = 'idle'
    markPristine()
  }

  const newPost = () => {
    withSuspendedAutoSave(() => {
      Object.assign(postForm, emptyPostForm())
    })
    saveError.value = ''
    saveSuccess.value = ''
    autoSaveStatus.value = 'idle'
    markPristine()
  }

  const savePost = async (): Promise<string | undefined> => {
    saveError.value = ''
    saveSuccess.value = ''
    isSaving.value = true

    try {
      const wasCreate = !postForm.id
      const method = wasCreate ? 'POST' : 'PATCH'
      const url = wasCreate ? '/api/dashboard/posts' : `/api/dashboard/posts/${postForm.id}`

      const response = await $fetch<{ data?: { id?: string } } | undefined>(url, {
        method,
        body: postForm
      })

      const savedId = response?.data?.id || postForm.id

      if (wasCreate && savedId) {
        postForm.id = savedId
      }

      saveSuccess.value = wasCreate ? t.value.postCreated : t.value.postUpdated
      // Snapshot AFTER the id is assigned (line above) so the post-create id
      // change doesn't read as a fresh unsaved edit.
      markPristine()

      if (onSaved) {
        await onSaved()
      }

      return savedId
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }

      saveError.value = fetchError.data?.message || fetchError.statusMessage || t.value.savePostError

      return undefined
    } finally {
      isSaving.value = false
    }
  }

  // --- Auto-save (opt-in; the [id] editor page enables it, the list page does
  // not). Debounced ~2.5s after the form goes dirty. Guards against overlapping
  // saves (skips while one is in flight) and against self-trigger loops (the
  // save mutates postForm.id, which we suppress from re-arming the watcher). A
  // brand-new post saves once to gain an id, then auto-saves thereafter — but
  // only once it has the minimum content to be a real draft (a title).
  const AUTO_SAVE_DELAY = 2500
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
  // Set by the unsaved-changes guard while its modal is open: a debounced save
  // must NOT fire (and toast "saved") while the user is still deciding to keep,
  // save, or discard — that would also defeat "Leave without saving".
  const autoSavePaused = ref(false)

  const hasMinimumContent = () => postForm.title.trim().length > 0

  const clearAutoSaveTimer = () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    autoSaveTimer = null
  }

  const runAutoSave = async () => {
    autoSaveTimer = null
    // Skip if paused (guard modal open), if a manual/auto save is already
    // running, or there's nothing worth persisting yet (no id AND no title).
    if (autoSavePaused.value) return
    if (isSaving.value) return
    if (!postForm.id && !hasMinimumContent()) return

    autoSaveStatus.value = 'saving'
    suspendAutoSave = true
    try {
      const savedId = await savePost()
      autoSaveStatus.value = savedId ? 'saved' : 'error'
    } finally {
      // Release on the next tick so the id/flag mutations from savePost have
      // settled before the watcher is allowed to re-arm.
      await nextTick()
      suspendAutoSave = false
    }
  }

  const scheduleAutoSave = () => {
    clearAutoSaveTimer()
    autoSaveStatus.value = 'idle'
    autoSaveTimer = setTimeout(runAutoSave, AUTO_SAVE_DELAY)
  }

  // Pause/resume let the unsaved-changes guard freeze auto-save while its modal
  // is open. Resuming re-arms a save if the form is still dirty, so edits made
  // before the prompt aren't left unsaved after "Keep editing".
  const pauseAutoSave = () => {
    autoSavePaused.value = true
    clearAutoSaveTimer()
  }
  const resumeAutoSave = () => {
    autoSavePaused.value = false
    if (isDirty.value) scheduleAutoSave()
  }

  const enableAutoSave = () => {
    watch(
      () => JSON.stringify(postForm),
      () => {
        if (suspendAutoSave || autoSavePaused.value) return
        scheduleAutoSave()
      }
    )

    // Don't leave a pending save firing after the editor is torn down.
    onScopeDispose(clearAutoSaveTimer)
  }

  return {
    postForm,
    saveError,
    saveSuccess,
    isSaving,
    autoSaveStatus,
    isDirty,
    pauseAutoSave,
    resumeAutoSave,
    statusOptions,
    statusLabel,
    editPost,
    newPost,
    savePost,
    enableAutoSave
  }
}
