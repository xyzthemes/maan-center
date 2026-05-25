// Builds the CSS that overrides the compiled `--maan-*` defaults at
// runtime. Called by `app/plugins/theme.ts` (SSR + client) and by
// MaanThemeEditor for the live preview (scoped to a wrapper element).

import type { ThemeColorMap, ThemeValue } from './theme-defaults'
import { THEME_TOKEN_CSS_VAR, THEME_TOKEN_KEYS } from './theme-defaults'

const declarations = (map: ThemeColorMap): string =>
  THEME_TOKEN_KEYS
    .map(key => `${THEME_TOKEN_CSS_VAR[key]}: ${map[key]};`)
    .join(' ')

/**
 * Build a global stylesheet for the `<head>`. Light tokens go on `:root`,
 * dark tokens on `.dark` — matching how main.css scopes them so the
 * existing color-mode `<html class="dark">` switch keeps working.
 */
export const buildThemeCss = (theme: ThemeValue): string =>
  `:root { ${declarations(theme.light)} } .dark { ${declarations(theme.dark)} }`

/**
 * Build a scoped stylesheet for a preview element. Both light + dark
 * blocks live under the selector so toggling a `.dark` class on a child
 * shows either side without affecting the rest of the page.
 */
export const buildPreviewCss = (selector: string, theme: ThemeValue): string =>
  `${selector} { ${declarations(theme.light)} } ${selector}.dark { ${declarations(theme.dark)} }`
