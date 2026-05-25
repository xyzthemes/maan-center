// Per-staff editor state. Mirrors useFormForm — one reactive draft
// representing either a new invite or an edit of an existing user.

import type { PermissionScope } from '~/utils/permissions'

export type StaffRole = 'admin' | 'staff'

export type StaffDraft = {
  id?: string
  name: string
  email: string
  role: StaffRole
  permissions: PermissionScope[]
}

export const emptyStaffDraft = (): StaffDraft => ({
  name: '',
  email: '',
  role: 'staff',
  permissions: []
})

export const useStaffForm = (onSaved?: () => unknown | Promise<unknown>) => {
  const { t } = useDashboardI18n()
  const staffForm = reactive<StaffDraft>(emptyStaffDraft())
  const saveError = ref('')
  const saveSuccess = ref('')
  const isSaving = ref(false)

  const editStaff = (raw: {
    id: string
    name: string
    email: string
    role: string
    permissions: string[] | PermissionScope[]
  }) => {
    Object.assign(staffForm, {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      role: (raw.role === 'admin' ? 'admin' : 'staff') as StaffRole,
      permissions: (raw.permissions as PermissionScope[]) || []
    })
    saveError.value = ''
    saveSuccess.value = ''
  }

  const newStaff = () => {
    Object.assign(staffForm, emptyStaffDraft())
    saveError.value = ''
    saveSuccess.value = ''
  }

  const saveStaff = async (): Promise<string | undefined> => {
    saveError.value = ''
    saveSuccess.value = ''
    isSaving.value = true
    try {
      const wasCreate = !staffForm.id
      const url = wasCreate ? '/api/dashboard/staff' : `/api/dashboard/staff/${staffForm.id}`
      const method = wasCreate ? 'POST' : 'PATCH'

      // On create the body needs email; on update we send name/role/permissions only.
      const body = wasCreate
        ? {
            name: staffForm.name,
            email: staffForm.email,
            role: staffForm.role,
            permissions: staffForm.role === 'admin' ? [] : staffForm.permissions
          }
        : {
            name: staffForm.name,
            role: staffForm.role,
            permissions: staffForm.role === 'admin' ? [] : staffForm.permissions
          }

      const response = await $fetch<{ data?: { id?: string } }>(url, { method, body })
      const savedId = response?.data?.id || staffForm.id
      if (wasCreate && savedId) staffForm.id = savedId
      saveSuccess.value = wasCreate ? t.value.inviteSent : t.value.staffSavedSuccess
      if (onSaved) await onSaved()
      return savedId
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      saveError.value = fetchError.data?.message || fetchError.statusMessage || t.value.saveSettingError
      return undefined
    } finally {
      isSaving.value = false
    }
  }

  return { staffForm, saveError, saveSuccess, isSaving, editStaff, newStaff, saveStaff }
}
