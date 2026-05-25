<script setup lang="ts">
import type { BlockForm } from '~/composables/useBlockForm'

const props = defineProps<{
  modelValue: BlockForm
  isSaving: boolean
  saveError: string
  saveSuccess: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BlockForm]
  'save': []
  'clear': []
}>()

const { t } = useDashboardI18n()
// Placement options no longer flat-selected — MaanPlacementPicker reads
// the taxonomy directly from useMaanTaxonomy.

const form = computed({
  get: () => props.modelValue,
  set: (value: BlockForm) => emit('update:modelValue', value)
})

// One option list per block type so the editor can render a friendly
// dropdown when creating a new block. Each entry maps to a value the
// schema accepts.
const typeOptions = computed(() => [
  { value: 'testimonial', label: t.value.typeTestimonial },
  { value: 'faq_item', label: t.value.typeFaqItem },
  { value: 'stat_tile', label: t.value.typeStatTile },
  { value: 'team_member', label: t.value.typeTeamMember },
  { value: 'service_card', label: t.value.typeServiceCard }
])

const localeOptions = computed(() => [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
  { value: '*', label: t.value.blockLocaleAny }
])

// Comma-separated edit binding for tags (team_member). Keeps the form
// payload as a string[] while admins type a single line.
const tagsCsv = computed({
  get: () => form.value.payload.tags.join(', '),
  set: (v: string) => {
    form.value.payload.tags = v
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  }
})
</script>

<template>
  <form
    class="grid gap-5"
    @submit.prevent="emit('save')"
  >
    <p class="text-sm text-muted">
      {{ t.savedThroughCms }}
    </p>

    <!-- Type discriminator + locale + status all live in one tight row. -->
    <div class="grid gap-5 md:grid-cols-3">
      <div>
        <label class="mb-2 block text-sm font-semibold text-highlighted">{{ t.blockType }}</label>
        <USelect
          v-model="form.type"
          :items="typeOptions"
          value-key="value"
          class="w-full"
          :disabled="!!form.id"
        />
      </div>
      <div>
        <label class="mb-2 block text-sm font-semibold text-highlighted">{{ t.blockLocale }}</label>
        <USelect
          v-model="form.locale"
          :items="localeOptions"
          value-key="value"
          class="w-full"
        />
      </div>
      <div>
        <label class="mb-2 block text-sm font-semibold text-highlighted">{{ t.status }}</label>
        <select
          v-model="form.status"
          class="maan-form-input"
        >
          <option value="draft">
            {{ t.draft }}
          </option>
          <option value="in_review">
            {{ t.inReview }}
          </option>
          <option value="published">
            {{ t.published }}
          </option>
        </select>
      </div>
    </div>

    <!-- ───── Type-specific payload fields ───── -->

    <template v-if="form.type === 'testimonial'">
      <label>
        <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldQuote }}</span>
        <textarea
          v-model="form.payload.quote"
          class="maan-form-input min-h-24"
          required
        />
      </label>
      <label>
        <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldAttribution }}</span>
        <input
          v-model="form.payload.attribution"
          class="maan-form-input"
          required
        >
      </label>
    </template>

    <template v-else-if="form.type === 'faq_item'">
      <label>
        <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldQuestion }}</span>
        <input
          v-model="form.payload.q"
          class="maan-form-input"
          required
        >
      </label>
      <label>
        <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldAnswer }}</span>
        <textarea
          v-model="form.payload.a"
          class="maan-form-input min-h-32"
          required
        />
      </label>
    </template>

    <template v-else-if="form.type === 'stat_tile'">
      <div class="grid gap-5 md:grid-cols-2">
        <label>
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldStatValue }}</span>
          <input
            v-model="form.payload.value"
            class="maan-form-input"
            required
          >
        </label>
        <label>
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldStatLabel }}</span>
          <input
            v-model="form.payload.label"
            class="maan-form-input"
            required
          >
        </label>
      </div>
    </template>

    <template v-else-if="form.type === 'team_member'">
      <div class="grid gap-5 md:grid-cols-2">
        <label>
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldName }}</span>
          <input
            v-model="form.payload.name"
            class="maan-form-input"
            required
          >
        </label>
        <label>
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldRole }}</span>
          <input
            v-model="form.payload.role"
            class="maan-form-input"
            required
          >
        </label>
      </div>
      <label>
        <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldBio }}</span>
        <textarea
          v-model="form.payload.bio"
          class="maan-form-input min-h-32"
          required
        />
      </label>
      <div class="grid gap-5 md:grid-cols-2">
        <label>
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldImageUrl }}</span>
          <input
            v-model="form.payload.imageUrl"
            class="maan-form-input"
            placeholder="https://…"
          >
        </label>
        <label>
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldTags }}</span>
          <input
            v-model="tagsCsv"
            class="maan-form-input"
            placeholder="Autism, Down Syndrome"
          >
        </label>
      </div>
    </template>

    <template v-else-if="form.type === 'service_card'">
      <div class="grid gap-5 md:grid-cols-2">
        <label>
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldTitle }}</span>
          <input
            v-model="form.payload.title"
            class="maan-form-input"
            required
          >
        </label>
        <label>
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldIcon }}</span>
          <input
            v-model="form.payload.icon"
            class="maan-form-input"
            placeholder="i-lucide-sparkles"
          >
        </label>
      </div>
      <label>
        <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldDescription }}</span>
        <textarea
          v-model="form.payload.description"
          class="maan-form-input min-h-24"
          required
        />
      </label>
      <div class="grid gap-5 md:grid-cols-2">
        <label>
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldCtaLabel }}</span>
          <input
            v-model="form.payload.ctaLabel"
            class="maan-form-input"
          >
        </label>
        <label>
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldCtaUrl }}</span>
          <input
            v-model="form.payload.ctaUrl"
            class="maan-form-input"
          >
        </label>
      </div>
    </template>

    <!-- ───── Placement + ordering + publishedAt ───── -->

    <div>
      <p class="mb-2 block text-sm font-semibold text-highlighted">
        {{ t.placements }}
      </p>
      <p class="mb-3 text-xs leading-5 text-muted">
        {{ t.placementsHint }}
      </p>
      <MaanPlacementPicker v-model="form.placements" />
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <label>
        <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.fieldSort }}</span>
        <input
          v-model.number="form.sort"
          class="maan-form-input"
          type="number"
          placeholder="10"
        >
      </label>
      <label>
        <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.publishedAt }}</span>
        <input
          v-model="form.published_at"
          class="maan-form-input"
          type="datetime-local"
        >
      </label>
    </div>

    <UAlert
      v-if="saveError"
      color="error"
      variant="soft"
      :title="saveError"
    />
    <UAlert
      v-if="saveSuccess"
      color="success"
      variant="soft"
      :title="saveSuccess"
    />

    <div class="flex flex-wrap gap-3">
      <UButton
        type="submit"
        size="xl"
        icon="i-lucide-save"
        :loading="isSaving"
      >
        {{ t.save }}
      </UButton>
      <UButton
        type="button"
        color="neutral"
        variant="subtle"
        @click="emit('clear')"
      >
        {{ t.clear }}
      </UButton>
    </div>
  </form>
</template>
