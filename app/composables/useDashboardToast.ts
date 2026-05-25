// Thin wrapper over useToast() so every dashboard editor uses the same
// copy + icon + color for save/delete success and failure. UApp is
// wired in app/app.vue so toasts render correctly in both SSR and CSR.
//
// Use alongside the existing inline `savedFlash` badge — toast confirms
// the result globally, the badge confirms it in-context near the form.

export const useDashboardToast = () => {
  const toast = useToast()
  const { t } = useDashboardI18n()

  const saved = (label?: string) => {
    toast.add({
      title: t.value.toastSaved,
      description: label,
      icon: 'i-lucide-check',
      color: 'success'
    })
  }

  const failed = (msg?: string) => {
    toast.add({
      title: t.value.toastSaveFailed,
      description: msg,
      icon: 'i-lucide-triangle-alert',
      color: 'error'
    })
  }

  const deleted = (label?: string) => {
    toast.add({
      title: t.value.toastDeleted,
      description: label,
      icon: 'i-lucide-trash-2',
      color: 'neutral'
    })
  }

  const deleteFailed = (msg?: string) => {
    toast.add({
      title: t.value.toastDeleteFailed,
      description: msg,
      icon: 'i-lucide-triangle-alert',
      color: 'error'
    })
  }

  return { saved, failed, deleted, deleteFailed }
}
