<script setup lang="ts">
// Staff list — one card per member. Admin-only (the global middleware
// + route rules already block staff users from reaching this URL).

import { PERMISSION_SCOPES } from '~/utils/permissions'

definePageMeta({
  alias: ['/ar/dashboard/staff'],
  layout: 'dashboard'
})

const { t, isArabic } = useDashboardI18n()
const { staff, staffError, isLoading, loadStaff } = useDashboardStaff()

const search = ref('')

const filteredStaff = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return staff.value
  return staff.value.filter(s => `${s.name} ${s.email}`.toLowerCase().includes(q))
})

const newHref = computed(() => isArabic.value ? '/ar/dashboard/staff/new' : '/dashboard/staff/new')
const editHref = (id: string) => isArabic.value ? `/ar/dashboard/staff/${id}` : `/dashboard/staff/${id}`

const formatTimestamp = (timestamp: string | null) => {
  if (!timestamp) return t.value.neverSignedIn
  return new Date(timestamp).toLocaleDateString(isArabic.value ? 'ar-BH' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map(p => p[0]?.toUpperCase() || '').join('') || '?'
}

const permissionLabel = (scope: string) => {
  const key = ('section' + scope.charAt(0).toUpperCase() + scope.slice(1)) as keyof typeof t.value
  return (t.value[key] as string | undefined) || scope
}

// Sort: admins first, then alphabetical by name.
const sortedStaff = computed(() => [...filteredStaff.value].sort((a, b) => {
  if (a.role !== b.role) {
    if (a.role === 'admin') return -1
    if (b.role === 'admin') return 1
  }
  return a.name.localeCompare(b.name)
}))

onMounted(loadStaff)

// Expose unused PERMISSION_SCOPES reference here so the chip rendering
// keeps a stable order matching the editor checklist.
const orderedScopes = PERMISSION_SCOPES
</script>

<template>
  <UDashboardPanel id="staff-list">
    <template #header>
      <UDashboardNavbar
        :title="t.staff"
        icon="i-lucide-users"
      >
        <template #right>
          <UBadge
            color="neutral"
            variant="subtle"
            class="hidden sm:inline-flex"
          >
            {{ staff.length }}
          </UBadge>
          <UButton
            icon="i-lucide-user-plus"
            size="sm"
            :to="newHref"
          >
            {{ t.newStaff }}
          </UButton>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="search"
            :placeholder="t.searchStaff"
            icon="i-lucide-search"
            size="sm"
            class="w-full max-w-xs"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UAlert
        v-if="staffError"
        color="error"
        variant="soft"
        :title="staffError"
        class="mb-4"
      />

      <div
        v-if="isLoading && staff.length === 0"
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <MaanSkeletonGrid :count="3" />
      </div>

      <MaanEmptyState
        v-else-if="!staffError && staff.length === 0"
        icon="i-lucide-users"
        :title="t.noStaffYet"
        :description="t.inviteFirstStaffHint"
        :cta-label="t.newStaff"
        :cta-to="newHref"
        cta-icon="i-lucide-user-plus"
      />

      <div
        v-else
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <NuxtLink
          v-for="member in sortedStaff"
          :key="member.id"
          :to="editHref(member.id)"
          class="maan-card block p-5 text-start hover:no-underline"
          :style="member.role === 'admin'
            ? 'border-top: 4px solid var(--maan-autism);'
            : 'border-top: 4px solid var(--maan-down);'"
        >
          <header class="mb-3 flex items-center gap-3">
            <div
              class="maan-staff-avatar"
              :style="member.role === 'admin'
                ? 'background: var(--maan-autism-soft); color: var(--maan-autism);'
                : 'background: var(--maan-down-soft); color: var(--maan-down);'"
            >
              {{ initials(member.name) }}
            </div>
            <div class="min-w-0 flex-1">
              <h3
                class="truncate text-base font-semibold"
                style="color: var(--maan-ink);"
              >
                {{ member.name || member.email }}
              </h3>
              <p
                class="truncate text-xs"
                style="color: var(--maan-ink-muted);"
              >
                {{ member.email }}
              </p>
            </div>
            <UBadge
              v-if="member.banned"
              color="error"
              variant="subtle"
              size="sm"
              icon="i-lucide-ban"
            >
              {{ t.staffBanned }}
            </UBadge>
          </header>

          <div class="mb-3 flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              :style="member.role === 'admin'
                ? 'background: color-mix(in srgb, var(--maan-autism) 16%, transparent); color: var(--maan-autism);'
                : 'background: color-mix(in srgb, var(--maan-down) 16%, transparent); color: var(--maan-down);'"
            >
              {{ member.role === 'admin' ? t.roleAdmin : t.roleStaff }}
            </span>
            <span
              v-if="member.role === 'staff' && member.permissions.length === 0"
              class="rounded-full px-2 py-0.5 text-[10px]"
              :style="{ background: 'color-mix(in srgb, var(--maan-cta) 16%, transparent)', color: 'var(--maan-cta)' }"
            >
              {{ t.permissionsHint }}
            </span>
          </div>

          <div
            v-if="member.role === 'staff' && member.permissions.length > 0"
            class="mb-3 flex flex-wrap gap-1"
          >
            <span
              v-for="scope in orderedScopes.filter(s => member.permissions.includes(s))"
              :key="scope"
              class="rounded-md border px-1.5 py-0.5 text-[11px]"
              style="border-color: var(--maan-line); color: var(--maan-ink-muted);"
            >
              {{ permissionLabel(scope) }}
            </span>
          </div>

          <p
            class="text-xs"
            style="color: var(--maan-ink-muted);"
          >
            {{ t.lastActive }}: {{ formatTimestamp(member.lastSignInAt) }}
          </p>
        </NuxtLink>
      </div>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
.maan-staff-avatar {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}
</style>
