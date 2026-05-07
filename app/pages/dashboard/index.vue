<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'

definePageMeta({
  alias: ['/ar/dashboard'],
  layout: false
})

const route = useRoute()
const isArabic = computed(() => route.path.startsWith('/ar'))
const sitePath = computed(() => isArabic.value ? '/ar' : '/')
const loginPath = computed(() => isArabic.value ? '/ar/dashboard/login' : '/dashboard/login')
const alternateDashboardPath = computed(() => isArabic.value ? '/dashboard' : '/ar/dashboard')
const switchDashboardLocale = () => {
  if (import.meta.client) {
    window.location.assign(alternateDashboardPath.value)
  }
}
const t = computed(() => isArabic.value
  ? {
      title: 'لوحة تحكم المديرين | معا',
      managerDashboard: 'لوحة تحكم مديري معا',
      managerFallback: 'مدير',
      role: 'دور Directus:',
      site: 'الموقع',
      signOut: 'تسجيل الخروج',
      loading: 'جار تحميل لوحة التحكم...',
      contactResponses: 'ردود التواصل',
      blogPosts: 'منشورات المدونة',
      submissionsPermission: 'حدّث دور هذا المستخدم في Directus إذا كان على المديرين قراءة ردود نموذج التواصل.',
      emptySubmissions: 'لا توجد ردود على النماذج حتى الآن.',
      formResponse: 'رد النموذج',
      noTimestamp: 'لا يوجد وقت',
      fields: 'حقول',
      posts: 'المنشورات',
      newPost: 'منشور جديد',
      postsPermission: 'حدّث دور هذا المستخدم في Directus إذا كان على المديرين إدارة منشورات المدونة.',
      untitledPost: 'منشور بدون عنوان',
      editPost: 'تعديل المنشور',
      createPost: 'إنشاء منشور',
      savedThroughDirectus: 'يتم الحفظ عبر Directus باستخدام صلاحيات دورك الحالي.',
      titleLabel: 'العنوان',
      slug: 'الرابط المختصر',
      status: 'الحالة',
      draft: 'مسودة',
      inReview: 'قيد المراجعة',
      published: 'منشور',
      publishedAt: 'تاريخ النشر',
      description: 'الوصف',
      content: 'المحتوى',
      contentPlaceholder: 'اكتب محتوى المنشور...',
      savedAsHtml: 'يتم الحفظ بصيغة HTML في Directus.',
      seoTitle: 'عنوان SEO',
      focusKeyphrase: 'العبارة المفتاحية',
      seoDescription: 'وصف SEO',
      save: 'حفظ في Directus',
      clear: 'مسح',
      postUpdated: 'تم تحديث المنشور في Directus.',
      postCreated: 'تم إنشاء المنشور في Directus.',
      readSubmissionsError: 'دورك في Directus لا يسمح بقراءة ردود النماذج.',
      readPostsError: 'دورك في Directus لا يسمح بقراءة المنشورات.',
      savePostError: 'دورك في Directus لا يسمح بحفظ هذا المنشور.',
      authError: 'سجّل الدخول باستخدام Directus للمتابعة.'
    }
  : {
      title: 'Manager Dashboard | Maan',
      managerDashboard: 'Maan Manager Dashboard',
      managerFallback: 'Manager',
      role: 'Directus role:',
      site: 'Site',
      signOut: 'Sign out',
      loading: 'Loading dashboard...',
      contactResponses: 'Contact responses',
      blogPosts: 'Blog posts',
      submissionsPermission: 'Update this user role in Directus if managers should read contact form submissions.',
      emptySubmissions: 'No form responses yet.',
      formResponse: 'Form response',
      noTimestamp: 'No timestamp',
      fields: 'fields',
      posts: 'Posts',
      newPost: 'New post',
      postsPermission: 'Update this user role in Directus if managers should manage blog posts.',
      untitledPost: 'Untitled post',
      editPost: 'Edit post',
      createPost: 'Create post',
      savedThroughDirectus: 'Saved through Directus using your current role permissions.',
      titleLabel: 'Title',
      slug: 'Slug',
      status: 'Status',
      draft: 'Draft',
      inReview: 'In review',
      published: 'Published',
      publishedAt: 'Published at',
      description: 'Description',
      content: 'Content',
      contentPlaceholder: 'Write the post content...',
      savedAsHtml: 'Saved as HTML in Directus.',
      seoTitle: 'SEO title',
      focusKeyphrase: 'Focus keyphrase',
      seoDescription: 'SEO description',
      save: 'Save in Directus',
      clear: 'Clear',
      postUpdated: 'Post updated in Directus.',
      postCreated: 'Post created in Directus.',
      readSubmissionsError: 'Your Directus role cannot read form submissions.',
      readPostsError: 'Your Directus role cannot read posts.',
      savePostError: 'Your Directus role cannot save this post.',
      authError: 'Sign in with Directus to continue.'
    })

useSeoMeta({
  title: () => t.value.title,
  robots: 'noindex, nofollow'
})

type DashboardUser = {
  id: string
  email?: string
  first_name?: string
  last_name?: string
  role?: { id?: string, name?: string } | string
}

type DashboardSubmission = {
  id: string
  timestamp?: string
  form?: { id?: string, title?: string }
  values: Array<{
    id: string
    name: string
    label: string
    value: string
  }>
}

type DashboardPost = {
  id: string
  status?: string
  slug?: string
  title?: string
  description?: string
  content?: string
  published_at?: string
  date_updated?: string
  date_created?: string
  seo?: {
    title?: string
    meta_description?: string
    focus_keyphrase?: string
  }
}

type PostForm = {
  id?: string
  title: string
  slug: string
  description: string
  content: string
  status: string
  published_at: string
  seo: {
    title: string
    meta_description: string
    focus_keyphrase: string
  }
}

const emptyPostForm = (): PostForm => ({
  title: '',
  slug: '',
  description: '',
  content: '<p></p>',
  status: 'draft',
  published_at: '',
  seo: {
    title: '',
    meta_description: '',
    focus_keyphrase: ''
  }
})

const activeTab = ref<'submissions' | 'posts'>('submissions')
const user = ref<DashboardUser>()
const submissions = ref<DashboardSubmission[]>([])
const posts = ref<DashboardPost[]>([])
const postForm = reactive<PostForm>(emptyPostForm())
const authError = ref('')
const submissionsError = ref('')
const postsError = ref('')
const saveError = ref('')
const saveSuccess = ref('')
const isLoading = ref(true)
const isSaving = ref(false)
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

const userName = computed(() => {
  const parts = [user.value?.first_name, user.value?.last_name].filter(Boolean).join(' ')

  return parts || user.value?.email || t.value.managerFallback
})
const userRole = computed(() => typeof user.value?.role === 'string' ? user.value.role : user.value?.role?.name)
const statusLabel = (status?: string) => {
  if (status === 'published') {
    return t.value.published
  }

  if (status === 'in_review') {
    return t.value.inReview
  }

  return t.value.draft
}

const loadMe = async () => {
  const response = await $fetch<{ user?: DashboardUser }>('/api/dashboard/me')

  user.value = response.user
}

const loadSubmissions = async () => {
  submissionsError.value = ''

  try {
    const response = await $fetch<{ submissions: DashboardSubmission[] }>('/api/dashboard/submissions')

    submissions.value = response.submissions
  } catch (error) {
    const fetchError = error as { data?: { message?: string }, statusMessage?: string }

    submissionsError.value = fetchError.data?.message || fetchError.statusMessage || t.value.readSubmissionsError
  }
}

const loadPosts = async () => {
  postsError.value = ''

  try {
    const response = await $fetch<{ posts: DashboardPost[] }>('/api/dashboard/posts')

    posts.value = response.posts
  } catch (error) {
    const fetchError = error as { data?: { message?: string }, statusMessage?: string }

    postsError.value = fetchError.data?.message || fetchError.statusMessage || t.value.readPostsError
  }
}

const logout = async () => {
  await $fetch('/api/dashboard/logout', { method: 'POST' })
  await navigateTo(loginPath.value)
}

const editPost = (post: DashboardPost) => {
  Object.assign(postForm, {
    id: post.id,
    title: post.title || '',
    slug: post.slug || '',
    description: post.description || '',
    content: post.content || '<p></p>',
    status: post.status || 'draft',
    published_at: post.published_at || '',
    seo: {
      title: post.seo?.title || post.title || '',
      meta_description: post.seo?.meta_description || post.description || '',
      focus_keyphrase: post.seo?.focus_keyphrase || ''
    }
  })
  activeTab.value = 'posts'
  saveError.value = ''
  saveSuccess.value = ''
}

const newPost = () => {
  Object.assign(postForm, emptyPostForm())
  saveError.value = ''
  saveSuccess.value = ''
}

const savePost = async () => {
  saveError.value = ''
  saveSuccess.value = ''
  isSaving.value = true

  try {
    const method = postForm.id ? 'PATCH' : 'POST'
    const url = postForm.id ? `/api/dashboard/posts/${postForm.id}` : '/api/dashboard/posts'

    await $fetch(url, {
      method,
      body: postForm
    })
    saveSuccess.value = postForm.id ? t.value.postUpdated : t.value.postCreated
    await loadPosts()
  } catch (error) {
    const fetchError = error as { data?: { message?: string }, statusMessage?: string }

    saveError.value = fetchError.data?.message || fetchError.statusMessage || t.value.savePostError
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  try {
    await loadMe()
    await Promise.all([
      loadSubmissions(),
      loadPosts()
    ])
  } catch (error) {
    const fetchError = error as { data?: { message?: string }, statusMessage?: string }

    authError.value = fetchError.data?.message || fetchError.statusMessage || t.value.authError
    await navigateTo(loginPath.value)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <UApp>
    <main class="maan-main min-h-screen">
      <header class="maan-header sticky top-0 z-40 border-b border-default">
        <UContainer class="flex min-h-16 items-center justify-between gap-4 py-3">
          <div>
            <p class="text-sm font-medium text-muted">
              {{ t.managerDashboard }}
            </p>
            <h1 class="text-xl font-semibold text-highlighted">
              {{ userName }}
            </h1>
            <p
              v-if="userRole"
              class="text-xs text-muted"
            >
              {{ t.role }} {{ userRole }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              :to="sitePath"
              color="neutral"
              variant="ghost"
              icon="i-lucide-external-link"
            >
              {{ t.site }}
            </UButton>
            <UButton
              :href="alternateDashboardPath"
              color="neutral"
              variant="ghost"
              @click.prevent="switchDashboardLocale"
            >
              {{ isArabic ? 'EN' : 'عربي' }}
            </UButton>
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-log-out"
              @click="logout"
            >
              {{ t.signOut }}
            </UButton>
          </div>
        </UContainer>
      </header>

      <UContainer class="py-8">
        <UAlert
          v-if="authError"
          color="error"
          variant="soft"
          :title="authError"
          class="mb-6"
        />

        <div
          v-if="isLoading"
          class="maan-form-card p-8"
        >
          <p class="text-muted">
            {{ t.loading }}
          </p>
        </div>

        <template v-else>
          <div class="mb-6 flex flex-wrap gap-2">
            <UButton
              :color="activeTab === 'submissions' ? 'primary' : 'neutral'"
              :variant="activeTab === 'submissions' ? 'solid' : 'subtle'"
              icon="i-lucide-inbox"
              @click="activeTab = 'submissions'"
            >
              {{ t.contactResponses }}
            </UButton>
            <UButton
              :color="activeTab === 'posts' ? 'primary' : 'neutral'"
              :variant="activeTab === 'posts' ? 'solid' : 'subtle'"
              icon="i-lucide-file-pen-line"
              @click="activeTab = 'posts'"
            >
              {{ t.blogPosts }}
            </UButton>
          </div>

          <section
            v-if="activeTab === 'submissions'"
            class="grid gap-5"
          >
            <UAlert
              v-if="submissionsError"
              color="error"
              variant="soft"
              :title="submissionsError"
              :description="t.submissionsPermission"
            />

            <div
              v-if="!submissionsError && submissions.length === 0"
              class="maan-form-card p-8"
            >
              <p class="text-muted">
                {{ t.emptySubmissions }}
              </p>
            </div>

            <article
              v-for="submission in submissions"
              :key="submission.id"
              class="maan-form-card p-6"
            >
              <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-highlighted">
                    {{ submission.form?.title || t.formResponse }}
                  </p>
                  <p class="text-sm text-muted">
                    {{ submission.timestamp ? new Date(submission.timestamp).toLocaleString(isArabic ? 'ar-BH' : 'en-US') : t.noTimestamp }}
                  </p>
                </div>
                <UBadge
                  color="primary"
                  variant="subtle"
                >
                  {{ submission.values.length }} {{ t.fields }}
                </UBadge>
              </div>

              <dl class="grid gap-4 md:grid-cols-2">
                <div
                  v-for="value in submission.values"
                  :key="value.id"
                >
                  <dt class="text-xs font-semibold uppercase tracking-wide text-muted">
                    {{ value.label }}
                  </dt>
                  <dd class="mt-1 whitespace-pre-wrap text-sm text-highlighted">
                    {{ value.value || '-' }}
                  </dd>
                </div>
              </dl>
            </article>
          </section>

          <section
            v-else
            class="grid gap-6 xl:grid-cols-[.75fr_1.25fr]"
          >
            <div class="grid content-start gap-4">
              <div class="flex items-center justify-between gap-3">
                <h2 class="text-xl font-semibold text-highlighted">
                  {{ t.posts }}
                </h2>
                <UButton
                  icon="i-lucide-plus"
                  size="sm"
                  @click="newPost"
                >
                  {{ t.newPost }}
                </UButton>
              </div>

              <UAlert
                v-if="postsError"
                color="error"
                variant="soft"
                :title="postsError"
                :description="t.postsPermission"
              />

              <button
                v-for="post in posts"
                :key="post.id"
                class="maan-form-card block p-5 text-left transition hover:-translate-y-0.5"
                type="button"
                @click="editPost(post)"
              >
                <span class="mb-3 inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {{ statusLabel(post.status) }}
                </span>
                <h3 class="text-base font-semibold text-highlighted">
                  {{ post.title || t.untitledPost }}
                </h3>
                <p class="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                  {{ post.description || post.slug }}
                </p>
              </button>
            </div>

            <form
              class="maan-form-card grid gap-5 p-6"
              @submit.prevent="savePost"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="text-xl font-semibold text-highlighted">
                    {{ postForm.id ? t.editPost : t.createPost }}
                  </h2>
                  <p class="mt-1 text-sm text-muted">
                    {{ t.savedThroughDirectus }}
                  </p>
                </div>
                <UBadge
                  color="secondary"
                  variant="subtle"
                >
                  {{ postForm.status }}
                </UBadge>
              </div>

              <label>
                <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.titleLabel }}</span>
                <input
                  v-model="postForm.title"
                  class="maan-form-input"
                  required
                >
              </label>

              <label>
                <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.slug }}</span>
                <input
                  v-model="postForm.slug"
                  class="maan-form-input"
                  placeholder="post-url-slug"
                >
              </label>

              <label>
                <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.status }}</span>
                <select
                  v-model="postForm.status"
                  class="maan-form-input"
                >
                  <option value="draft">{{ t.draft }}</option>
                  <option value="in_review">{{ t.inReview }}</option>
                  <option value="published">{{ t.published }}</option>
                </select>
              </label>

              <label>
                <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.publishedAt }}</span>
                <input
                  v-model="postForm.published_at"
                  class="maan-form-input"
                  type="datetime-local"
                >
              </label>

              <label>
                <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.description }}</span>
                <textarea
                  v-model="postForm.description"
                  class="maan-form-input min-h-24"
                />
              </label>

              <div>
                <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.content }}</span>
                <UEditor
                  v-model="postForm.content"
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
                    v-model="postForm.seo.title"
                    class="maan-form-input"
                  >
                </label>
                <label>
                  <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.focusKeyphrase }}</span>
                  <input
                    v-model="postForm.seo.focus_keyphrase"
                    class="maan-form-input"
                  >
                </label>
              </div>

              <label>
                <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.seoDescription }}</span>
                <textarea
                  v-model="postForm.seo.meta_description"
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
                  @click="newPost"
                >
                  {{ t.clear }}
                </UButton>
              </div>
            </form>
          </section>
        </template>
      </UContainer>
    </main>
  </UApp>
</template>
