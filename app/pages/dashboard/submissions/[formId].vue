<script setup lang="ts">
// Per-form submissions view. Admin lands here from the cards on
// /dashboard/submissions and only sees responses for one form, so the
// triage UI stays scannable even when a survey has hundreds of replies.

import { pickLocale } from '~/utils/i18n-text'

definePageMeta({
  alias: ['/ar/dashboard/submissions/:formId'],
  layout: 'dashboard'
})

const route = useRoute()
const { t, isArabic } = useDashboardI18n()
const { submissions, submissionsError, isLoading, loadSubmissions, deleteSubmission } = useSubmissions()
const dashToast = useDashboardToast()

const formId = computed(() => String(route.params.formId))
const lang = computed<'en' | 'ar'>(() => isArabic.value ? 'ar' : 'en')
const backHref = computed(() => isArabic.value ? '/ar/dashboard/submissions' : '/dashboard/submissions')

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return t.value.noTimestamp
  return new Date(timestamp).toLocaleString(isArabic.value ? 'ar-BH' : 'en-US')
}

// ── Form metadata for the header ──────────────────────────────────────

type FormMeta = { id: string, slug: string, title: unknown, fieldCount: number }
const formMeta = ref<FormMeta | null>(null)

const loadFormMeta = async () => {
  try {
    const res = await $fetch<{ data: FormMeta }>(`/api/dashboard/forms/${formId.value}`)
    formMeta.value = res?.data
      ? { id: res.data.id, slug: res.data.slug, title: res.data.title, fieldCount: Array.isArray((res.data as unknown as { fields?: unknown[] }).fields) ? (res.data as unknown as { fields: unknown[] }).fields.length : 0 }
      : null
  } catch {
    formMeta.value = null
  }
}

const headerTitle = computed(() => {
  if (formMeta.value) return pickLocale(formMeta.value.title, lang.value) || formMeta.value.slug
  // Until the form lookup completes, fall back to the first submission's
  // form title — submissions arrive on the same fetch.
  return pickLocale(submissions.value[0]?.form?.title, lang.value) || ''
})

const publicUrl = computed(() => {
  const slug = formMeta.value?.slug || submissions.value[0]?.form?.slug
  return slug ? `/forms/${slug}` : ''
})

// ── Filters (locale + search) ─────────────────────────────────────────

const search = ref('')
const localeFilter = ref<'all' | 'en' | 'ar'>('all')

const localeOptions = computed(() => [
  { value: 'all' as const, label: t.value.filterByLocale },
  { value: 'en' as const, label: 'English' },
  { value: 'ar' as const, label: 'العربية' }
])

const filteredSubmissions = computed(() => {
  const q = search.value.trim().toLowerCase()
  return submissions.value.filter((s) => {
    if (localeFilter.value !== 'all' && (s.locale || 'en') !== localeFilter.value) return false
    if (!q) return true
    return s.values.some((v) => {
      const haystack = `${v.label || ''} ${v.value || ''}`.toLowerCase()
      return haystack.includes(q)
    })
  })
})

const hasActiveFilter = computed(() => search.value !== '' || localeFilter.value !== 'all')

const clearAllFilters = () => {
  search.value = ''
  localeFilter.value = 'all'
}

// ── Delete ────────────────────────────────────────────────────────────

const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const pendingDeleteId = ref<string | null>(null)

const askDelete = (id: string) => {
  pendingDeleteId.value = id
  isDeleteOpen.value = true
}

const confirmDelete = async () => {
  if (!pendingDeleteId.value) return
  isDeleting.value = true
  const ok = await deleteSubmission(pendingDeleteId.value)
  isDeleting.value = false
  if (ok) {
    dashToast.deleted()
    isDeleteOpen.value = false
    pendingDeleteId.value = null
  } else {
    dashToast.deleteFailed()
  }
}

onMounted(() => {
  loadSubmissions(formId.value)
  loadFormMeta()
})

watch(formId, () => {
  loadSubmissions(formId.value)
  loadFormMeta()
})
</script>

<template>
  <UDashboardPanel id="submissions-detail">
    <template #header>
      <UDashboardNavbar :title="headerTitle || t.contactResponses">
        <template #leading>
          <UButton
            :to="backHref"
            :icon="isArabic ? 'i-lucide-arrow-right' : 'i-lucide-arrow-left'"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            :aria-label="t.contactResponses"
          />
        </template>
        <template #right>
          <UBadge
            color="primary"
            variant="subtle"
          >
            {{ filteredSubmissions.length }} / {{ submissions.length }}
          </UBadge>
          <UButton
            v-if="publicUrl"
            :to="publicUrl"
            target="_blank"
            icon="i-lucide-external-link"
            size="sm"
            color="neutral"
            variant="outline"
          >
            {{ t.formPublicUrl }}
          </UButton>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="search"
            :placeholder="t.submissionsSearch"
            icon="i-lucide-search"
            size="sm"
            class="w-full max-w-xs"
          />
          <USelect
            v-model="localeFilter"
            :items="localeOptions"
            size="sm"
            class="hidden md:flex w-full"
          />
        </template>
        <template
          v-if="hasActiveFilter"
          #right
        >
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-lucide-x-circle"
            @click="clearAllFilters"
          >
            {{ t.clearFilters }}
          </UButton>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UAlert
        v-if="submissionsError"
        color="error"
        variant="soft"
        :title="submissionsError"
        :description="t.submissionsPermission"
        class="mb-4"
      />

      <div
        v-if="isLoading && submissions.length === 0"
        class="grid gap-5"
      >
        <MaanSkeletonGrid :count="3" />
      </div>

      <MaanEmptyState
        v-else-if="!submissionsError && submissions.length === 0"
        icon="i-lucide-inbox"
        :title="t.noSubmissionsYet"
        :description="t.submissionsEmptyHint"
      />

      <p
        v-else-if="!submissionsError && filteredSubmissions.length === 0 && hasActiveFilter"
        class="text-sm text-muted"
      >
        {{ t.noMatchingFilters }}
      </p>

      <div
        v-else
        class="grid gap-4"
      >
        <article
          v-for="submission in filteredSubmissions"
          :key="submission.id"
          class="maan-form-card p-6"
        >
          <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
            <p class="text-sm text-muted">
              {{ formatTimestamp(submission.timestamp) }}
            </p>
            <div class="flex items-center gap-2">
              <UBadge
                color="neutral"
                variant="subtle"
                size="sm"
              >
                {{ submission.locale === 'ar' ? 'AR' : 'EN' }}
              </UBadge>
              <UBadge
                color="primary"
                variant="subtle"
                size="sm"
              >
                {{ submission.values.length }} {{ t.fields }}
              </UBadge>
              <UButton
                icon="i-lucide-trash-2"
                size="xs"
                color="error"
                variant="ghost"
                :aria-label="t.submissionsDeleteConfirmTitle"
                @click="askDelete(submission.id)"
              />
            </div>
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
      </div>

      <UModal v-model:open="isDeleteOpen">
        <template #content>
          <div class="p-6">
            <h3 class="text-lg font-semibold text-highlighted">
              {{ t.submissionsDeleteConfirmTitle }}
            </h3>
            <p class="mt-2 text-sm text-muted">
              {{ t.submissionsDeleteConfirmDescription }}
            </p>
            <div class="mt-5 flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="ghost"
                :disabled="isDeleting"
                @click="isDeleteOpen = false"
              >
                {{ t.cancel }}
              </UButton>
              <UButton
                color="error"
                icon="i-lucide-trash-2"
                :loading="isDeleting"
                @click="confirmDelete"
              >
                {{ t.confirmDelete }}
              </UButton>
            </div>
          </div>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
