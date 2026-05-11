<script setup lang="ts">
import type { DashboardPost } from '~/composables/usePosts'

definePageMeta({
  alias: ['/ar/dashboard/posts'],
  layout: 'dashboard'
})

const { t, isArabic } = useDashboardI18n()
const { posts, postsError, loadPosts } = usePosts()
const { statusOptions, statusLabel } = usePostForm()

const postsSearch = ref('')
const postsStatusFilter = ref<'all' | 'draft' | 'in_review' | 'published'>('all')

const filteredPosts = computed(() => {
  const q = postsSearch.value.trim().toLowerCase()
  const status = postsStatusFilter.value

  return posts.value.filter((post) => {
    if (status !== 'all' && (post.status || 'draft') !== status) {
      return false
    }

    if (!q) {
      return true
    }

    const haystack = `${post.title || ''} ${post.slug || ''} ${post.description || ''}`.toLowerCase()

    return haystack.includes(q)
  })
})

const editHref = (post: DashboardPost) => isArabic.value
  ? `/ar/dashboard/posts/${post.id}`
  : `/dashboard/posts/${post.id}`

const newHref = computed(() => isArabic.value ? '/ar/dashboard/posts/new' : '/dashboard/posts/new')

onMounted(loadPosts)
</script>

<template>
  <UDashboardPanel id="posts-list">
    <template #header>
      <UDashboardNavbar
        :title="t.posts"
        icon="i-lucide-file-pen-line"
      >
        <template #right>
          <UBadge
            color="neutral"
            variant="subtle"
            class="hidden sm:inline-flex"
          >
            {{ t.postsCount(filteredPosts.length, posts.length) }}
          </UBadge>
          <UButton
            icon="i-lucide-plus"
            size="sm"
            :to="newHref"
          >
            {{ t.newPost }}
          </UButton>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="postsSearch"
            :placeholder="t.searchPosts"
            icon="i-lucide-search"
            size="sm"
            class="w-full max-w-xs"
          />
        </template>
        <template #right>
          <UFieldGroup>
            <UButton
              v-for="option in statusOptions"
              :key="option.value"
              size="xs"
              :color="postsStatusFilter === option.value ? 'primary' : 'neutral'"
              :variant="postsStatusFilter === option.value ? 'solid' : 'outline'"
              @click="postsStatusFilter = option.value"
            >
              {{ option.label }}
            </UButton>
          </UFieldGroup>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UAlert
        v-if="postsError"
        color="error"
        variant="soft"
        :title="postsError"
        :description="t.postsPermission"
        class="mb-4"
      />

      <p
        v-if="!postsError && filteredPosts.length === 0"
        class="text-sm text-muted"
      >
        {{ t.noPostsFound }}
      </p>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="post in filteredPosts"
          :key="post.id"
          :to="editHref(post)"
          class="maan-form-card block p-4 text-start transition hover:-translate-y-0.5 hover:no-underline"
        >
          <span class="mb-2 inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {{ statusLabel(post.status) }}
          </span>
          <h3 class="text-base font-semibold text-highlighted">
            {{ post.title || t.untitledPost }}
          </h3>
          <p class="mt-1 line-clamp-2 text-sm leading-6 text-muted">
            {{ post.description || post.slug }}
          </p>
        </NuxtLink>
      </div>
    </template>
  </UDashboardPanel>
</template>
