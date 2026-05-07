<script setup lang="ts">
const props = defineProps<{
  block?: MaanFormBlock
  locale?: 'en' | 'ar'
  variant?: 'section' | 'card'
}>()

const isArabic = computed(() => props.locale === 'ar')
const form = computed(() => props.block?.form)
const variant = computed(() => props.variant || 'section')
const values = reactive<Record<string, string | boolean | string[]>>({})
const fieldErrors = reactive<Record<string, string>>({})
const status = ref<'idle' | 'success' | 'error'>('idle')
const statusMessage = ref('')
const isSubmitting = ref(false)
const website = ref('')

const fieldWidthClass = (width: MaanFormField['width']) => ({
  100: 'md:col-span-6',
  67: 'md:col-span-4',
  50: 'md:col-span-3',
  33: 'md:col-span-2'
})[width] || 'md:col-span-6'

const localizedField = (field: MaanFormField) => {
  if (!isArabic.value) {
    return {
      label: field.label,
      placeholder: field.placeholder,
      help: field.help,
      choices: field.choices
    }
  }

  const labels: Record<string, string> = {
    'first-name': 'الاسم الأول',
    'last-name': 'اسم العائلة',
    'email': 'البريد الإلكتروني',
    'department': 'ما نوع الدعم الذي تود السؤال عنه؟',
    'comments': 'كيف يمكننا مساعدتك؟'
  }
  const placeholders: Record<string, string> = {
    'first-name': 'الاسم الأول',
    'last-name': 'اسم العائلة',
    'email': 'name@example.com',
    'comments': 'شارك عمر الطفل واحتياجاته والخطوة التي تود السؤال عنها.'
  }
  const choiceText: Record<string, string> = {
    'assessment': 'التقييم',
    'individualized-education': 'الخطة التعليمية الفردية',
    'speech-communication': 'النطق والتواصل',
    'occupational-therapy': 'العلاج الوظيفي',
    'family-guidance': 'إرشاد الأسرة'
  }

  return {
    label: labels[field.name] || field.label,
    placeholder: placeholders[field.name] || field.placeholder,
    help: field.help,
    choices: field.choices.map(choice => ({
      ...choice,
      text: choiceText[choice.value] || choice.text
    }))
  }
}

const inputType = (field: MaanFormField) => field.validation?.includes('email') || field.name === 'email'
  ? 'email'
  : 'text'

watchEffect(() => {
  for (const field of form.value?.fields || []) {
    if (values[field.name] === undefined) {
      values[field.name] = field.type === 'checkbox_group' ? [] : field.type === 'checkbox' ? false : ''
    }
  }
})

const submit = async () => {
  if (!form.value) {
    return
  }

  status.value = 'idle'
  statusMessage.value = ''
  for (const key of Object.keys(fieldErrors)) {
    Reflect.deleteProperty(fieldErrors, key)
  }
  isSubmitting.value = true

  try {
    const response = await $fetch<{
      ok: boolean
      onSuccess?: 'message' | 'redirect'
      successMessage?: string
      successRedirectUrl?: string
    }>('/api/forms/submit', {
      method: 'POST',
      body: {
        formId: form.value.id,
        values,
        website: website.value
      }
    })

    if (response.onSuccess === 'redirect' && response.successRedirectUrl) {
      await navigateTo(response.successRedirectUrl, { external: true })
      return
    }

    status.value = 'success'
    statusMessage.value = response.successMessage || form.value.successMessage || (isArabic.value ? 'تم استلام الطلب.' : 'Your submission has been received.')
    for (const field of form.value.fields) {
      values[field.name] = field.type === 'checkbox_group' ? [] : field.type === 'checkbox' ? false : ''
    }
  } catch (error) {
    const fetchError = error as { data?: { data?: { errors?: Record<string, string> }, message?: string }, statusMessage?: string }
    const errors = fetchError.data?.data?.errors || {}

    Object.assign(fieldErrors, errors)
    status.value = 'error'
    statusMessage.value = fetchError.data?.message || fetchError.statusMessage || (isArabic.value ? 'تعذر إرسال النموذج. حاول مرة أخرى.' : 'The form could not be submitted. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section
    v-if="block && form && variant === 'section'"
    class="maan-form-section border-y border-default"
  >
    <UContainer class="grid gap-10 py-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
      <div>
        <UBadge
          color="secondary"
          variant="subtle"
          class="mb-4"
        >
          {{ block.tagline || form.title }}
        </UBadge>
        <h2 class="text-3xl font-semibold text-highlighted sm:text-4xl">
          {{ block.headline || form.title }}
        </h2>
        <p class="mt-5 text-base leading-7 text-muted">
          {{ isArabic
            ? 'تصل رسالتك مباشرة إلى فريق المركز وتُحفظ في نظام النماذج داخل Directus للمتابعة.'
            : 'Your message is stored in Directus form submissions so the center team can review and follow up.' }}
        </p>
      </div>

      <form
        class="maan-form-card grid gap-5 p-6 sm:p-8 md:grid-cols-6"
        novalidate
        @submit.prevent="submit"
      >
        <input
          v-model="website"
          class="hidden"
          type="text"
          name="website"
          tabindex="-1"
          autocomplete="off"
        >

        <div
          v-for="field in form.fields"
          :key="field.id"
          :class="field.type === 'hidden' ? 'hidden' : fieldWidthClass(field.width)"
        >
          <template v-if="field.type !== 'hidden'">
            <label
              :for="field.id"
              class="mb-2 block text-sm font-semibold text-highlighted"
            >
              {{ localizedField(field).label }}
              <span
                v-if="field.required"
                class="text-error"
                aria-hidden="true"
              >*</span>
            </label>

            <textarea
              v-if="field.type === 'textarea'"
              :id="field.id"
              :value="values[field.name] as string"
              class="maan-form-input min-h-32"
              :name="field.name"
              :placeholder="localizedField(field).placeholder"
              :required="field.required"
              @input="values[field.name] = ($event.target as HTMLTextAreaElement).value"
            />

            <select
              v-else-if="field.type === 'select'"
              :id="field.id"
              :value="values[field.name] as string"
              class="maan-form-input"
              :name="field.name"
              :required="field.required"
              @change="values[field.name] = ($event.target as HTMLSelectElement).value"
            >
              <option value="">
                {{ isArabic ? 'اختر خيارا' : 'Select an option' }}
              </option>
              <option
                v-for="choice in localizedField(field).choices"
                :key="choice.value"
                :value="choice.value"
              >
                {{ choice.text }}
              </option>
            </select>

            <div
              v-else-if="field.type === 'radio'"
              class="grid gap-2"
            >
              <label
                v-for="choice in localizedField(field).choices"
                :key="choice.value"
                class="maan-choice"
              >
                <input
                  v-model="values[field.name]"
                  type="radio"
                  :name="field.name"
                  :value="choice.value"
                  :required="field.required"
                >
                <span>{{ choice.text }}</span>
              </label>
            </div>

            <div
              v-else-if="field.type === 'checkbox_group'"
              class="grid gap-2"
            >
              <label
                v-for="choice in localizedField(field).choices"
                :key="choice.value"
                class="maan-choice"
              >
                <input
                  v-model="values[field.name]"
                  type="checkbox"
                  :name="field.name"
                  :value="choice.value"
                >
                <span>{{ choice.text }}</span>
              </label>
            </div>

            <label
              v-else-if="field.type === 'checkbox'"
              class="maan-choice"
            >
              <input
                v-model="values[field.name]"
                type="checkbox"
                :name="field.name"
                :required="field.required"
              >
              <span>{{ localizedField(field).label }}</span>
            </label>

            <input
              v-else
              :id="field.id"
              :value="values[field.name] as string"
              class="maan-form-input"
              :type="inputType(field)"
              :name="field.name"
              :placeholder="localizedField(field).placeholder"
              :required="field.required"
              @input="values[field.name] = ($event.target as HTMLInputElement).value"
            >

            <p
              v-if="localizedField(field).help"
              class="mt-2 text-xs leading-5 text-muted"
            >
              {{ localizedField(field).help }}
            </p>
            <p
              v-if="fieldErrors[field.name]"
              class="mt-2 text-sm text-error"
            >
              {{ fieldErrors[field.name] }}
            </p>
          </template>
        </div>

        <div class="md:col-span-6">
          <UAlert
            v-if="status !== 'idle'"
            :color="status === 'success' ? 'success' : 'error'"
            variant="soft"
            :title="statusMessage"
            class="mb-5"
          />
          <UButton
            type="submit"
            size="xl"
            icon="i-lucide-send"
            :loading="isSubmitting"
          >
            {{ isArabic && form.submitLabel === 'Send enquiry' ? 'إرسال الطلب' : form.submitLabel }}
          </UButton>
        </div>
      </form>
    </UContainer>
  </section>

  <div
    v-else-if="block && form"
    class="maan-form-card p-6 sm:p-8"
  >
    <div class="mb-6">
      <UBadge
        color="secondary"
        variant="subtle"
        class="mb-4"
      >
        {{ block.tagline || form.title }}
      </UBadge>
      <h2 class="text-2xl font-semibold text-highlighted">
        {{ block.headline || form.title }}
      </h2>
    </div>

    <form
      class="grid gap-5 md:grid-cols-6"
      novalidate
      @submit.prevent="submit"
    >
      <input
        v-model="website"
        class="hidden"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
      >

      <div
        v-for="field in form.fields"
        :key="field.id"
        :class="field.type === 'hidden' ? 'hidden' : fieldWidthClass(field.width)"
      >
        <template v-if="field.type !== 'hidden'">
          <label
            :for="`compact-${field.id}`"
            class="mb-2 block text-sm font-semibold text-highlighted"
          >
            {{ localizedField(field).label }}
            <span
              v-if="field.required"
              class="text-error"
              aria-hidden="true"
            >*</span>
          </label>

          <textarea
            v-if="field.type === 'textarea'"
            :id="`compact-${field.id}`"
            :value="values[field.name] as string"
            class="maan-form-input min-h-28"
            :name="field.name"
            :placeholder="localizedField(field).placeholder"
            :required="field.required"
            @input="values[field.name] = ($event.target as HTMLTextAreaElement).value"
          />

          <select
            v-else-if="field.type === 'select'"
            :id="`compact-${field.id}`"
            :value="values[field.name] as string"
            class="maan-form-input"
            :name="field.name"
            :required="field.required"
            @change="values[field.name] = ($event.target as HTMLSelectElement).value"
          >
            <option value="">
              {{ isArabic ? 'اختر خيارا' : 'Select an option' }}
            </option>
            <option
              v-for="choice in localizedField(field).choices"
              :key="choice.value"
              :value="choice.value"
            >
              {{ choice.text }}
            </option>
          </select>

          <div
            v-else-if="field.type === 'radio'"
            class="grid gap-2"
          >
            <label
              v-for="choice in localizedField(field).choices"
              :key="choice.value"
              class="maan-choice"
            >
              <input
                v-model="values[field.name]"
                type="radio"
                :name="field.name"
                :value="choice.value"
                :required="field.required"
              >
              <span>{{ choice.text }}</span>
            </label>
          </div>

          <div
            v-else-if="field.type === 'checkbox_group'"
            class="grid gap-2"
          >
            <label
              v-for="choice in localizedField(field).choices"
              :key="choice.value"
              class="maan-choice"
            >
              <input
                v-model="values[field.name]"
                type="checkbox"
                :name="field.name"
                :value="choice.value"
              >
              <span>{{ choice.text }}</span>
            </label>
          </div>

          <label
            v-else-if="field.type === 'checkbox'"
            class="maan-choice"
          >
            <input
              v-model="values[field.name]"
              type="checkbox"
              :name="field.name"
              :required="field.required"
            >
            <span>{{ localizedField(field).label }}</span>
          </label>

          <input
            v-else
            :id="`compact-${field.id}`"
            :value="values[field.name] as string"
            class="maan-form-input"
            :type="inputType(field)"
            :name="field.name"
            :placeholder="localizedField(field).placeholder"
            :required="field.required"
            @input="values[field.name] = ($event.target as HTMLInputElement).value"
          >

          <p
            v-if="localizedField(field).help"
            class="mt-2 text-xs leading-5 text-muted"
          >
            {{ localizedField(field).help }}
          </p>
          <p
            v-if="fieldErrors[field.name]"
            class="mt-2 text-sm text-error"
          >
            {{ fieldErrors[field.name] }}
          </p>
        </template>
      </div>

      <div class="md:col-span-6">
        <UAlert
          v-if="status !== 'idle'"
          :color="status === 'success' ? 'success' : 'error'"
          variant="soft"
          :title="statusMessage"
          class="mb-5"
        />
        <UButton
          type="submit"
          size="xl"
          icon="i-lucide-send"
          :loading="isSubmitting"
        >
          {{ isArabic && form.submitLabel === 'Send enquiry' ? 'إرسال الطلب' : form.submitLabel }}
        </UButton>
      </div>
    </form>
  </div>
</template>
