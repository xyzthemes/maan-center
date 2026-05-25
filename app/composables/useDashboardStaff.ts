// Dashboard list state for staff members. Mirrors useDashboardForms.
// Holds the lightweight list shape from /api/dashboard/staff; the
// editor pulls the full record via useStaffForm.

import type { PermissionScope } from '~/utils/permissions'

export type DashboardStaff = {
  id: string
  name: string
  email: string
  role: string
  permissions: PermissionScope[] | string[]
  banned: boolean
  banReason: string | null
  banExpires: string | null
  emailVerified: boolean
  createdAt: string
  lastSignInAt: string | null
}

export const useDashboardStaff = () => {
  const { t } = useDashboardI18n()
  const staff = useState<DashboardStaff[]>('dashboard-staff', () => [])
  const staffError = useState<string>('dashboard-staff-error', () => '')
  const isLoading = useState<boolean>('dashboard-staff-loading', () => false)

  const loadStaff = async () => {
    staffError.value = ''
    isLoading.value = true
    try {
      const response = await $fetch<{ staff: DashboardStaff[] }>('/api/dashboard/staff')
      staff.value = response.staff
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      staffError.value = fetchError.data?.message || fetchError.statusMessage || t.value.readSettingsError
    } finally {
      isLoading.value = false
    }
  }

  const deleteStaff = async (id: string) => {
    try {
      await $fetch(`/api/dashboard/staff/${id}`, { method: 'DELETE' })
      staff.value = staff.value.filter(s => s.id !== id)
      return { ok: true as const }
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      return { ok: false as const, error: fetchError.data?.message || fetchError.statusMessage }
    }
  }

  const resendInvite = async (id: string) => {
    try {
      await $fetch(`/api/dashboard/staff/${id}/resend-invite`, { method: 'POST' })
      return { ok: true as const }
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      return { ok: false as const, error: fetchError.data?.message || fetchError.statusMessage }
    }
  }

  const banStaff = async (id: string, body: { reason?: string, expiresAt?: string }) => {
    try {
      const res = await $fetch<{ data: DashboardStaff }>(`/api/dashboard/staff/${id}/ban`, {
        method: 'POST',
        body
      })
      // Optimistically reflect in the cached list.
      const idx = staff.value.findIndex(s => s.id === id)
      if (idx !== -1) staff.value[idx] = res.data
      return { ok: true as const }
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      return { ok: false as const, error: fetchError.data?.message || fetchError.statusMessage }
    }
  }

  const unbanStaff = async (id: string) => {
    try {
      const res = await $fetch<{ data: DashboardStaff }>(`/api/dashboard/staff/${id}/unban`, { method: 'POST' })
      const idx = staff.value.findIndex(s => s.id === id)
      if (idx !== -1) staff.value[idx] = res.data
      return { ok: true as const }
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      return { ok: false as const, error: fetchError.data?.message || fetchError.statusMessage }
    }
  }

  return { staff, staffError, isLoading, loadStaff, deleteStaff, resendInvite, banStaff, unbanStaff }
}
