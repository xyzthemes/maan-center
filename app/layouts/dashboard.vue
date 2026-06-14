<script setup lang="ts">
import { canAccessScope, type PermissionScope } from '~/utils/permissions'

const {
  isArabic,
  sitePath,
  t,
  switchDashboardLocale
} = useDashboardI18n()
const { userName, userRole, userPermissions, isAdmin, ensureUser, logout } = useDashboardUser()
const colorMode = useColorMode()

// Per-nav-entry scope. Items with scope === undefined are visible to
// every signed-in staff member (Overview). Items with adminOnly are
// hidden unless userRole === 'admin' (Staff section).
type NavEntry = {
  label: string
  icon: string
  to: string
  scope?: PermissionScope
  adminOnly?: boolean
}

const canSeeEntry = (entry: NavEntry) => {
  if (entry.adminOnly) return isAdmin.value
  if (!entry.scope) return true
  return canAccessScope(
    { role: userRole.value, permissions: userPermissions.value },
    entry.scope
  )
}

const sidebarSide = computed<'left' | 'right'>(() => isArabic.value ? 'right' : 'left')
const isDark = computed(() => colorMode.value === 'dark')
const themeLabel = computed(() => isArabic.value
  ? (isDark.value ? 'الوضع الفاتح' : 'الوضع الداكن')
  : (isDark.value ? 'Light mode' : 'Dark mode'))
const themeIcon = computed(() => isDark.value ? 'i-lucide-sun' : 'i-lucide-moon')
const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const overviewPath = computed(() => isArabic.value ? '/ar/dashboard/overview' : '/dashboard/overview')

const allNavEntries = computed<NavEntry[]>(() => [
  {
    label: isArabic.value ? 'نظرة عامة' : 'Overview',
    icon: 'i-lucide-layout-dashboard',
    to: overviewPath.value
  },
  {
    label: t.value.blogPosts,
    icon: 'i-lucide-file-pen-line',
    to: isArabic.value ? '/ar/dashboard/posts' : '/dashboard/posts',
    scope: 'posts'
  },
  {
    label: t.value.categoriesNav,
    icon: 'i-lucide-tags',
    to: isArabic.value ? '/ar/dashboard/categories' : '/dashboard/categories',
    scope: 'posts'
  },
  {
    label: t.value.websitePages,
    icon: 'i-lucide-files',
    to: isArabic.value ? '/ar/dashboard/pages' : '/dashboard/pages',
    scope: 'pages'
  },
  {
    label: t.value.contentBlocks,
    icon: 'i-lucide-blocks',
    to: isArabic.value ? '/ar/dashboard/blocks' : '/dashboard/blocks',
    scope: 'blocks'
  },
  {
    label: t.value.forms,
    icon: 'i-lucide-clipboard-list',
    to: isArabic.value ? '/ar/dashboard/forms' : '/dashboard/forms',
    scope: 'forms'
  },
  {
    label: t.value.contactResponses,
    icon: 'i-lucide-inbox',
    to: isArabic.value ? '/ar/dashboard/submissions' : '/dashboard/submissions',
    scope: 'submissions'
  },
  {
    label: t.value.siteSettings,
    icon: 'i-lucide-settings',
    to: isArabic.value ? '/ar/dashboard/settings' : '/dashboard/settings',
    scope: 'settings'
  },
  {
    label: t.value.staff,
    icon: 'i-lucide-users',
    to: isArabic.value ? '/ar/dashboard/staff' : '/dashboard/staff',
    adminOnly: true
  }
])

const navItems = computed(() => [allNavEntries.value.filter(canSeeEntry)])

// Search palette items reuse the same canAccessScope filter so the
// command-K dropdown never shows surfaces the staff member can't open.
const searchGroups = computed(() => [
  {
    id: 'navigation',
    label: t.value.navigation,
    items: [
      ...allNavEntries.value.filter(canSeeEntry),
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

const searchLabel = computed(() => isArabic.value ? 'البحث...' : 'Search...')

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
          class="flex items-center gap-2.5 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg"
          style="--tw-ring-color: var(--maan-autism);"
          :aria-label="isArabic ? 'الذهاب إلى الموقع' : 'Go to the website'"
        >
          <img
            src="/logo-transparent.png"
            alt=""
            class="size-9 shrink-0 object-contain"
            width="36"
            height="36"
            aria-hidden="true"
          >
          <span
            v-if="!collapsed"
            class="truncate text-sm font-semibold"
            style="color: var(--maan-ink);"
          >
            {{ t.managerDashboard }}
          </span>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          :label="searchLabel"
        />
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

    <UDashboardSearch
      :groups="searchGroups"
      :placeholder="searchLabel"
    />

    <slot />
  </UDashboardGroup>
</template>
