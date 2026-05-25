<script setup lang="ts">
import type { DashboardBlock } from '~/composables/useDashboardBlocks'

definePageMeta({
  alias: ['/ar/dashboard/blocks'],
  layout: 'dashboard'
})

const { t, isArabic } = useDashboardI18n()
const { blocks, blocksError, loadBlocks } = useDashboardBlocks()
const { statusOptions, statusLabel } = useBlockForm()
const { placements: taxonomyPlacements, labelForPlacement } = useMaanTaxonomy()

const blocksSearch = ref('')
const blocksStatusFilter = ref<'all' | 'draft' | 'in_review' | 'published'>('all')
const blocksTypeFilter = ref<string>('all')
const blocksLocaleFilter = ref<string>('all')
const blocksPlacementFilter = ref<string>('all')

const lang = computed<'en' | 'ar'>(() => isArabic.value ? 'ar' : 'en')

const typeFilterOptions = computed(() => [
  { value: 'all', label: t.value.filterAll },
  { value: 'testimonial', label: t.value.typeTestimonial },
  { value: 'faq_item', label: t.value.typeFaqItem },
  { value: 'stat_tile', label: t.value.typeStatTile },
  { value: 'team_member', label: t.value.typeTeamMember },
  { value: 'service_card', label: t.value.typeServiceCard }
])

const localeFilterOptions = computed(() => [
  { value: 'all', label: t.value.blockLocaleAny },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
  { value: '*', label: '★' }
])

const placementFilterOptions = computed(() => [
  { value: 'all', label: t.value.filterPlacement },
  ...taxonomyPlacements.map(p => ({ value: p.id, label: p.label[lang.value] }))
])

const filteredBlocks = computed(() => {
  const q = blocksSearch.value.trim().toLowerCase()
  return blocks.value.filter((b) => {
    if (blocksStatusFilter.value !== 'all' && (b.status || 'draft') !== blocksStatusFilter.value) return false
    if (blocksTypeFilter.value !== 'all' && b.type !== blocksTypeFilter.value) return false
    if (blocksLocaleFilter.value !== 'all' && b.locale !== blocksLocaleFilter.value) return false
    if (blocksPlacementFilter.value !== 'all' && !(b.placements || []).includes(blocksPlacementFilter.value)) return false

    if (!q) return true
    // Search across the payload's stringy fields without knowing the shape.
    const payloadString = b.payload ? JSON.stringify(b.payload).toLowerCase() : ''
    return payloadString.includes(q)
  })
})

const editHref = (block: DashboardBlock) => isArabic.value
  ? `/ar/dashboard/blocks/${block.id}`
  : `/dashboard/blocks/${block.id}`

const newHref = computed(() => isArabic.value ? '/ar/dashboard/blocks/new' : '/dashboard/blocks/new')

// Type-friendly label for the chip on each row.
const typeLabel = (type: string) => {
  switch (type) {
    case 'testimonial': return t.value.typeTestimonial
    case 'faq_item': return t.value.typeFaqItem
    case 'stat_tile': return t.value.typeStatTile
    case 'team_member': return t.value.typeTeamMember
    case 'service_card': return t.value.typeServiceCard
    default: return type
  }
}

// One-line preview from the payload so the card list is scannable.
const preview = (block: DashboardBlock): string => {
  const p = (block.payload as Record<string, unknown>) || {}
  switch (block.type) {
    case 'testimonial': return String(p.quote || '')
    case 'faq_item': return String(p.q || '')
    case 'stat_tile': return `${String(p.value || '')} — ${String(p.label || '')}`
    case 'team_member': return `${String(p.name || '')} — ${String(p.role || '')}`
    case 'service_card': return String(p.title || '')
    default: return ''
  }
}

onMounted(loadBlocks)
</script>

<template>
  <UDashboardPanel id="blocks-list">
    <template #header>
      <UDashboardNavbar
        :title="t.contentBlocks"
        icon="i-lucide-blocks"
      >
        <template #right>
          <UBadge
            color="neutral"
            variant="subtle"
            class="hidden sm:inline-flex"
          >
            {{ t.blocksCount(filteredBlocks.length, blocks.length) }}
          </UBadge>
          <UButton
            icon="i-lucide-plus"
            size="sm"
            :to="newHref"
          >
            {{ t.newBlock }}
          </UButton>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="blocksSearch"
            :placeholder="t.searchBlocks"
            icon="i-lucide-search"
            size="sm"
            class="w-full max-w-xs"
          />
          <USelect
            v-model="blocksTypeFilter"
            :items="typeFilterOptions"
            value-key="value"
            size="sm"
            class="hidden sm:block w-44"
          />
          <USelect
            v-model="blocksLocaleFilter"
            :items="localeFilterOptions"
            value-key="value"
            size="sm"
            class="hidden md:block w-32"
          />
          <USelect
            v-model="blocksPlacementFilter"
            :items="placementFilterOptions"
            value-key="value"
            size="sm"
            class="hidden lg:block w-56"
          />
        </template>
        <template #right>
          <UFieldGroup>
            <UButton
              v-for="option in statusOptions"
              :key="option.value"
              size="xs"
              :color="blocksStatusFilter === option.value ? 'primary' : 'neutral'"
              :variant="blocksStatusFilter === option.value ? 'solid' : 'outline'"
              @click="blocksStatusFilter = option.value"
            >
              {{ option.label }}
            </UButton>
          </UFieldGroup>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UAlert
        v-if="blocksError"
        color="error"
        variant="soft"
        :title="blocksError"
        :description="t.blocksPermission"
        class="mb-4"
      />

      <p
        v-if="!blocksError && filteredBlocks.length === 0"
        class="text-sm text-muted"
      >
        {{ blocksSearch || blocksTypeFilter !== 'all' || blocksLocaleFilter !== 'all' || blocksPlacementFilter !== 'all'
          ? t.noMatchingFilters
          : t.noBlocksFound }}
      </p>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="block in filteredBlocks"
          :key="block.id"
          :to="editHref(block)"
          class="maan-card block p-5 text-start hover:no-underline"
          :style="block.status === 'published'
            ? 'border-top: 4px solid var(--maan-down);'
            : block.status === 'in_review'
              ? 'border-top: 4px solid var(--maan-autism);'
              : 'border-top: 4px solid var(--maan-cta);'"
        >
          <div class="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span
              class="rounded-full px-2 py-0.5"
              :style="block.status === 'published'
                ? 'background: color-mix(in srgb, var(--maan-down) 16%, transparent); color: var(--maan-down);'
                : block.status === 'in_review'
                  ? 'background: color-mix(in srgb, var(--maan-autism) 16%, transparent); color: var(--maan-autism);'
                  : 'background: color-mix(in srgb, var(--maan-cta) 16%, transparent); color: var(--maan-cta);'"
            >
              {{ statusLabel(block.status) }}
            </span>
            <span
              class="rounded-full px-2 py-0.5"
              style="background: color-mix(in srgb, var(--maan-ld) 14%, transparent); color: var(--maan-ld);"
            >
              {{ typeLabel(block.type) }}
            </span>
            <span
              class="rounded-full px-2 py-0.5 normal-case tracking-normal"
              style="background: color-mix(in srgb, var(--maan-autism) 12%, transparent); color: var(--maan-autism);"
            >
              {{ block.locale === '*' ? '★' : block.locale }}
            </span>
          </div>
          <p
            class="mt-3 text-sm line-clamp-2"
            style="color: var(--maan-ink);"
          >
            {{ preview(block) }}
          </p>
          <div
            v-if="block.placements?.length"
            class="mt-3 flex flex-wrap gap-1.5 text-[11px]"
            style="color: var(--maan-ink-muted);"
          >
            <span
              v-for="p in block.placements"
              :key="p"
              class="rounded-md border px-1.5 py-0.5"
              style="border-color: var(--maan-line);"
            >
              {{ labelForPlacement(p, lang) }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </template>
  </UDashboardPanel>
</template>
