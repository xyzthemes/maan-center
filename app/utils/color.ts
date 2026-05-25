// Tiny color utilities used by the theme editor:
//   - parseColor: returns rgba parts from #RRGGBB or rgb()/rgba()
//   - serializeColor: emits hex when fully opaque, rgba() otherwise
//   - contrastRatio: WCAG 2.1 relative luminance ratio
//
// No third-party dep. The native color input only accepts #rrggbb, so
// the field component round-trips through these helpers to preserve
// alpha for the five rgba-allowed tokens.

const HEX_RE = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
const RGBA_RE = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0|1|0?\.\d+)\s*)?\)$/

export type RGBA = { r: number, g: number, b: number, a: number }

export const parseColor = (input: string): RGBA | null => {
  const v = input.trim()
  const hex = HEX_RE.exec(v)
  if (hex) {
    return {
      r: parseInt(hex[1]!, 16),
      g: parseInt(hex[2]!, 16),
      b: parseInt(hex[3]!, 16),
      a: 1
    }
  }
  const rgba = RGBA_RE.exec(v)
  if (rgba) {
    const r = Number(rgba[1])
    const g = Number(rgba[2])
    const b = Number(rgba[3])
    const a = rgba[4] === undefined ? 1 : Number(rgba[4])
    if ([r, g, b].some(n => n < 0 || n > 255)) return null
    return { r, g, b, a }
  }
  return null
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
const toHex2 = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')

export const rgbaToHex = (c: Pick<RGBA, 'r' | 'g' | 'b'>): string =>
  `#${toHex2(c.r)}${toHex2(c.g)}${toHex2(c.b)}`

export const serializeColor = (c: RGBA): string => {
  if (c.a >= 1) return rgbaToHex(c)
  const a = Math.round(c.a * 100) / 100
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${a})`
}

const channelLum = (v: number) => {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

const relativeLuminance = (c: RGBA): number =>
  0.2126 * channelLum(c.r) + 0.7152 * channelLum(c.g) + 0.0722 * channelLum(c.b)

export const contrastRatio = (fg: string, bg: string): number => {
  const f = parseColor(fg)
  const b = parseColor(bg)
  if (!f || !b) return 0
  const l1 = relativeLuminance(f)
  const l2 = relativeLuminance(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

const COLOR_PATTERN = /^(#[0-9a-fA-F]{6}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+))?\s*\))$/
export const isValidCssColor = (input: string): boolean => COLOR_PATTERN.test(input.trim())
