<script setup lang="ts">
const {
  isArabic,
  sitePath,
  t,
  switchDashboardLocale
} = useDashboardI18n()
const { userName, userRole, ensureUser, logout } = useDashboardUser()
const colorMode = useColorMode()

const sidebarSide = computed<'left' | 'right'>(() => isArabic.value ? 'right' : 'left')
const isDark = computed(() => colorMode.value === 'dark')
const themeLabel = computed(() => isArabic.value
  ? (isDark.value ? 'الوضع الفاتح' : 'الوضع الداكن')
  : (isDark.value ? 'Light mode' : 'Dark mode'))
const themeIcon = computed(() => isDark.value ? 'i-lucide-sun' : 'i-lucide-moon')
const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const navItems = computed(() => [[
  {
    label: t.value.blogPosts,
    icon: 'i-lucide-file-pen-line',
    to: isArabic.value ? '/ar/dashboard/posts' : '/dashboard/posts'
  },
  {
    label: t.value.websitePages,
    icon: 'i-lucide-files',
    to: isArabic.value ? '/ar/dashboard/pages' : '/dashboard/pages'
  },
  {
    label: t.value.contactResponses,
    icon: 'i-lucide-inbox',
    to: isArabic.value ? '/ar/dashboard/submissions' : '/dashboard/submissions'
  }
]])

const searchGroups = computed(() => [
  {
    id: 'navigation',
    label: t.value.navigation,
    items: [
      {
        label: t.value.blogPosts,
        icon: 'i-lucide-file-pen-line',
        to: isArabic.value ? '/ar/dashboard/posts' : '/dashboard/posts'
      },
      {
        label: t.value.websitePages,
        icon: 'i-lucide-files',
        to: isArabic.value ? '/ar/dashboard/pages' : '/dashboard/pages'
      },
      {
        label: t.value.contactResponses,
        icon: 'i-lucide-inbox',
        to: isArabic.value ? '/ar/dashboard/submissions' : '/dashboard/submissions'
      },
      {
        label: t.value.site,
        icon: 'i-lucide-external-link',
        to: sitePath.value
      }
    ]
  },
  {
    id: 'account',
    label: t.value.account,
    items: [
      {
        label: isArabic.value ? 'EN' : 'عربي',
        icon: 'i-lucide-languages',
        onSelect: switchDashboardLocale
      },
      {
        label: t.value.signOut,
        icon: 'i-lucide-log-out',
        onSelect: logout
      }
    ]
  }
])

const userMenuItems = computed(() => [
  [
    {
      label: userRole.value || t.value.managerFallback,
      type: 'label' as const
    }
  ],
  [
    {
      label: t.value.site,
      icon: 'i-lucide-external-link',
      to: sitePath.value
    },
    {
      label: themeLabel.value,
      icon: themeIcon.value,
      onSelect: toggleTheme
    },
    {
      label: isArabic.value ? 'EN' : 'عربي',
      icon: 'i-lucide-languages',
      onSelect: switchDashboardLocale
    }
  ],
  [
    {
      label: t.value.signOut,
      icon: 'i-lucide-log-out',
      onSelect: logout
    }
  ]
])

useSeoMeta({
  title: () => t.value.title,
  robots: 'noindex, nofollow'
})

onMounted(() => {
  ensureUser()
})
</script>

<template>
  <UDashboardGroup
    storage="local"
    storage-key="maan-dashboard"
  >
    <UDashboardSidebar
      :side="sidebarSide"
      resizable
      collapsible
      :default-size="16"
      :min-size="12"
      :max-size="24"
      mode="drawer"
    >
      <template #header="{ collapsed }">
        <NuxtLink
          :to="sitePath"
          class="flex items-center gap-2 min-w-0"
        >
          <div class="maan-logo-mark grid size-8 shrink-0 place-items-center bg-primary text-inverted shadow-sm">
            <span class="text-sm font-semibold leading-none">M</span>
          </div>
          <span
            v-if="!collapsed"
            class="truncate text-sm font-semibold text-highlighted"
          >
            {{ t.managerDashboard }}
          </span>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" />
        <USeparator class="my-3" />
        <UNavigationMenu
          orientation="vertical"
          :items="navItems"
          :collapsed="collapsed"
        />
      </template>

      <template #footer="{ collapsed }">
        <UDropdownMenu
          :items="userMenuItems"
          :content="{ side: 'top', align: 'start', sideOffset: 8 }"
          :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width)' }"
          class="w-full"
        >
          <UButton
            :label="collapsed ? undefined : userName"
            :avatar="{ text: userName.slice(0, 1).toUpperCase() }"
            color="neutral"
            variant="ghost"
            :block="!collapsed"
            :square="collapsed"
            trailing-icon="i-lucide-chevron-up"
            class="justify-between"
          />
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="searchGroups" />

    <slot />
  </UDashboardGroup>
</template>
