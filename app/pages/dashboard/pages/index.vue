<script setup lang="ts">
import type { DashboardPage } from '~/composables/usePagesAdmin'

definePageMeta({
  alias: ['/ar/dashboard/pages'],
  layout: 'dashboard'
})

const { t, isArabic } = useDashboardI18n()
const { pages, pagesError, loadPages } = usePagesAdmin()
const { statusOptions, statusLabel } = usePageForm()

const pagesSearch = ref('')
const pagesStatusFilter = ref<'all' | 'draft' | 'in_review' | 'published'>('all')

const filteredPages = computed(() => {
  const q = pagesSearch.value.trim().toLowerCase()
  const status = pagesStatusFilter.value

  return pages.value.filter((page) => {
    if (status !== 'all' && (page.status || 'draft') !== status) {
      return false
    }

    if (!q) {
      return true
    }

    const haystack = `${page.title || ''} ${page.permalink || ''}`.toLowerCase()

    return haystack.includes(q)
  })
})

const editHref = (page: DashboardPage) => isArabic.value
  ? `/ar/dashboard/pages/${page.id}`
  : `/dashboard/pages/${page.id}`

const newHref = computed(() => isArabic.value ? '/ar/dashboard/pages/new' : '/dashboard/pages/new')

onMounted(loadPages)
</script>

<template>
  <UDashboardPanel id="pages-list">
    <template #header>
      <UDashboardNavbar
        :title="t.websitePages"
        icon="i-lucide-files"
      >
        <template #right>
          <UBadge
            color="neutral"
            variant="subtle"
            class="hidden sm:inline-flex"
          >
            {{ t.pagesCount(filteredPages.length, pages.length) }}
          </UBadge>
          <UButton
            icon="i-lucide-plus"
            size="sm"
            :to="newHref"
          >
            {{ t.newPage }}
          </UButton>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="pagesSearch"
            :placeholder="t.searchPages"
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
              :color="pagesStatusFilter === option.value ? 'primary' : 'neutral'"
              :variant="pagesStatusFilter === option.value ? 'solid' : 'outline'"
              @click="pagesStatusFilter = option.value"
            >
              {{ option.label }}
            </UButton>
          </UFieldGroup>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UAlert
        v-if="pagesError"
        color="error"
        variant="soft"
        :title="pagesError"
        :description="t.pagesPermission"
        class="mb-4"
      />

      <p
        v-if="!pagesError && filteredPages.length === 0"
        class="text-sm text-muted"
      >
        {{ t.noPagesFound }}
      </p>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="page in filteredPages"
          :key="page.id"
          :to="editHref(page)"
          class="maan-form-card block p-4 text-start transition hover:-translate-y-0.5 hover:no-underline"
        >
          <span class="mb-2 inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {{ statusLabel(page.status) }}
          </span>
          <h3 class="text-base font-semibold text-highlighted">
            {{ page.title || t.untitledPage }}
          </h3>
          <p class="mt-1 truncate text-sm leading-6 text-muted">
            {{ page.permalink }}
          </p>
        </NuxtLink>
      </div>
    </template>
  </UDashboardPanel>
</template>
