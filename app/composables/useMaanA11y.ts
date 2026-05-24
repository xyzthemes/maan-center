// Phase 7 — Accessibility preferences (persistent across pages + visits).
//
// Three independent toggles, each driving a class on <html>:
//   - font scale: 100% / 115% / 130%   → .maan-text-md / .maan-text-lg
//   - monochrome / low-distraction     → .maan-monochrome
//   - dyslexia-friendly font           → .maan-dyslexia
//
// State is stored in localStorage under one key (JSON), then applied on
// mount. SSR-safe via `useState`.

export type A11yState = {
  scale: 'base' | 'lg' | 'xl'
  monochrome: boolean
  dyslexia: boolean
}

const DEFAULT_STATE: A11yState = {
  scale: 'base',
  monochrome: false,
  dyslexia: false
}

const STORAGE_KEY = 'maan-a11y'

const applyToHtml = (state: A11yState) => {
  if (!import.meta.client) return
  const html = document.documentElement
  html.classList.toggle('maan-text-lg', state.scale === 'lg')
  html.classList.toggle('maan-text-xl', state.scale === 'xl')
  html.classList.toggle('maan-monochrome', state.monochrome)
  html.classList.toggle('maan-dyslexia', state.dyslexia)
}

export const useMaanA11y = () => {
  const state = useState<A11yState>('maan-a11y', () => ({ ...DEFAULT_STATE }))

  const load = () => {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<A11yState>
      state.value = {
        scale: parsed.scale && ['base', 'lg', 'xl'].includes(parsed.scale) ? parsed.scale : 'base',
        monochrome: Boolean(parsed.monochrome),
        dyslexia: Boolean(parsed.dyslexia)
      }
      applyToHtml(state.value)
    } catch {
      // localStorage unavailable or JSON malformed — fall back to defaults.
    }
  }

  const save = () => {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
    } catch {
      // Storage quota exceeded or disabled — UI still works, just doesn't persist.
    }
    applyToHtml(state.value)
  }

  const cycleScale = () => {
    state.value.scale = state.value.scale === 'base' ? 'lg' : state.value.scale === 'lg' ? 'xl' : 'base'
    save()
  }
  const toggleMonochrome = () => {
    state.value.monochrome = !state.value.monochrome
    save()
  }
  const toggleDyslexia = () => {
    state.value.dyslexia = !state.value.dyslexia
    save()
  }
  const reset = () => {
    state.value = { ...DEFAULT_STATE }
    save()
  }

  return { state, load, save, cycleScale, toggleMonochrome, toggleDyslexia, reset }
}
