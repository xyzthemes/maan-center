<script setup lang="ts">
definePageMeta({
  alias: ['/ar/dashboard/settings'],
  layout: 'dashboard'
})

const { t, isArabic } = useDashboardI18n()

// One card per known setting key. The list IS the registry — adding a
// new setting in server/utils/site-settings.ts requires adding an entry
// here too, but that's intentional: settings deserve curated explanation.
const settingCards = computed(() => [
  {
    key: 'working-hours',
    title: t.value.settingWorkingHours,
    description: isArabic.value
      ? 'تظهر في تذييل الموقع وفي بيانات Schema.org للأعمال المحلية.'
      : 'Shown in the footer and in the LocalBusiness schema.',
    icon: 'i-lucide-clock'
  },
  {
    key: 'dr-osama-bio',
    title: t.value.settingDrOsamaBio,
    description: isArabic.value
      ? 'النبذة المعروضة على الصفحة الرئيسية بكلتا اللغتين.'
      : 'Bio rendered on the homepage in both languages.',
    icon: 'i-lucide-user-round'
  },
  {
    key: 'mission-vision',
    title: t.value.settingMissionVision,
    description: isArabic.value
      ? 'يظهر في قسم «الرؤية والرسالة» على الصفحة الرئيسية.'
      : 'Shown on the homepage Mission & Vision section.',
    icon: 'i-lucide-eye'
  },
  {
    key: 'contact-info',
    title: t.value.settingContactInfo,
    description: isArabic.value
      ? 'رقم الهاتف وواتساب والبريد الإلكتروني والعنوان.'
      : 'Phone, WhatsApp, email, and address shown in footer + contact.',
    icon: 'i-lucide-message-circle-heart'
  },
  {
    key: 'stats',
    title: t.value.settingStats,
    description: isArabic.value
      ? 'الإحصائيات الأربعة على الصفحة الرئيسية.'
      : 'The four stat tiles on the homepage.',
    icon: 'i-lucide-bar-chart'
  },
  {
    key: 'theme',
    title: t.value.settingTheme,
    description: isArabic.value
      ? 'تخصيص ألوان الموقع للوضعين الفاتح والداكن.'
      : 'Tune site colors for light and dark modes.',
    icon: 'i-lucide-palette'
  }
])

const editHref = (key: string) => isArabic.value
  ? `/ar/dashboard/settings/${key}`
  : `/dashboard/settings/${key}`
</script>

<template>
  <UDashboardPanel id="settings-list">
    <template #header>
      <UDashboardNavbar
        :title="t.siteSettings"
        icon="i-lucide-settings"
      />
    </template>

    <template #body>
      <p class="mb-6 text-sm text-muted">
        {{ t.siteSettingsNavHint }}
      </p>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="card in settingCards"
          :key="card.key"
          :to="editHref(card.key)"
          class="maan-card block p-5 text-start hover:no-underline"
          style="border-top: 4px solid var(--maan-autism);"
        >
          <div
            class="maan-card-icon"
            style="margin-bottom: 0.75rem;"
          >
            <UIcon
              :name="card.icon"
              class="size-5"
            />
          </div>
          <h3
            class="text-base font-semibold"
            style="color: var(--maan-ink);"
          >
            {{ card.title }}
          </h3>
          <p
            class="mt-1 text-sm"
            style="color: var(--maan-ink-muted);"
          >
            {{ card.description }}
          </p>
        </NuxtLink>
      </div>
    </template>
  </UDashboardPanel>
</template>
