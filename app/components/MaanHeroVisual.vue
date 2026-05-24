<script setup lang="ts">
// Production hero visual — a calm composition that signals all three program
// areas (autism / Down syndrome / learning difficulties) without using stock
// imagery. Built with pure SVG + token-driven colors so it adapts to dark
// mode automatically.
const props = defineProps<{
  locale?: 'en' | 'ar'
}>()

const captions = computed(() => props.locale === 'ar'
  ? {
      plan: 'خطة فردية لكل طفل',
      sensory: 'بيئة هادئة وحسياً مريحة',
      family: 'مرافقة الأسرة'
    }
  : {
      plan: 'Individualized plan',
      sensory: 'Calm, sensory-friendly',
      family: 'Family alongside'
    })
</script>

<template>
  <div class="maan-hero-visual relative isolate">
    <!-- Layered ambient orbs — they replace the previous flat gradient with
         depth + program-area color encoding. -->
    <div
      class="absolute -top-12 -start-12 size-72 rounded-full blur-3xl opacity-60"
      style="background: radial-gradient(circle, var(--maan-autism-soft), transparent 70%);"
      aria-hidden="true"
    />
    <div
      class="absolute -top-8 -end-10 size-64 rounded-full blur-3xl opacity-55"
      style="background: radial-gradient(circle, var(--maan-down-soft), transparent 70%);"
      aria-hidden="true"
    />
    <div
      class="absolute -bottom-12 start-1/3 size-72 rounded-full blur-3xl opacity-45"
      style="background: radial-gradient(circle, var(--maan-ld-soft), transparent 70%);"
      aria-hidden="true"
    />

    <!-- Soft dot pattern (token-aware via main.css) -->
    <div
      class="absolute inset-0 opacity-50"
      aria-hidden="true"
    />

    <!-- Center stage: logo + ring -->
    <div class="relative z-10 grid h-full place-items-center px-6 py-10">
      <div class="relative">
        <!-- Decorative ring -->
        <svg
          class="absolute inset-0 -m-6 size-[19rem] sm:size-[22rem]"
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="47"
            stroke="var(--maan-autism)"
            stroke-width="0.4"
            stroke-dasharray="2 4"
            opacity="0.5"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="var(--maan-down)"
            stroke-width="0.3"
            stroke-dasharray="1 3"
            opacity="0.45"
          />
        </svg>

        <!-- Logo card -->
        <div
          class="relative grid size-48 place-items-center rounded-3xl shadow-xl sm:size-56"
          style="background: var(--maan-surface-alt); border: 1px solid var(--maan-line);"
        >
          <img
            src="/logo-transparent.png"
            alt=""
            class="size-32 object-contain sm:size-40"
            aria-hidden="true"
            decoding="async"
          >
        </div>
      </div>
    </div>

    <!-- Floating caption chips, color-coded by program -->
    <div
      class="absolute top-6 inset-s-6 max-w-[14rem] rounded-2xl px-4 py-2.5 text-xs font-semibold shadow-lg backdrop-blur z-20"
      style="background: color-mix(in srgb, var(--maan-surface-alt) 92%, transparent); color: var(--maan-autism); border: 1px solid var(--maan-line);"
    >
      <span class="flex items-center gap-2">
        <span
          class="size-2 rounded-full"
          style="background: var(--maan-autism);"
          aria-hidden="true"
        />
        {{ captions.plan }}
      </span>
    </div>

    <div
      class="absolute bottom-6 inset-e-6 max-w-[14rem] rounded-2xl px-4 py-2.5 text-xs font-semibold shadow-lg backdrop-blur z-20"
      style="background: color-mix(in srgb, var(--maan-surface-alt) 92%, transparent); color: var(--maan-down); border: 1px solid var(--maan-line);"
    >
      <span class="flex items-center gap-2">
        <span
          class="size-2 rounded-full"
          style="background: var(--maan-down);"
          aria-hidden="true"
        />
        {{ captions.sensory }}
      </span>
    </div>

    <div
      class="absolute top-1/2 inset-e-4 -translate-y-1/2 rounded-2xl px-3.5 py-2 text-xs font-semibold shadow-lg backdrop-blur z-20"
      style="background: color-mix(in srgb, var(--maan-surface-alt) 92%, transparent); color: var(--maan-ld); border: 1px solid var(--maan-line);"
    >
      <span class="flex items-center gap-2">
        <span
          class="size-2 rounded-full"
          style="background: var(--maan-ld);"
          aria-hidden="true"
        />
        {{ captions.family }}
      </span>
    </div>
  </div>
</template>
