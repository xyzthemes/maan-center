// Layer 1 — Single source of truth for Post categorization + placement.
//
// Used by:
//   • Dashboard editor (PostEditorForm) — renders chip multi-selects
//   • Dashboard list (pages/dashboard/posts/index.vue) — filter chips
//   • Public API (server/api/public/posts.get.ts) — validates query params
//   • Public pages (homepages, program pages) — strongly-typed placement
//     identifiers so the compiler catches typos before runtime
//
// The DB just stores the slug strings; this file is what makes them safe.
// Adding/removing/renaming a slug here cascades through the whole app.

export type LocalizedLabel = { en: string, ar: string }

export type TaxonomyEntry<TId extends string = string> = {
  id: TId
  label: LocalizedLabel
}

/**
 * Extended metadata for the visual placement picker. Optional fields:
 *   • `icon`  — Lucide icon name shown in the card header
 *   • `accent` — palette colour: autism|down|ld|cta (drives the top-border tint)
 *   • `page`  — short description of which page the placement lands on
 *   • `hint`  — one-line scope description (e.g. "Latest articles section")
 *
 * The `id` + `label` fields still come from the base TaxonomyEntry so
 * legacy `sanitizePlacements` and storage code keep working unchanged.
 */
export type PlacementEntry<TId extends string = string> = TaxonomyEntry<TId> & {
  icon: string
  accent: 'autism' | 'down' | 'ld' | 'cta'
  page: LocalizedLabel
  hint: LocalizedLabel
}

// ── Categories ──────────────────────────────────────────────────────────────
// Subject-matter tags. A post can have multiple. These describe what the
// post is ABOUT, not where it appears.

export const POST_CATEGORIES = [
  { id: 'autism', label: { en: 'Autism Spectrum', ar: 'طيف التوحد' } },
  { id: 'down-syndrome', label: { en: 'Down Syndrome', ar: 'متلازمة داون' } },
  { id: 'learning-difficulties', label: { en: 'Learning Difficulties', ar: 'صعوبات التعلم' } },
  { id: 'family-support', label: { en: 'Family Support', ar: 'دعم الأسرة' } },
  { id: 'assessment', label: { en: 'Assessment', ar: 'التقييم' } },
  { id: 'therapy', label: { en: 'Therapy', ar: 'العلاج' } }
] as const satisfies ReadonlyArray<TaxonomyEntry>

export type PostCategoryId = typeof POST_CATEGORIES[number]['id']

// ── Placements ──────────────────────────────────────────────────────────────
// Where on the site a post should surface. Each placement maps to exactly
// one logical slot — adding more placements is the path forward to give
// admins finer control.

export const POST_PLACEMENTS = [
  {
    id: 'homepage-featured',
    icon: 'i-lucide-home',
    accent: 'autism',
    label: { en: 'Homepage — Latest articles', ar: 'الصفحة الرئيسية — أحدث المقالات' },
    page: { en: 'Homepage', ar: 'الصفحة الرئيسية' },
    hint: { en: '“Latest articles” section near the bottom', ar: 'قسم «أحدث المقالات» في الأسفل' }
  },
  {
    id: 'autism-program-related',
    icon: 'i-lucide-puzzle',
    accent: 'autism',
    label: { en: 'Autism program — Related articles', ar: 'برنامج التوحد — مقالات ذات صلة' },
    page: { en: '/programs/autism', ar: '/ar/programs/autism' },
    hint: { en: 'Related articles row on the autism program page', ar: 'صف المقالات ذات الصلة في صفحة برنامج التوحد' }
  },
  {
    id: 'down-syndrome-program-related',
    icon: 'i-lucide-heart-handshake',
    accent: 'down',
    label: { en: 'Down Syndrome program — Related', ar: 'برنامج متلازمة داون — مقالات ذات صلة' },
    page: { en: '/programs/down-syndrome', ar: '/ar/programs/down-syndrome' },
    hint: { en: 'Related articles row on the Down Syndrome page', ar: 'صف المقالات ذات الصلة في صفحة متلازمة داون' }
  },
  {
    id: 'learning-difficulties-program-related',
    icon: 'i-lucide-book-open-check',
    accent: 'ld',
    label: { en: 'LD program — Related articles', ar: 'برنامج صعوبات التعلم — مقالات ذات صلة' },
    page: { en: '/programs/learning-difficulties', ar: '/ar/programs/learning-difficulties' },
    hint: { en: 'Related articles row on the LD program page', ar: 'صف المقالات ذات الصلة في صفحة صعوبات التعلم' }
  },
  {
    id: 'blog-pinned',
    icon: 'i-lucide-pin',
    accent: 'cta',
    label: { en: 'Blog index — Pinned at top', ar: 'المرجع العلمي — مثبّت في الأعلى' },
    page: { en: '/blog', ar: '/ar/blog' },
    hint: { en: 'Pinned at the top of the Scientific Reference list', ar: 'مثبّت أعلى قائمة المرجع العلمي' }
  }
] as const satisfies ReadonlyArray<PlacementEntry>

export type PostPlacementId = typeof POST_PLACEMENTS[number]['id']

// ── Validation helpers ──────────────────────────────────────────────────────
// Used on the server (POST/PATCH endpoints) to drop unknown slugs the
// dashboard never sent — defends against future taxonomy renames or
// hand-edited DB rows.

const CATEGORY_IDS: ReadonlySet<string> = new Set(POST_CATEGORIES.map(c => c.id))
const PLACEMENT_IDS: ReadonlySet<string> = new Set(POST_PLACEMENTS.map(p => p.id))

export const isPostCategory = (id: string): id is PostCategoryId => CATEGORY_IDS.has(id)
export const isPostPlacement = (id: string): id is PostPlacementId => PLACEMENT_IDS.has(id)

/** Filter an incoming list, returning only valid + de-duplicated slugs. */
export const sanitizeCategories = (raw: unknown): PostCategoryId[] => {
  if (!Array.isArray(raw)) return []
  const out = new Set<PostCategoryId>()
  for (const v of raw) {
    if (typeof v === 'string' && isPostCategory(v)) out.add(v)
  }
  return Array.from(out)
}

export const sanitizePlacements = (raw: unknown): PostPlacementId[] => {
  if (!Array.isArray(raw)) return []
  const out = new Set<PostPlacementId>()
  for (const v of raw) {
    if (typeof v === 'string' && isPostPlacement(v)) out.add(v)
  }
  return Array.from(out)
}

// ── Lookup helpers ──────────────────────────────────────────────────────────

export const labelForCategory = (id: string, locale: 'en' | 'ar' = 'en'): string => {
  const found = POST_CATEGORIES.find(c => c.id === id)
  return found ? found.label[locale] : id
}

export const labelForPlacement = (id: string, locale: 'en' | 'ar' = 'en'): string => {
  const found = POST_PLACEMENTS.find(p => p.id === id)
  return found ? found.label[locale] : id
}

// Composable wrapper — kept for symmetry with other useMaan* composables
// and to give templates a reactive entry point if we ever localise the
// labels at runtime instead of at use-site.
export const useMaanTaxonomy = () => ({
  categories: POST_CATEGORIES,
  placements: POST_PLACEMENTS,
  isPostCategory,
  isPostPlacement,
  sanitizeCategories,
  sanitizePlacements,
  labelForCategory,
  labelForPlacement
})
