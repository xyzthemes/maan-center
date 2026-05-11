<script setup lang="ts">
definePageMeta({
  alias: ['/ar/dashboard/submissions'],
  layout: 'dashboard'
})

const { t, isArabic } = useDashboardI18n()
const { submissions, submissionsError, loadSubmissions } = useSubmissions()

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) {
    return t.value.noTimestamp
  }

  return new Date(timestamp).toLocaleString(isArabic.value ? 'ar-BH' : 'en-US')
}

onMounted(loadSubmissions)
</script>

<template>
  <UDashboardPanel>
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
            {{ submissions.length }}
          </UBadge>
        </template>
      </UDashboardNavbar>
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

      <p
        v-if="!submissionsError && submissions.length === 0"
        class="text-sm text-muted"
      >
        {{ t.emptySubmissions }}
      </p>

      <div class="grid gap-5">
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
                {{ formatTimestamp(submission.timestamp) }}
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
      </div>
    </template>
  </UDashboardPanel>
</template>
