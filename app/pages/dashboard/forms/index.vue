<script setup lang="ts">
import { pickLocale } from '~/utils/i18n-text'

definePageMeta({
  alias: ['/ar/dashboard/forms'],
  layout: 'dashboard'
})

const { t, isArabic } = useDashboardI18n()
const { forms, formsError, isLoading, loadForms } = useDashboardForms()

const lang = computed<'en' | 'ar'>(() => isArabic.value ? 'ar' : 'en')

const search = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const statusOptions = computed(() => [
  { value: 'all' as const, label: t.value.filterAll },
  { value: 'active' as const, label: t.value.formActive },
  { value: 'inactive' as const, label: t.value.formInactive }
])

const filteredForms = computed(() => {
  const q = search.value.trim().toLowerCase()
  return forms.value.filter((f) => {
    if (statusFilter.value === 'active' && !f.isActive) return false
    if (statusFilter.value === 'inactive' && f.isActive) return false
    if (!q) return true
    const haystack = `${pickLocale(f.title, 'en')} ${pickLocale(f.title, 'ar')} ${f.slug}`.toLowerCase()
    return haystack.includes(q)
  })
})

const hasActiveFilter = computed(() => search.value !== '' || statusFilter.value !== 'all')

const newHref = computed(() => isArabic.value ? '/ar/dashboard/forms/new' : '/dashboard/forms/new')
const editHref = (id: string) => isArabic.value ? `/ar/dashboard/forms/${id}` : `/dashboard/forms/${id}`

onMounted(loadForms)
</script>

<template>
  <UDashboardPanel id="forms-list">
    <template #header>
      <UDashboardNavbar
        :title="t.forms"
        icon="i-lucide-clipboard-list"
      >
        <template #right>
          <UBadge
            color="neutral"
            variant="subtle"
            class="hidden sm:inline-flex"
          >
            {{ t.formsCount(filteredForms.length, forms.length) }}
          </UBadge>
          <UButton
            icon="i-lucide-plus"
            size="sm"
            :to="newHref"
          >
            {{ t.newForm }}
          </UButton>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="search"
            :placeholder="t.searchForms"
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
              :color="statusFilter === option.value ? 'primary' : 'neutral'"
              :variant="statusFilter === option.value ? 'solid' : 'outline'"
              @click="statusFilter = option.value"
            >
              {{ option.label }}
            </UButton>
          </UFieldGroup>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UAlert
        v-if="formsError"
        color="error"
        variant="soft"
        :title="formsError"
        class="mb-4"
      />

      <div
        v-if="isLoading && forms.length === 0"
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <MaanSkeletonGrid :count="6" />
      </div>

      <p
        v-else-if="!formsError && filteredForms.length === 0 && hasActiveFilter"
        class="text-sm text-muted"
      >
        {{ t.noMatchingFilters }}
      </p>

      <MaanEmptyState
        v-else-if="!formsError && forms.length === 0"
        icon="i-lucide-clipboard-list"
        :title="t.noFormsYet"
        :description="t.createFirstFormHint"
        :cta-label="t.newForm"
        :cta-to="newHref"
      />

      <div
        v-else
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <NuxtLink
          v-for="form in filteredForms"
          :key="form.id"
          :to="editHref(form.id)"
          class="maan-card block p-5 text-start hover:no-underline"
          :style="form.isActive
            ? 'border-top: 4px solid var(--maan-down);'
            : 'border-top: 4px solid var(--maan-cta);'"
        >
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            :style="form.isActive
              ? 'background: color-mix(in srgb, var(--maan-down) 16%, transparent); color: var(--maan-down);'
              : 'background: color-mix(in srgb, var(--maan-cta) 16%, transparent); color: var(--maan-cta);'"
          >
            {{ form.isActive ? t.formActive : t.formInactive }}
          </span>
          <h3
            class="mt-3 text-base font-semibold"
            style="color: var(--maan-ink);"
          >
            {{ pickLocale(form.title, lang) || form.slug }}
          </h3>
          <p
            class="mt-1 truncate font-mono text-xs"
            style="color: var(--maan-ink-muted);"
          >
            /forms/{{ form.slug }}
          </p>
          <p
            class="mt-3 text-xs"
            style="color: var(--maan-ink-muted);"
          >
            {{ form.fieldCount }} · {{ form.submissionCount }} {{ t.contactResponses }}
          </p>
        </NuxtLink>
      </div>
    </template>
  </UDashboardPanel>
</template>
