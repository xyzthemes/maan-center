<script setup lang="ts">
import { pickLocale } from '~/utils/i18n-text'

definePageMeta({
  alias: ['/ar/dashboard/overview'],
  layout: 'dashboard'
})

const { t, isArabic, sitePath } = useDashboardI18n()
// `form.title` is a bilingual envelope ({ en, ar }); resolve it per the
// dashboard locale on render (same as the submissions page). Without this
// the widget interpolates the raw object and shows JSON.
const lang = computed<'en' | 'ar'>(() => isArabic.value ? 'ar' : 'en')
const { userName } = useDashboardUser()
const { posts, loadPosts } = usePosts()
const { pages, loadPages } = usePagesAdmin()
const { submissions, loadSubmissions } = useSubmissions()

const baseDashboard = computed(() => isArabic.value ? '/ar/dashboard' : '/dashboard')

onMounted(async () => {
  await Promise.all([loadPosts(), loadPages(), loadSubmissions()])
})

// ── Derived stats ────────────────────────────────────────────────────────
const postPublished = computed(() => posts.value.filter(p => p.status === 'published').length)
const postDraft = computed(() => posts.value.filter(p => (p.status || 'draft') === 'draft').length)
const pagePublished = computed(() => pages.value.filter(p => p.status === 'published').length)
const pageDraft = computed(() => pages.value.filter(p => (p.status || 'draft') === 'draft').length)
const submissionTotal = computed(() => submissions.value.length)
const submissionLast = computed(() => submissions.value[0]?.timestamp)

const recentPosts = computed(() => [...posts.value]
  .sort((a, b) => (b.date_updated || b.date_created || '').localeCompare(a.date_updated || a.date_created || ''))
  .slice(0, 5))

const recentSubmissions = computed(() => submissions.value.slice(0, 5))

const formatDate = (iso?: string) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString(isArabic.value ? 'ar-BH' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (isArabic.value) {
    if (hour < 12) return 'صباح الخير'
    if (hour < 18) return 'مساء الخير'
    return 'مساء النور'
  }
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const labels = computed(() => isArabic.value
  ? {
      welcome: 'مرحباً',
      summary: 'لمحة سريعة عن المحتوى المنشور على موقع مركز معاً.',
      published: 'منشور',
      draft: 'مسودة',
      total: 'إجمالي',
      lastResponse: 'آخر رد',
      noResponses: 'لا توجد ردود بعد',
      quickActions: 'إجراءات سريعة',
      newPost: 'مقال جديد',
      newPage: 'صفحة جديدة',
      viewSubmissions: 'عرض الردود',
      viewSite: 'فتح الموقع',
      recentPosts: 'أحدث المقالات',
      recentSubmissions: 'أحدث الردود',
      seeAll: 'عرض الكل',
      empty: 'لا توجد عناصر بعد',
      untitled: 'بدون عنوان'
    }
  : {
      welcome: 'Welcome',
      summary: 'A quick look at the content published on the Maan center website.',
      published: 'Published',
      draft: 'Drafts',
      total: 'Total',
      lastResponse: 'Last response',
      noResponses: 'No responses yet',
      quickActions: 'Quick actions',
      newPost: 'New post',
      newPage: 'New page',
      viewSubmissions: 'View responses',
      viewSite: 'Open site',
      recentPosts: 'Recent posts',
      recentSubmissions: 'Recent responses',
      seeAll: 'See all',
      empty: 'Nothing here yet',
      untitled: 'Untitled'
    })

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <UDashboardPanel id="overview">
    <template #header>
      <UDashboardNavbar
        :title="labels.welcome + ', ' + userName"
        icon="i-lucide-layout-dashboard"
      >
        <template #right>
          <UButton
            :to="sitePath"
            icon="i-lucide-external-link"
            color="neutral"
            variant="outline"
            size="sm"
          >
            {{ labels.viewSite }}
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Greeting card -->
        <div
          class="rounded-2xl border p-6 sm:p-8"
          style="background: linear-gradient(135deg, var(--maan-autism-soft), var(--maan-down-soft)); border-color: var(--maan-line);"
        >
          <p
            class="text-sm font-semibold"
            style="color: var(--maan-autism);"
          >
            {{ greeting }}
          </p>
          <h2
            class="mt-1 text-2xl font-bold"
            style="color: var(--maan-ink);"
          >
            {{ labels.welcome }}, {{ userName }}
          </h2>
          <p
            class="mt-2 max-w-2xl text-sm"
            style="color: var(--maan-ink-muted);"
          >
            {{ labels.summary }}
          </p>
        </div>

        <!-- Stat cards -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            :to="baseDashboard + '/posts'"
            class="maan-card group"
            style="border-top: 4px solid var(--maan-autism);"
          >
            <div class="flex items-center justify-between">
              <div
                class="maan-card-icon"
                style="margin-bottom: 0;"
              >
                <UIcon
                  name="i-lucide-file-pen-line"
                  class="size-5"
                />
              </div>
              <UIcon
                name="i-lucide-arrow-up-right"
                class="size-4 opacity-50 transition group-hover:opacity-100"
                style="color: var(--maan-ink-muted);"
              />
            </div>
            <p
              class="mt-4 text-3xl font-bold tracking-tight"
              style="color: var(--maan-ink);"
            >
              {{ posts.length }}
            </p>
            <p
              class="text-sm font-medium"
              style="color: var(--maan-ink-muted);"
            >
              {{ t.blogPosts }}
            </p>
            <p
              class="mt-3 text-xs"
              style="color: var(--maan-ink-muted);"
            >
              <span style="color: var(--maan-down);">●</span> {{ postPublished }} {{ labels.published }}
              <span class="mx-1 opacity-50">·</span>
              <span style="color: var(--maan-cta);">●</span> {{ postDraft }} {{ labels.draft }}
            </p>
          </NuxtLink>

          <NuxtLink
            :to="baseDashboard + '/pages'"
            class="maan-card group"
            style="border-top: 4px solid var(--maan-down);"
          >
            <div class="flex items-center justify-between">
              <div
                class="maan-card-icon maan-card-icon--down"
                style="margin-bottom: 0;"
              >
                <UIcon
                  name="i-lucide-files"
                  class="size-5"
                />
              </div>
              <UIcon
                name="i-lucide-arrow-up-right"
                class="size-4 opacity-50 transition group-hover:opacity-100"
                style="color: var(--maan-ink-muted);"
              />
            </div>
            <p
              class="mt-4 text-3xl font-bold tracking-tight"
              style="color: var(--maan-ink);"
            >
              {{ pages.length }}
            </p>
            <p
              class="text-sm font-medium"
              style="color: var(--maan-ink-muted);"
            >
              {{ t.websitePages }}
            </p>
            <p
              class="mt-3 text-xs"
              style="color: var(--maan-ink-muted);"
            >
              <span style="color: var(--maan-down);">●</span> {{ pagePublished }} {{ labels.published }}
              <span class="mx-1 opacity-50">·</span>
              <span style="color: var(--maan-cta);">●</span> {{ pageDraft }} {{ labels.draft }}
            </p>
          </NuxtLink>

          <NuxtLink
            :to="baseDashboard + '/submissions'"
            class="maan-card group"
            style="border-top: 4px solid var(--maan-ld);"
          >
            <div class="flex items-center justify-between">
              <div
                class="maan-card-icon maan-card-icon--ld"
                style="margin-bottom: 0;"
              >
                <UIcon
                  name="i-lucide-inbox"
                  class="size-5"
                />
              </div>
              <UIcon
                name="i-lucide-arrow-up-right"
                class="size-4 opacity-50 transition group-hover:opacity-100"
                style="color: var(--maan-ink-muted);"
              />
            </div>
            <p
              class="mt-4 text-3xl font-bold tracking-tight"
              style="color: var(--maan-ink);"
            >
              {{ submissionTotal }}
            </p>
            <p
              class="text-sm font-medium"
              style="color: var(--maan-ink-muted);"
            >
              {{ t.contactResponses }}
            </p>
            <p
              class="mt-3 text-xs"
              style="color: var(--maan-ink-muted);"
            >
              <span v-if="submissionLast">{{ labels.lastResponse }}: {{ formatDate(submissionLast) }}</span>
              <span v-else>{{ labels.noResponses }}</span>
            </p>
          </NuxtLink>
        </div>

        <!-- Quick actions -->
        <div
          class="rounded-2xl border p-5 sm:p-6"
          style="background: var(--maan-surface-alt); border-color: var(--maan-line);"
        >
          <p
            class="text-xs font-bold uppercase tracking-wider"
            style="color: var(--maan-ink-muted);"
          >
            {{ labels.quickActions }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <UButton
              :to="baseDashboard + '/posts/new'"
              icon="i-lucide-plus"
              size="sm"
            >
              {{ labels.newPost }}
            </UButton>
            <UButton
              :to="baseDashboard + '/pages/new'"
              icon="i-lucide-plus"
              color="neutral"
              variant="outline"
              size="sm"
            >
              {{ labels.newPage }}
            </UButton>
            <UButton
              :to="baseDashboard + '/submissions'"
              icon="i-lucide-inbox"
              color="neutral"
              variant="outline"
              size="sm"
            >
              {{ labels.viewSubmissions }}
            </UButton>
          </div>
        </div>

        <!-- Two-column: recent posts + recent responses -->
        <div class="grid gap-4 lg:grid-cols-2">
          <section
            class="rounded-2xl border p-5"
            style="background: var(--maan-surface-alt); border-color: var(--maan-line);"
          >
            <div class="flex items-center justify-between">
              <h3
                class="text-sm font-bold"
                style="color: var(--maan-ink);"
              >
                {{ labels.recentPosts }}
              </h3>
              <NuxtLink
                :to="baseDashboard + '/posts'"
                class="text-xs font-semibold hover:underline"
                style="color: var(--maan-autism);"
              >
                {{ labels.seeAll }}
              </NuxtLink>
            </div>
            <ul
              v-if="recentPosts.length"
              class="mt-4 divide-y"
              style="border-color: var(--maan-line);"
            >
              <li
                v-for="post in recentPosts"
                :key="post.id"
                class="py-3"
                style="border-color: var(--maan-line);"
              >
                <NuxtLink
                  :to="`${baseDashboard}/posts/${post.id}`"
                  class="block group"
                >
                  <p
                    class="text-sm font-semibold truncate"
                    style="color: var(--maan-ink);"
                  >
                    {{ post.title || labels.untitled }}
                  </p>
                  <p
                    class="mt-0.5 text-xs"
                    style="color: var(--maan-ink-muted);"
                  >
                    <span
                      class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      :style="(post.status === 'published'
                        ? 'background: color-mix(in srgb, var(--maan-down) 18%, transparent); color: var(--maan-down);'
                        : 'background: color-mix(in srgb, var(--maan-cta) 18%, transparent); color: var(--maan-cta);')"
                    >
                      {{ post.status === 'published' ? labels.published : labels.draft }}
                    </span>
                    <span class="ms-2">{{ post.slug }}</span>
                  </p>
                </NuxtLink>
              </li>
            </ul>
            <p
              v-else
              class="mt-4 text-sm"
              style="color: var(--maan-ink-muted);"
            >
              {{ labels.empty }}
            </p>
          </section>

          <section
            class="rounded-2xl border p-5"
            style="background: var(--maan-surface-alt); border-color: var(--maan-line);"
          >
            <div class="flex items-center justify-between">
              <h3
                class="text-sm font-bold"
                style="color: var(--maan-ink);"
              >
                {{ labels.recentSubmissions }}
              </h3>
              <NuxtLink
                :to="baseDashboard + '/submissions'"
                class="text-xs font-semibold hover:underline"
                style="color: var(--maan-autism);"
              >
                {{ labels.seeAll }}
              </NuxtLink>
            </div>
            <ul
              v-if="recentSubmissions.length"
              class="mt-4 divide-y"
              style="border-color: var(--maan-line);"
            >
              <li
                v-for="sub in recentSubmissions"
                :key="sub.id"
                class="py-3"
              >
                <p
                  class="text-sm font-semibold truncate"
                  style="color: var(--maan-ink);"
                >
                  {{ pickLocale(sub.form?.title, lang) || sub.form?.slug || 'Form submission' }}
                </p>
                <p
                  class="mt-0.5 text-xs"
                  style="color: var(--maan-ink-muted);"
                >
                  {{ formatDate(sub.timestamp) }}
                </p>
              </li>
            </ul>
            <p
              v-else
              class="mt-4 text-sm"
              style="color: var(--maan-ink-muted);"
            >
              {{ labels.empty }}
            </p>
          </section>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
