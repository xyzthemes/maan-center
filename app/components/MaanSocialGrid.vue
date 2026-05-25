<script setup lang="ts">
import type { SocialGroup } from '~/composables/useMaanSocialLinks'

const props = defineProps<{
  groups: SocialGroup[]
  locale?: 'en' | 'ar'
}>()

const lang = computed<'en' | 'ar'>(() => props.locale === 'ar' ? 'ar' : 'en')
</script>

<template>
  <div class="space-y-12">
    <section
      v-for="group in groups"
      :key="group.id"
      class="space-y-5"
    >
      <header>
        <h2
          class="text-xl font-bold"
          style="color: var(--maan-ink);"
        >
          {{ group.title[lang] }}
        </h2>
        <p
          class="mt-1.5 text-sm"
          style="color: var(--maan-ink-muted);"
        >
          {{ group.description[lang] }}
        </p>
      </header>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a
          v-for="link in group.links"
          :key="link.href"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="maan-card group flex items-center gap-3 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style="--tw-ring-color: var(--maan-autism);"
        >
          <span
            class="grid size-10 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-105"
            :style="`background: color-mix(in srgb, ${link.color || 'var(--maan-autism)'} 16%, var(--maan-surface)); color: ${link.color || 'var(--maan-autism)'};`"
          >
            <UIcon
              :name="link.icon"
              class="size-5"
            />
          </span>
          <span class="min-w-0 flex-1">
            <span
              class="block text-sm font-semibold truncate"
              style="color: var(--maan-ink);"
            >
              {{ link.label[lang] }}
            </span>
            <span
              v-if="link.hint"
              class="block text-xs truncate"
              style="color: var(--maan-ink-muted);"
            >
              {{ link.hint[lang] }}
            </span>
          </span>
          <UIcon
            name="i-lucide-arrow-up-right"
            class="size-4 shrink-0 opacity-40 transition group-hover:opacity-100"
            style="color: var(--maan-ink-muted);"
          />
        </a>
      </div>
    </section>
  </div>
</template>
