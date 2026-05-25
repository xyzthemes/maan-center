<script setup lang="ts">
import type { DashboardPost } from '~/composables/usePosts'
import { statusBadgeStyle, statusCardTopBorder } from '~/utils/status-badge'

definePageMeta({
  alias: ['/ar/dashboard/posts'],
  layout: 'dashboard'
})

const { t, isArabic } = useDashboardI18n()
const { posts, postsError, isLoading, loadPosts } = usePosts()
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

// Chip labels — look the slug up in the same option lists driving the
// filter dropdowns so the chip always matches the active selection's
// visible label (including locale).
const categoryChipLabel = computed(() => {
  const opt = categoryFilterOptions.value.find(o => o.value === postsCategoryFilter.value)
  return opt?.label ?? postsCategoryFilter.value
})
const placementChipLabel = computed(() => {
  const opt = placementFilterOptions.value.find(o => o.value === postsPlacementFilter.value)
  return opt?.label ?? postsPlacementFilter.value
})

const clearAllFilters = () => {
  postsSearch.value = ''
  postsCategoryFilter.value = 'all'
  postsPlacementFilter.value = 'all'
  postsStatusFilter.value = 'all'
}

// `posts.length === 0 && !filterActive` is the genuine "create your
// first post" state. The status filter defaults to 'all' so we don't
// gate the empty-state UI on it here.
const hasActiveFilter = computed(() =>
  postsCategoryFilter.value !== 'all'
  || postsPlacementFilter.value !== 'all'
  || postsStatusFilter.value !== 'all'
  || postsSearch.value !== ''
)

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
            Category + placement filter dropdowns. USelect with the
            documented pattern: items are `{ value, label }` objects,
            `value-key` defaults to `'value'` so we don't repeat it,
            and the model binds to the selected option's value.
          -->
          <USelect
            v-model="postsCategoryFilter"
            :items="categoryFilterOptions"
            size="sm"
            class="hidden sm:flex w-44"
          />
          <USelect
            v-model="postsPlacementFilter"
            :items="placementFilterOptions"
            size="sm"
            class="hidden md:flex w-56"
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

      <!--
        Active-filter strip. Renders one chip per non-default filter,
        each clickable to clear it. Doubles as a visual sanity check
        that the v-model bindings are firing — if an admin selects
        "Autism" and no chip appears, the dropdown is broken; if the
        chip appears but the list doesn't change, the filter logic is.
      -->
      <div
        v-if="postsCategoryFilter !== 'all' || postsPlacementFilter !== 'all' || postsSearch"
        class="mb-4 flex flex-wrap items-center gap-2"
      >
        <span class="text-xs font-semibold uppercase tracking-wider text-muted">
          {{ t.activeFilters }}
        </span>
        <button
          v-if="postsSearch"
          type="button"
          class="maan-filter-chip"
          @click="postsSearch = ''"
        >
          <UIcon
            name="i-lucide-search"
            class="size-3"
          />
          <span>{{ postsSearch }}</span>
          <UIcon
            name="i-lucide-x"
            class="size-3"
          />
        </button>
        <button
          v-if="postsCategoryFilter !== 'all'"
          type="button"
          class="maan-filter-chip"
          @click="postsCategoryFilter = 'all'"
        >
          <span>{{ categoryChipLabel }}</span>
          <UIcon
            name="i-lucide-x"
            class="size-3"
          />
        </button>
        <button
          v-if="postsPlacementFilter !== 'all'"
          type="button"
          class="maan-filter-chip"
          @click="postsPlacementFilter = 'all'"
        >
          <span>{{ placementChipLabel }}</span>
          <UIcon
            name="i-lucide-x"
            class="size-3"
          />
        </button>
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-lucide-x-circle"
          @click="clearAllFilters"
        >
          {{ t.clearFilters }}
        </UButton>
      </div>

      <!-- Loading: skeleton grid until the first fetch resolves. -->
      <div
        v-if="isLoading && posts.length === 0"
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <MaanSkeletonGrid :count="6" />
      </div>

      <!-- Filtered-empty: keep terse copy + nudge to clear. -->
      <p
        v-else-if="!postsError && filteredPosts.length === 0 && hasActiveFilter"
        class="text-sm text-muted"
      >
        {{ t.noMatchingFilters }}
      </p>

      <!-- Genuinely empty (no posts yet) + no filter active → CTA panel. -->
      <MaanEmptyState
        v-else-if="!postsError && posts.length === 0"
        icon="i-lucide-file-pen-line"
        :title="t.noPostsYet"
        :description="t.createFirstPostHint"
        :cta-label="t.newPost"
        :cta-to="newHref"
      />

      <div
        v-else
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <NuxtLink
          v-for="post in filteredPosts"
          :key="post.id"
          :to="editHref(post)"
          class="maan-card block p-5 text-start hover:no-underline"
          :style="statusCardTopBorder(post.status)"
        >
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            :style="statusBadgeStyle(post.status)"
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
