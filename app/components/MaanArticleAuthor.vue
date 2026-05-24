<script setup lang="ts">
defineProps<{
  locale?: 'en' | 'ar'
}>()
</script>

<template>
  <aside
    class="maan-card flex items-start gap-4 p-5"
    style="border-inline-start: 4px solid var(--maan-autism); border-top-width: 1px;"
  >
    <div
      class="grid size-14 shrink-0 place-items-center rounded-full"
      style="background: linear-gradient(135deg, var(--maan-autism-soft), var(--maan-down-soft));"
      aria-hidden="true"
    >
      <UIcon
        name="i-lucide-user-round"
        class="size-7"
        style="color: var(--maan-autism);"
      />
    </div>
    <div>
      <p
        class="text-xs font-semibold uppercase tracking-wider"
        style="color: var(--maan-ink-muted);"
      >
        {{ locale === 'ar' ? 'الكاتب' : 'Author' }}
      </p>
      <p
        class="mt-0.5 font-semibold"
        style="color: var(--maan-ink);"
      >
        {{ locale === 'ar' ? 'فريق مركز معاً' : 'Maan Center Team' }}
      </p>
      <p
        class="mt-1 text-sm"
        style="color: var(--maan-ink-muted);"
      >
        <!-- TODO_IMPLEMENTATION_REFERENCES: per-article author attribution -->
        {{ locale === 'ar'
          ? 'مقالات يراجعها أخصائيو التربية الخاصة في المركز.'
          : 'Articles reviewed by the special-education specialists at Maan.' }}
      </p>
    </div>
  </aside>
</template>
