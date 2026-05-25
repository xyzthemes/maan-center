// Centralizes the status-pill styling that was repeated inline in
// posts/blocks/pages list views. Maps each content status to a
// --maan-* token + a uniform 16%-tint background. Updating the colors
// here updates every dashboard list card.

export type ContentStatus = 'draft' | 'in_review' | 'published'

const TOKEN_BY_STATUS: Record<ContentStatus, 'down' | 'autism' | 'cta'> = {
  published: 'down',
  in_review: 'autism',
  draft: 'cta'
}

/** Inline-style object for the small status pill above each list card. */
export const statusBadgeStyle = (status: ContentStatus | string | undefined) => {
  const key = (status && status in TOKEN_BY_STATUS ? status : 'draft') as ContentStatus
  const token = TOKEN_BY_STATUS[key]
  return {
    background: `color-mix(in srgb, var(--maan-${token}) 16%, transparent)`,
    color: `var(--maan-${token})`
  }
}

/** Border style for the top-accent stripe of the card itself. */
export const statusCardTopBorder = (status: ContentStatus | string | undefined) => {
  const key = (status && status in TOKEN_BY_STATUS ? status : 'draft') as ContentStatus
  const token = TOKEN_BY_STATUS[key]
  return `border-top: 4px solid var(--maan-${token});`
}
