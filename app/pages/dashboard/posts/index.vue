<script setup lang="ts">
import type { DashboardPost } from '~/composables/usePosts'

definePageMeta({
  alias: ['/ar/dashboard/posts'],
  layout: 'dashboard'
})

const { t, isArabic } = useDashboardI18n()
const { posts, postsError, loadPosts } = usePosts()
const { statusOptions, statusLabel } = usePostForm()
const { categories: taxonomyCategories, placements: taxonomyPlacements } = useMaanTaxonomy()

const postsSearch = ref('')
const postsStatusFilter = ref<'all' | 'draft' | 'in_review' | 'published'>('all')
const postsCategoryFilter = ref<string>('all')
const postsPlacementFilter = ref<string>('all')

const lang = computed<'en' | 'ar'>(() => isArabic.value ? 'ar' : 'en')

const categoryFilterOptions = computed(() => [
  { value: 'all', label: t.value.filterCategory },
  ...taxonomyCategories.map(c => ({ value: c.id, label: c.label[lang.value] }))
])
const placementFilterOptions = computed(() => [
  { value: 'all', label: t.value.filterPlacement },
  ...taxonomyPlacements.map(p => ({ value: p.id, label: p.label[lang.value] }))
])

const filteredPosts = computed(() => {
  const q = postsSearch.value.trim().toLowerCase()
  const status = postsStatusFilter.value
  const category = postsCategoryFilter.value
  const placement = postsPlacementFilter.value

  return posts.value.filter((post) => {
    if (status !== 'all' && (post.status || 'draft') !== status) {
      return false
    }
    if (category !== 'all' && !(post.categories || []).includes(category)) {
      return false
    }
    if (placement !== 'all' && !(post.placements || []).includes(placement)) {
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
          <!--
            Category + placement filter dropdowns. Single-select (filter
            by ONE taxonomy id at a time) keeps the UI simple — the
            common admin workflow is "show me what's on the autism
            page" or "show me all autism content".
          -->
          <USelect
            v-model="postsCategoryFilter"
            :items="categoryFilterOptions"
            value-key="value"
            size="sm"
            class="hidden sm:block w-44"
          />
          <USelect
            v-model="postsPlacementFilter"
            :items="placementFilterOptions"
            value-key="value"
            size="sm"
            class="hidden md:block w-56"
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
        {{ postsCategoryFilter !== 'all' || postsPlacementFilter !== 'all' || postsSearch
          ? t.noMatchingFilters
          : t.noPostsFound }}
      </p>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="post in filteredPosts"
          :key="post.id"
          :to="editHref(post)"
          class="maan-card block p-5 text-start hover:no-underline"
          :style="post.status === 'published'
            ? 'border-top: 4px solid var(--maan-down);'
            : post.status === 'in_review'
              ? 'border-top: 4px solid var(--maan-autism);'
              : 'border-top: 4px solid var(--maan-cta);'"
        >
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            :style="post.status === 'published'
              ? 'background: color-mix(in srgb, var(--maan-down) 16%, transparent); color: var(--maan-down);'
              : post.status === 'in_review'
                ? 'background: color-mix(in srgb, var(--maan-autism) 16%, transparent); color: var(--maan-autism);'
                : 'background: color-mix(in srgb, var(--maan-cta) 16%, transparent); color: var(--maan-cta);'"
          >
            {{ statusLabel(post.status) }}
          </span>
          <h3
            class="mt-3 text-base font-semibold"
            style="color: var(--maan-ink);"
          >
            {{ post.title || t.untitledPost }}
          </h3>
          <p
            class="mt-1 line-clamp-2 text-sm"
            style="color: var(--maan-ink-muted);"
          >
            {{ post.description || post.slug }}
          </p>
        </NuxtLink>
      </div>
    </template>
  </UDashboardPanel>
</template>
