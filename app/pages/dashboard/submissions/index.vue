<script setup lang="ts">
// Submissions hub — one card per form. Admins drill into a form to see
// its responses; the previous "all submissions on one screen" pattern
// got overwhelming once a survey accumulated hundreds of replies.

import { pickLocale } from '~/utils/i18n-text'

definePageMeta({
  alias: ['/ar/dashboard/submissions'],
  layout: 'dashboard'
})

const { t, isArabic } = useDashboardI18n()
const { forms, formsError, isLoading, loadForms } = useDashboardForms()

const lang = computed<'en' | 'ar'>(() => isArabic.value ? 'ar' : 'en')

const search = ref('')

// Sort by submission count desc so the most-active surveys lead the
// page. Forms with zero submissions still appear (admin needs to know
// which surveys aren't getting answers) but at the bottom.
const sortedForms = computed(() => [...forms.value].sort((a, b) => {
  if (b.submissionCount !== a.submissionCount) {
    return b.submissionCount - a.submissionCount
  }
  return a.slug.localeCompare(b.slug)
}))

const filteredForms = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return sortedForms.value
  return sortedForms.value.filter((f) => {
    const haystack = `${pickLocale(f.title, 'en')} ${pickLocale(f.title, 'ar')} ${f.slug}`.toLowerCase()
    return haystack.includes(q)
  })
})

const totalSubmissions = computed(() =>
  forms.value.reduce((sum, f) => sum + f.submissionCount, 0)
)

const formsWithSubmissions = computed(() =>
  forms.value.filter(f => f.submissionCount > 0).length
)

const cardHref = (formId: string) => isArabic.value
  ? `/ar/dashboard/submissions/${formId}`
  : `/dashboard/submissions/${formId}`

onMounted(loadForms)
</script>

<template>
  <UDashboardPanel id="submissions-hub">
    <template #header>
      <UDashboardNavbar
        :title="t.contactResponses"
        icon="i-lucide-inbox"
      >
        <template #right>
          <UBadge
            color="primary"
            variant="subtle"
          >
            {{ totalSubmissions }}
          </UBadge>
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
      </UDashboardToolbar>
    </template>

    <template #body>
      <UAlert
        v-if="formsError"
        color="error"
        variant="soft"
        :title="formsError"
        :description="t.submissionsPermission"
        class="mb-4"
      />

      <p
        v-if="!formsError && forms.length > 0"
        class="mb-4 text-sm"
        style="color: var(--maan-ink-muted);"
      >
        {{ formsWithSubmissions }} / {{ forms.length }} · {{ totalSubmissions }} {{ t.contactResponses }}
      </p>

      <div
        v-if="isLoading && forms.length === 0"
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <MaanSkeletonGrid :count="6" />
      </div>

      <MaanEmptyState
        v-else-if="!formsError && forms.length === 0"
        icon="i-lucide-inbox"
        :title="t.noFormsYet"
        :description="t.createFirstFormHint"
        :cta-label="t.newForm"
        :cta-to="isArabic ? '/ar/dashboard/forms/new' : '/dashboard/forms/new'"
      />

      <p
        v-else-if="filteredForms.length === 0"
        class="text-sm text-muted"
      >
        {{ t.noMatchingFilters }}
      </p>

      <div
        v-else
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <NuxtLink
          v-for="form in filteredForms"
          :key="form.id"
          :to="cardHref(form.id)"
          class="maan-card maan-submissions-card group block p-5 text-start hover:no-underline"
          :class="form.submissionCount === 0 && 'maan-submissions-card--empty'"
        >
          <div class="mb-3 flex items-center justify-between gap-2">
            <span
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              :style="form.isActive
                ? 'background: color-mix(in srgb, var(--maan-down) 16%, transparent); color: var(--maan-down);'
                : 'background: color-mix(in srgb, var(--maan-cta) 16%, transparent); color: var(--maan-cta);'"
            >
              {{ form.isActive ? t.formActive : t.formInactive }}
            </span>
            <UIcon
              :name="isArabic ? 'i-lucide-arrow-left' : 'i-lucide-arrow-right'"
              class="size-4 opacity-0 transition-opacity group-hover:opacity-100"
              :style="{ color: 'var(--maan-autism)' }"
            />
          </div>

          <h3
            class="text-base font-semibold"
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

          <div
            class="mt-4 grid grid-cols-2 gap-3 border-t pt-4"
            :style="{ borderColor: 'var(--maan-line)' }"
          >
            <div>
              <p
                class="text-2xl font-bold"
                :style="{ color: form.submissionCount > 0 ? 'var(--maan-autism)' : 'var(--maan-ink-muted)' }"
              >
                {{ form.submissionCount }}
              </p>
              <p
                class="text-xs"
                style="color: var(--maan-ink-muted);"
              >
                {{ t.contactResponses }}
              </p>
            </div>
            <div>
              <p
                class="text-2xl font-bold"
                style="color: var(--maan-ink);"
              >
                {{ form.fieldCount }}
              </p>
              <p
                class="text-xs"
                style="color: var(--maan-ink-muted);"
              >
                {{ t.formFields }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
/* Forms with zero submissions are visible (admin needs to know they
 * exist) but visually de-emphasized — slightly faded numbers + reduced
 * top-accent saturation. The card stays clickable so admins can review
 * the form configuration even before the first response arrives. */
.maan-submissions-card--empty {
  opacity: 0.7;
}
.maan-submissions-card--empty:hover {
  opacity: 1;
}
</style>
