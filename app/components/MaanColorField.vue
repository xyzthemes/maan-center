<script setup lang="ts">
// Single color picker for one --maan-* token. Wraps a native
// <input type="color"> (hex only) and adds an optional alpha slider
// for tokens that may be stored as rgba.
//
// Why native <input type="color">: zero new dependency, OS-themed
// picker, keyboard-accessible. Alpha-as-slider only renders when the
// token allows transparency (line + the four *-soft variants).

import { parseColor, rgbaToHex, serializeColor } from '~/utils/color'

const props = defineProps<{
  modelValue: string
  defaultValue: string
  label: string
  allowAlpha?: boolean
  resetLabel?: string
  alphaLabel?: string
  hasError?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const parsed = computed(() => parseColor(props.modelValue))

const hex = computed<string>(() => {
  const p = parsed.value
  return p ? rgbaToHex(p) : '#000000'
})

const alpha = computed<number>(() => {
  const p = parsed.value
  return p ? p.a : 1
})

const onHexInput = (e: Event) => {
  const newHex = (e.target as HTMLInputElement).value
  const parsedHex = parseColor(newHex)
  if (!parsedHex) return
  const a = props.allowAlpha ? alpha.value : 1
  emit('update:modelValue', serializeColor({ ...parsedHex, a }))
}

const onAlphaInput = (e: Event) => {
  const next = Number((e.target as HTMLInputElement).value) / 100
  const p = parsed.value
  if (!p) return
  emit('update:modelValue', serializeColor({ ...p, a: next }))
}

const onReset = () => {
  emit('update:modelValue', props.defaultValue)
}

const isAtDefault = computed(() => props.modelValue === props.defaultValue)
</script>

<template>
  <div
    class="rounded-lg border p-3 transition-colors"
    :style="{
      borderColor: hasError ? 'var(--color-red-500)' : 'var(--maan-line)',
      background: 'var(--maan-surface-alt)'
    }"
  >
    <div class="flex items-center justify-between gap-3">
      <label
        class="text-sm font-medium"
        :style="{ color: 'var(--maan-ink)' }"
      >
        {{ label }}
      </label>
      <UButton
        v-if="!isAtDefault"
        icon="i-lucide-rotate-ccw"
        size="xs"
        color="neutral"
        variant="ghost"
        :aria-label="resetLabel || 'Reset'"
        :title="resetLabel || 'Reset'"
        @click="onReset"
      />
    </div>

    <div class="mt-2 flex items-center gap-3">
      <input
        type="color"
        :value="hex"
        class="h-9 w-12 cursor-pointer rounded-md border bg-transparent"
        :style="{ borderColor: 'var(--maan-line)' }"
        @input="onHexInput"
      >
      <code
        class="font-mono text-xs"
        :style="{ color: 'var(--maan-ink-muted)' }"
      >
        {{ modelValue }}
      </code>
    </div>

    <div
      v-if="allowAlpha"
      class="mt-3"
    >
      <div class="mb-1 flex items-center justify-between">
        <span
          class="text-xs"
          :style="{ color: 'var(--maan-ink-muted)' }"
        >
          {{ alphaLabel || 'Opacity' }}
        </span>
        <span
          class="font-mono text-xs"
          :style="{ color: 'var(--maan-ink-muted)' }"
        >
          {{ Math.round(alpha * 100) }}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        :value="Math.round(alpha * 100)"
        class="w-full"
        @input="onAlphaInput"
      >
    </div>
  </div>
</template>
