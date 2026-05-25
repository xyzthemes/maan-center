// Layer 2 — dashboard list state for ContentBlocks. Mirrors usePosts.
// Loads all blocks (up to 200) and exposes filtered slices to the list
// page so we don't refetch on every filter change.

export type DashboardBlock = {
  id: string
  type: string
  locale: string
  status: string
  payload: unknown
  placements: string[]
  sort: number | null
  published_at: string | null
  date_created: string
  date_updated: string
}

export const useDashboardBlocks = () => {
  const { t } = useDashboardI18n()
  const blocks = useState<DashboardBlock[]>('dashboard-blocks', () => [])
  const blocksError = useState<string>('dashboard-blocks-error', () => '')
  const isLoading = useState<boolean>('dashboard-blocks-loading', () => false)

  const loadBlocks = async () => {
    blocksError.value = ''
    isLoading.value = true
    try {
      const response = await $fetch<{ blocks: DashboardBlock[] }>('/api/dashboard/blocks')
      blocks.value = response.blocks
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      blocksError.value = fetchError.data?.message || fetchError.statusMessage || t.value.readBlocksError
    } finally {
      isLoading.value = false
    }
  }

  const deleteBlock = async (id: string) => {
    try {
      await $fetch(`/api/dashboard/blocks/${id}`, { method: 'DELETE' })
      blocks.value = blocks.value.filter(b => b.id !== id)
      return true
    } catch (error) {
      const fetchError = error as { data?: { message?: string }, statusMessage?: string }
      blocksError.value = fetchError.data?.message || fetchError.statusMessage || t.value.deleteBlockError
      return false
    }
  }

  return { blocks, blocksError, isLoading, loadBlocks, deleteBlock }
}
