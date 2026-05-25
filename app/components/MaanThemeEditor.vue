<script setup lang="ts">
// Theme editor — Layer-3 admin UI for the `theme` SiteSetting.
//
// One v-model two-sided payload ({ light, dark }). Tabs switch which
// side is being edited; the live preview pane mirrors the active side
// by toggling a scoped `.dark` class on a wrapper div whose CSS custom
// properties are driven by the in-progress form values.
//
// We DO NOT touch `colorMode.preference` from inside this editor — that
// would force the whole dashboard into the previewed mode. The preview
// is scoped to one wrapper element instead.

import { contrastRatio, isValidCssColor } from '~/utils/color'
import {
  THEME_ALPHA_TOKENS,
  THEME_TOKEN_CSS_VAR,
  THEME_TOKEN_GROUPS,
  type ThemeColorMap,
  type ThemeTokenGroup,
  type ThemeTokenKey,
  type ThemeValue
} from '~/utils/theme-defaults'

const props = defineProps<{
  modelValue: ThemeValue
  defaults: ThemeValue
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ThemeValue]
}>()

const { t, isArabic } = useDashboardI18n()

type Side = 'light' | 'dark'
const activeSide = ref<Side>('light')

const tabs = computed(() => [
  { label: t.value.themeLight, value: 'light' as const, icon: 'i-lucide-sun' },
  { label: t.value.themeDark, value: 'dark' as const, icon: 'i-lucide-moon' }
])

const tokenLabel = (token: ThemeTokenKey): string => {
  const key = ('themeToken' + token.charAt(0).toUpperCase() + token.slice(1)) as keyof typeof t.value
  return (t.value[key] as string | undefined) || token
}

const groupLabel = (group: ThemeTokenGroup): string => {
  const key = ('theme' + group.id.charAt(0).toUpperCase() + group.id.slice(1) + 'Group') as keyof typeof t.value
  return (t.value[key] as string | undefined) || group.id
}

const currentMap = computed<ThemeColorMap>(() => props.modelValue[activeSide.value])

const setToken = (token: ThemeTokenKey, value: string) => {
  const next: ThemeValue = {
    light: { ...props.modelValue.light },
    dark: { ...props.modelValue.dark }
  }
  next[activeSide.value][token] = value
  emit('update:modelValue', next)
}

const resetAll = () => {
  const next: ThemeValue = {
    light: { ...props.modelValue.light },
    dark: { ...props.modelValue.dark }
  }
  next[activeSide.value] = { ...props.defaults[activeSide.value] }
  emit('update:modelValue', next)
}

// ── Live preview ─────────────────────────────────────────────────────────
//
// Build a CSS-custom-properties object directly from the in-progress
// values. Vue applies these as inline style on the wrapper, so every
// .maan-* utility inside the wrapper picks them up automatically.
// Toggling the `.dark` class on the wrapper does NOT affect the rest
// of the dashboard — it's scoped to this subtree.

const previewStyles = computed<Record<string, string>>(() => {
  const styles: Record<string, string> = {}
  const map = currentMap.value
  for (const token of Object.keys(THEME_TOKEN_CSS_VAR) as ThemeTokenKey[]) {
    styles[THEME_TOKEN_CSS_VAR[token]] = map[token]
  }
  return styles
})

// ── Contrast warning (does not block save) ───────────────────────────────

const inkSurfaceRatio = computed(() =>
  contrastRatio(currentMap.value.ink, currentMap.value.surface)
)
const ctaSurfaceRatio = computed(() =>
  contrastRatio(currentMap.value.cta, currentMap.value.surface)
)
const hasContrastWarning = computed(() =>
  inkSurfaceRatio.value > 0
  && (inkSurfaceRatio.value < 4.5 || ctaSurfaceRatio.value < 3)
)

const invalidTokens = computed<Set<ThemeTokenKey>>(() => {
  const bad = new Set<ThemeTokenKey>()
  for (const key of Object.keys(THEME_TOKEN_CSS_VAR) as ThemeTokenKey[]) {
    if (!isValidCssColor(currentMap.value[key])) bad.add(key)
  }
  return bad
})

const hasInvalid = computed(() => invalidTokens.value.size > 0)

defineExpose({ hasInvalid })
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[1fr_22rem]">
    <div>
      <p
        class="mb-4 text-sm"
        :style="{ color: 'var(--maan-ink-muted)' }"
      >
        {{ t.themeIntro }}
        <span class="block mt-1 text-xs">{{ t.themeNuxtUiNote }}</span>
      </p>

      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div
          class="inline-flex rounded-xl border p-1"
          :style="{ borderColor: 'var(--maan-line)', background: 'var(--maan-surface-alt)' }"
          role="tablist"
        >
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            role="tab"
            :aria-selected="activeSide === tab.value"
            class="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            :style="activeSide === tab.value
              ? { background: 'var(--maan-autism-soft)', color: 'var(--maan-autism)' }
              : { color: 'var(--maan-ink-muted)' }"
            @click="activeSide = tab.value"
          >
            <UIcon
              :name="tab.icon"
              class="size-4"
            />
            {{ tab.label }}
          </button>
        </div>

        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-rotate-ccw"
          @click="resetAll"
        >
          {{ t.themeResetAll }}
        </UButton>
      </div>

      <UAlert
        v-if="hasContrastWarning"
        color="warning"
        variant="soft"
        icon="i-lucide-triangle-alert"
        :title="t.themeContrastWarning"
        class="mb-4"
      />

      <div class="grid gap-4">
        <section
          v-for="group in THEME_TOKEN_GROUPS"
          :key="group.id"
          class="rounded-2xl border p-4"
          :style="{ borderColor: 'var(--maan-line)', background: 'var(--maan-surface-alt)' }"
        >
          <h4
            class="mb-3 text-sm font-bold uppercase tracking-wider"
            :style="{ color: 'var(--maan-ink)' }"
          >
            {{ groupLabel(group) }}
          </h4>
          <div class="grid gap-3 sm:grid-cols-2">
            <MaanColorField
              v-for="token in group.tokens"
              :key="token"
              :label="tokenLabel(token)"
              :model-value="currentMap[token]"
              :default-value="defaults[activeSide][token]"
              :allow-alpha="THEME_ALPHA_TOKENS.has(token)"
              :reset-label="t.themeResetToken"
              :alpha-label="t.themeAlphaLabel"
              :has-error="invalidTokens.has(token)"
              @update:model-value="(v) => setToken(token, v)"
            />
          </div>
        </section>
      </div>
    </div>

    <!-- ── Live preview ─────────────────────────────────────────────────── -->
    <aside
      class="xl:sticky xl:top-4 xl:self-start"
      :aria-label="t.themePreview"
    >
      <div
        class="rounded-2xl border p-4"
        :style="{ borderColor: 'var(--maan-line)', background: 'var(--maan-surface-alt)' }"
      >
        <header class="mb-3 flex items-center gap-2">
          <UIcon
            name="i-lucide-eye"
            class="size-4"
            :style="{ color: 'var(--maan-autism)' }"
          />
          <span
            class="text-sm font-semibold"
            :style="{ color: 'var(--maan-ink)' }"
          >
            {{ t.themePreview }}
          </span>
        </header>

        <!--
          Scoped preview surface. The :style block sets all --maan-*
          custom properties on this wrapper; child elements using
          var(--maan-*) inherit them. Adding the `dark` class here
          (only when previewing dark mode) lets CSS rules under
          `.dark` match WITHOUT touching <html>.
        -->
        <div
          :class="['rounded-xl p-4 transition-colors', activeSide === 'dark' ? 'dark' : '']"
          :style="{ ...previewStyles, background: 'var(--maan-surface)' }"
          :dir="isArabic ? 'rtl' : 'ltr'"
        >
          <div
            class="mb-3 inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase"
            :style="{ background: 'var(--maan-autism-soft)', color: 'var(--maan-autism)' }"
          >
            {{ t.themePreviewAutism }}
          </div>
          <h5
            class="text-lg font-bold"
            :style="{ color: 'var(--maan-ink)' }"
          >
            {{ t.themePreviewSampleHeading }}
          </h5>
          <p
            class="mt-1 text-sm"
            :style="{ color: 'var(--maan-ink-muted)' }"
          >
            {{ t.themePreviewSampleBody }}
          </p>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
              :style="{ background: 'var(--maan-cta)' }"
            >
              {{ t.themePreviewSampleCta }}
            </button>
            <span
              class="rounded-full px-2.5 py-0.5 text-xs font-bold"
              :style="{ background: 'var(--maan-down-soft)', color: 'var(--maan-down)' }"
            >
              {{ t.themePreviewDown }}
            </span>
            <span
              class="rounded-full px-2.5 py-0.5 text-xs font-bold"
              :style="{ background: 'var(--maan-ld-soft)', color: 'var(--maan-ld)' }"
            >
              {{ t.themePreviewLd }}
            </span>
          </div>

          <hr
            class="my-4"
            :style="{ borderColor: 'var(--maan-line)' }"
          >

          <div
            class="rounded-xl border p-3 text-xs"
            :style="{ borderColor: 'var(--maan-line)', background: 'var(--maan-surface-alt)', color: 'var(--maan-ink-muted)' }"
          >
            <code class="font-mono">{{ activeSide }}</code> ·
            ink/surface
            <code class="font-mono">{{ inkSurfaceRatio.toFixed(2) }}:1</code> ·
            cta/surface
            <code class="font-mono">{{ ctaSurfaceRatio.toFixed(2) }}:1</code>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
