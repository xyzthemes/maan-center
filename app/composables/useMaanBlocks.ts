// Layer 2 — public-side fetcher for ContentBlocks.
//
// Every consumer follows the same fallback pattern: ask the DB for blocks
// of a given type + locale + placement; if the DB returns nothing, render
// from the existing typed source array. This means a fresh install
// (no blocks created yet) keeps showing the curated copy that ships in
// the repo, and unpublishing all blocks of a type degrades to the same
// fallback rather than rendering a blank section.

export type BlockType
  = | 'testimonial'
    | 'faq_item'
    | 'stat_tile'
    | 'team_member'
    | 'service_card'

export type PublicBlock<TPayload = unknown> = {
  id: string
  type: BlockType
  locale: 'en' | 'ar' | '*'
  payload: TPayload
  placements: string[]
  sort: number | null
  publishedAt: string | null
}

export type GetBlocksOptions = {
  /** Filter to blocks that include this placement id. */
  placement?: string
  /** Limit returned blocks (server clamps to [1, 100]). Defaults to 50. */
  limit?: number
}

export const useMaanBlocks = () => {
  /**
   * Returns published blocks for the given type + locale. The API
   * always includes blocks with `locale='*'` (locale-agnostic) on top
   * of any matching `en`/`ar` rows.
   */
  const byType = async <TPayload = unknown>(
    type: BlockType,
    locale: 'en' | 'ar' = 'en',
    opts: GetBlocksOptions = {}
  ): Promise<Array<PublicBlock<TPayload>>> => {
    try {
      const res = await $fetch<{ blocks: Array<PublicBlock<TPayload>> }>('/api/public/blocks', {
        query: {
          type,
          locale,
          ...(opts.placement ? { placement: opts.placement } : {}),
          ...(opts.limit ? { limit: opts.limit } : {})
        }
      })
      return res.blocks ?? []
    } catch {
      return []
    }
  }

  return { byType }
}
