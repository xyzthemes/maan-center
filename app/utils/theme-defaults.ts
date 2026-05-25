// Canonical Maan theme tokens. The defaults below mirror the compiled
// `:root { --maan-* }` + `.dark { --maan-* }` blocks in
// `app/assets/css/main.css`. They serve three roles:
//   1. seed values when the admin opens the theme editor for the first
//      time (no `theme` SiteSetting row yet);
//   2. per-token "reset" target in the editor;
//   3. fallback the runtime plugin uses if the API call ever fails.
//
// Keep these in sync with main.css. The runtime plugin only emits
// overrides for the keys listed here, so a typo silently falls back to
// the compiled value rather than corrupting an unrelated property.

import type { ThemeColorMap, ThemeTokenKey, ThemeValue } from '~~/server/utils/site-settings'

export type { ThemeColorMap, ThemeTokenKey, ThemeValue }

/** Tokens that may be stored as rgba (alpha-aware editor). */
export const THEME_ALPHA_TOKENS: ReadonlySet<ThemeTokenKey> = new Set([
  'line', 'autismSoft', 'downSoft', 'ldSoft'
])

/** Each token → its `--maan-*` CSS custom property name. */
export const THEME_TOKEN_CSS_VAR: Record<ThemeTokenKey, string> = {
  surface: '--maan-surface',
  surfaceAlt: '--maan-surface-alt',
  ink: '--maan-ink',
  inkMuted: '--maan-ink-muted',
  line: '--maan-line',
  cta: '--maan-cta',
  ctaHover: '--maan-cta-hover',
  autism: '--maan-autism',
  autismSoft: '--maan-autism-soft',
  down: '--maan-down',
  downSoft: '--maan-down-soft',
  ld: '--maan-ld',
  ldSoft: '--maan-ld-soft'
}

export const THEME_TOKEN_KEYS = Object.keys(THEME_TOKEN_CSS_VAR) as ThemeTokenKey[]

/** Editor grouping — controls section order + headers in MaanThemeEditor. */
export type ThemeTokenGroup = {
  id: 'surface' | 'text' | 'lines' | 'cta' | 'autism' | 'down' | 'ld'
  tokens: ThemeTokenKey[]
}

export const THEME_TOKEN_GROUPS: ThemeTokenGroup[] = [
  { id: 'surface', tokens: ['surface', 'surfaceAlt'] },
  { id: 'text', tokens: ['ink', 'inkMuted'] },
  { id: 'lines', tokens: ['line'] },
  { id: 'cta', tokens: ['cta', 'ctaHover'] },
  { id: 'autism', tokens: ['autism', 'autismSoft'] },
  { id: 'down', tokens: ['down', 'downSoft'] },
  { id: 'ld', tokens: ['ld', 'ldSoft'] }
]

/** Light-mode defaults — matches `:root` in main.css. */
export const LIGHT_DEFAULTS: ThemeColorMap = {
  surface: '#FAF8F4',
  surfaceAlt: '#FFFFFF',
  ink: '#0F2741',
  inkMuted: '#466079',
  line: 'rgba(34, 80, 124, 0.14)',
  cta: '#E94B35',
  ctaHover: '#C8351F',
  autism: '#3D8AC5',
  autismSoft: '#E0EFFA',
  down: '#2BA365',
  downSoft: '#D6F3E2',
  ld: '#7C61DC',
  ldSoft: '#E8E2FC'
}

/** Dark-mode defaults — matches `.dark` overrides in main.css. */
export const DARK_DEFAULTS: ThemeColorMap = {
  surface: '#0B1623',
  surfaceAlt: '#11243A',
  ink: '#E5EEF8',
  inkMuted: '#B8CADC',
  line: 'rgba(94, 134, 175, 0.18)',
  cta: '#FF8B73',
  ctaHover: '#FFB7A5',
  autism: '#8EC4E8',
  autismSoft: 'rgba(61, 138, 197, 0.20)',
  down: '#74D19E',
  downSoft: 'rgba(43, 163, 101, 0.20)',
  ld: '#B3A0F2',
  ldSoft: 'rgba(124, 97, 220, 0.22)'
}

export const THEME_DEFAULTS: ThemeValue = {
  light: LIGHT_DEFAULTS,
  dark: DARK_DEFAULTS
}

export const cloneThemeDefaults = (): ThemeValue => ({
  light: { ...LIGHT_DEFAULTS },
  dark: { ...DARK_DEFAULTS }
})
