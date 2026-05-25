<script setup lang="ts">
import { cloneThemeDefaults, THEME_DEFAULTS } from '~/utils/theme-defaults'
import type { ThemeValue } from '~/utils/theme-defaults'

definePageMeta({
  alias: ['/ar/dashboard/settings/:key'],
  layout: 'dashboard'
})

const route = useRoute()
const { t, isArabic } = useDashboardI18n()
const { isLoading, error, load, save } = useDashboardSettings()
const dashToast = useDashboardToast()

const key = computed(() => String(route.params.key))
const backHref = computed(() => isArabic.value ? '/ar/dashboard/settings' : '/dashboard/settings')

const title = computed(() => {
  switch (key.value) {
    case 'working-hours': return t.value.settingWorkingHours
    case 'dr-osama-bio': return t.value.settingDrOsamaBio
    case 'mission-vision': return t.value.settingMissionVision
    case 'contact-info': return t.value.settingContactInfo
    case 'stats': return t.value.settingStats
    case 'theme': return t.value.settingTheme
    default: return key.value
  }
})

// State per locale row. Each row gets its own reactive object so we can
// PUT one locale at a time without sending the others.
type WorkingHoursDay = {
  day: number
  closed: boolean
  opens: string
  closes: string
  secondOpens: string
  secondCloses: string
}
type AnyValue = Record<string, unknown>

const locales = ref<string[]>([])
const values = reactive<Record<string, AnyValue>>({})
const savedFlash = ref<string>('')

// Default empty payload per key — used when no row exists yet.
const blankValue = (k: string): AnyValue => {
  switch (k) {
    case 'working-hours':
      return { days: Array.from({ length: 7 }, (_, i) => ({
        day: i,
        closed: false,
        opens: '08:00',
        closes: '12:00',
        secondOpens: '',
        secondCloses: ''
      })) }
    case 'dr-osama-bio':
      return { name: '', headline: '', bio: '', tags: [] }
    case 'mission-vision':
      return { mission: '', vision: '' }
    case 'contact-info':
      return { phone: '', whatsapp: '', email: '', mapsUrl: '', address: '' }
    case 'stats':
      return { items: [{ value: '', label: '' }] }
    case 'theme':
      return cloneThemeDefaults() as unknown as AnyValue
    default:
      return {}
  }
}

const refresh = async () => {
  const res = await load(key.value)
  if (!res) return
  locales.value = res.locales
  for (const r of res.rows) {
    values[r.locale] = (r.value as AnyValue) ?? blankValue(key.value)
  }
}

const localeLabel = (locale: string) => locale === 'en'
  ? 'English'
  : locale === 'ar'
    ? 'العربية'
    : ''

const onSave = async (locale: string) => {
  savedFlash.value = ''
  const ok = await save(key.value, locale, values[locale])
  if (ok) {
    savedFlash.value = locale
    dashToast.saved(localeLabel(locale))
    setTimeout(() => {
      savedFlash.value = ''
    }, 2500)
  } else {
    dashToast.failed(error.value)
  }
}

// ── Working-hours-specific helpers ────────────────────────────────────────

const DAY_LABEL_KEYS = ['daySunday', 'dayMonday', 'dayTuesday', 'dayWednesday', 'dayThursday', 'dayFriday', 'daySaturday'] as const

// Coerce a possibly-malformed day row into the editor's WorkingHoursDay shape.
const dayRow = (locale: string, idx: number): WorkingHoursDay => {
  const v = values[locale] as { days?: unknown[] } | undefined
  const d = (v?.days?.[idx] ?? {}) as Partial<WorkingHoursDay>
  return {
    day: idx,
    closed: Boolean(d.closed),
    opens: typeof d.opens === 'string' ? d.opens : '',
    closes: typeof d.closes === 'string' ? d.closes : '',
    secondOpens: typeof d.secondOpens === 'string' ? d.secondOpens : '',
    secondCloses: typeof d.secondCloses === 'string' ? d.secondCloses : ''
  }
}

// Mutates the right day in-place so v-model works through the helper.
const setDayField = (locale: string, idx: number, field: keyof WorkingHoursDay, val: string | boolean | number) => {
  const v = values[locale] as { days: WorkingHoursDay[] }
  if (!Array.isArray(v.days)) v.days = []
  // Normalise the row first.
  const current = dayRow(locale, idx)
  ;(current as Record<string, unknown>)[field] = val
  v.days[idx] = current
}

// ── Stats-specific helpers ────────────────────────────────────────────────

const addStat = (locale: string) => {
  const v = values[locale] as { items: Array<{ value: string, label: string }> }
  if (!Array.isArray(v.items)) v.items = []
  v.items.push({ value: '', label: '' })
}
const removeStat = (locale: string, idx: number) => {
  const v = values[locale] as { items: Array<{ value: string, label: string }> }
  v.items.splice(idx, 1)
}

onMounted(refresh)
watch(() => route.params.key, refresh)
</script>

<template>
  <UDashboardPanel id="setting-edit">
    <template #header>
      <UDashboardNavbar :title="title">
        <template #leading>
          <UButton
            :to="backHref"
            :icon="isArabic ? 'i-lucide-arrow-right' : 'i-lucide-arrow-left'"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            :aria-label="t.siteSettings"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :title="error"
        :description="t.settingsPermission"
        class="mb-4"
      />

      <div
        v-if="isLoading && locales.length === 0"
        class="text-sm text-muted"
      >
        {{ t.loading }}
      </div>

      <!--
        Render one editor card per locale the registry expects. For
        locale-agnostic settings (`['*']`) there's a single card.
        Each card has its own save button so editors can save one
        language at a time.
      -->
      <div class="grid gap-6">
        <section
          v-for="locale in locales"
          :key="locale"
          class="maan-card p-6"
        >
          <header class="mb-4 flex items-center justify-between gap-3">
            <h3
              class="text-sm font-bold uppercase tracking-wider"
              style="color: var(--maan-ink);"
            >
              <span v-if="locale === 'en'">English</span>
              <span v-else-if="locale === 'ar'">العربية</span>
              <span v-else>★ {{ t.blockLocaleAny }}</span>
            </h3>
            <UBadge
              v-if="savedFlash === locale"
              color="success"
              variant="subtle"
              size="sm"
            >
              {{ t.settingSaved }}
            </UBadge>
          </header>

          <!-- ───── working-hours editor ───── -->
          <div
            v-if="key === 'working-hours'"
            class="grid gap-3"
          >
            <div
              v-for="(_, idx) in 7"
              :key="idx"
              class="grid items-center gap-3 sm:grid-cols-[6rem_auto_1fr_1fr_1fr_1fr]"
            >
              <span
                class="font-semibold text-sm"
                style="color: var(--maan-ink);"
              >{{ t[DAY_LABEL_KEYS[idx]!] }}</span>
              <label class="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  :checked="dayRow(locale, idx).closed"
                  @change="(e: Event) => setDayField(locale, idx, 'closed', (e.target as HTMLInputElement).checked)"
                >
                <span>{{ t.closedLabel }}</span>
              </label>
              <input
                class="maan-form-input"
                type="time"
                :value="dayRow(locale, idx).opens"
                :disabled="dayRow(locale, idx).closed"
                :placeholder="t.opensAt"
                @input="(e: Event) => setDayField(locale, idx, 'opens', (e.target as HTMLInputElement).value)"
              >
              <input
                class="maan-form-input"
                type="time"
                :value="dayRow(locale, idx).closes"
                :disabled="dayRow(locale, idx).closed"
                :placeholder="t.closesAt"
                @input="(e: Event) => setDayField(locale, idx, 'closes', (e.target as HTMLInputElement).value)"
              >
              <input
                class="maan-form-input"
                type="time"
                :value="dayRow(locale, idx).secondOpens"
                :disabled="dayRow(locale, idx).closed"
                :placeholder="t.secondShift + ' — ' + t.opensAt"
                @input="(e: Event) => setDayField(locale, idx, 'secondOpens', (e.target as HTMLInputElement).value)"
              >
              <input
                class="maan-form-input"
                type="time"
                :value="dayRow(locale, idx).secondCloses"
                :disabled="dayRow(locale, idx).closed"
                :placeholder="t.secondShift + ' — ' + t.closesAt"
                @input="(e: Event) => setDayField(locale, idx, 'secondCloses', (e.target as HTMLInputElement).value)"
              >
            </div>
          </div>

          <!-- ───── dr-osama-bio editor ───── -->
          <div
            v-else-if="key === 'dr-osama-bio'"
            class="grid gap-4"
          >
            <label>
              <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldName }}</span>
              <input
                v-model="(values[locale] as { name: string }).name"
                class="maan-form-input"
                required
              >
            </label>
            <label>
              <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldHeadline }}</span>
              <input
                v-model="(values[locale] as { headline: string }).headline"
                class="maan-form-input"
                required
              >
            </label>
            <label>
              <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldBio }}</span>
              <textarea
                v-model="(values[locale] as { bio: string }).bio"
                class="maan-form-input min-h-32"
                required
              />
            </label>
          </div>

          <!-- ───── mission-vision editor ───── -->
          <div
            v-else-if="key === 'mission-vision'"
            class="grid gap-4"
          >
            <label>
              <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldMission }}</span>
              <textarea
                v-model="(values[locale] as { mission: string }).mission"
                class="maan-form-input min-h-24"
                required
              />
            </label>
            <label>
              <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldVision }}</span>
              <textarea
                v-model="(values[locale] as { vision: string }).vision"
                class="maan-form-input min-h-24"
                required
              />
            </label>
          </div>

          <!-- ───── contact-info editor ───── -->
          <div
            v-else-if="key === 'contact-info'"
            class="grid gap-4 md:grid-cols-2"
          >
            <label>
              <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldPhone }}</span>
              <input
                v-model="(values[locale] as { phone: string }).phone"
                class="maan-form-input"
              >
            </label>
            <label>
              <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldWhatsapp }}</span>
              <input
                v-model="(values[locale] as { whatsapp: string }).whatsapp"
                class="maan-form-input"
              >
            </label>
            <label>
              <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldEmail }}</span>
              <input
                v-model="(values[locale] as { email: string }).email"
                class="maan-form-input"
                type="email"
              >
            </label>
            <label>
              <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldMapsUrl }}</span>
              <input
                v-model="(values[locale] as { mapsUrl: string }).mapsUrl"
                class="maan-form-input"
              >
            </label>
            <label class="md:col-span-2">
              <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldAddress }}</span>
              <textarea
                v-model="(values[locale] as { address: string }).address"
                class="maan-form-input min-h-20"
              />
            </label>
          </div>

          <!-- ───── stats editor ───── -->
          <div
            v-else-if="key === 'stats'"
            class="grid gap-3"
          >
            <div
              v-for="(item, idx) in ((values[locale] as { items: Array<{ value: string, label: string }> }).items || [])"
              :key="idx"
              class="grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-center"
            >
              <input
                v-model="item.value"
                class="maan-form-input"
                :placeholder="t.fieldStatValue"
              >
              <input
                v-model="item.label"
                class="maan-form-input"
                :placeholder="t.fieldStatLabel"
              >
              <UButton
                color="error"
                variant="outline"
                size="sm"
                icon="i-lucide-trash-2"
                @click="removeStat(locale, idx)"
              >
                {{ t.removeStat }}
              </UButton>
            </div>
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-plus"
              size="sm"
              class="w-fit"
              @click="addStat(locale)"
            >
              {{ t.addStat }}
            </UButton>
          </div>

          <!-- ───── theme editor ───── -->
          <MaanThemeEditor
            v-else-if="key === 'theme'"
            :model-value="(values[locale] as unknown as ThemeValue)"
            :defaults="THEME_DEFAULTS"
            @update:model-value="(v: ThemeValue) => { values[locale] = v as unknown as AnyValue }"
          />

          <div class="mt-5">
            <UButton
              icon="i-lucide-save"
              :loading="isLoading"
              @click="onSave(locale)"
            >
              {{ t.save }}
            </UButton>
          </div>
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>
