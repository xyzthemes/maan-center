<script setup lang="ts">
definePageMeta({
  alias: ['/ar/dashboard/reset-password'],
  layout: false,
  auth: 'guest'
})

const { isArabic, t } = useDashboardI18n()
const route = useRoute()

// Token arrives as ?token=... from the email link. Better Auth's resetPassword
// validates it server-side and either rotates the password or errors with an
// invalid/expired token message.
const token = computed(() => {
  const t = route.query.token
  return typeof t === 'string' ? t : ''
})

const resetPasswordAction = useAuthClientAction(c => c.resetPassword)

const copy = computed(() => isArabic.value
  ? {
      title: 'تعيين كلمة مرور جديدة | لوحة تحكم معا',
      badge: 'لوحة تحكم المديرين',
      heading: 'تعيين كلمة مرور جديدة',
      intro: 'أدخل كلمة المرور الجديدة لحسابك أدناه.',
      newPassword: 'كلمة المرور الجديدة',
      confirm: 'تأكيد كلمة المرور',
      submit: 'حفظ كلمة المرور',
      missingToken: 'الرابط غير صالح. اطلب رابط إعادة تعيين جديد.',
      mismatch: 'كلمتا المرور غير متطابقتين.',
      tooShort: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.',
      success: 'تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن.',
      backToLogin: 'الذهاب إلى تسجيل الدخول'
    }
  : {
      title: 'Set a new password | Maan Dashboard',
      badge: 'Manager Dashboard',
      heading: 'Set a new password',
      intro: 'Enter the new password for your account below.',
      newPassword: 'New password',
      confirm: 'Confirm password',
      submit: 'Save password',
      missingToken: 'The reset link is invalid. Request a new reset link.',
      mismatch: 'The two passwords do not match.',
      tooShort: 'Password must be at least 8 characters.',
      success: 'Password updated. You can now sign in.',
      backToLogin: 'Go to sign in'
    })

useSeoMeta({
  title: () => copy.value.title,
  robots: 'noindex, nofollow'
})

const newPassword = ref('')
const confirmPassword = ref('')

const isLoading = computed(() => resetPasswordAction.status.value === 'pending')
const succeeded = computed(() => resetPasswordAction.status.value === 'success')

// Client-side validation runs first; only hand off to Better Auth once we have
// a non-empty token + matching, long-enough passwords. Mirrors Better Auth's
// own 8-char minimum (see `password.minPasswordLength` default in module config).
const clientError = ref('')

const errorMessage = computed(() =>
  clientError.value
  || (!token.value ? copy.value.missingToken : '')
  || resetPasswordAction.error.value?.message
  || ''
)

const submit = async () => {
  clientError.value = ''
  if (!token.value) return
  if (newPassword.value.length < 8) {
    clientError.value = copy.value.tooShort
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    clientError.value = copy.value.mismatch
    return
  }

  await resetPasswordAction.execute({
    newPassword: newPassword.value,
    token: token.value
  })
}

const loginPath = computed(() => isArabic.value ? '/ar/dashboard/login' : '/dashboard/login')
</script>

<template>
  <main class="maan-main grid min-h-screen place-items-center px-4 py-10">
    <form
      class="maan-form-card w-full max-w-md p-6 sm:p-8"
      @submit.prevent="submit"
    >
      <div class="mb-6 flex items-center gap-3">
        <AppLogo class="h-9 w-auto shrink-0" />
        <div>
          <UBadge
            color="primary"
            variant="subtle"
            size="sm"
          >
            {{ copy.badge }}
          </UBadge>
          <p class="mt-1 text-xs text-muted">
            {{ t.brand }}
          </p>
        </div>
      </div>

      <h1 class="text-3xl font-semibold text-highlighted">
        {{ copy.heading }}
      </h1>
      <p class="mt-3 text-sm leading-6 text-muted">
        {{ copy.intro }}
      </p>

      <UAlert
        v-if="succeeded"
        color="success"
        variant="soft"
        :title="copy.success"
        class="mt-6"
      />

      <div
        v-else
        class="mt-8 grid gap-5"
      >
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ copy.newPassword }}</span>
          <input
            v-model="newPassword"
            class="maan-form-input"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
            :disabled="!token"
          >
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ copy.confirm }}</span>
          <input
            v-model="confirmPassword"
            class="maan-form-input"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
            :disabled="!token"
          >
        </label>
      </div>

      <UAlert
        v-if="errorMessage && !succeeded"
        color="error"
        variant="soft"
        :title="errorMessage"
        class="mt-5"
      />

      <UButton
        v-if="!succeeded"
        type="submit"
        size="xl"
        icon="i-lucide-key-round"
        :loading="isLoading"
        :disabled="!token"
        class="mt-6"
        block
      >
        {{ copy.submit }}
      </UButton>

      <NuxtLink
        :to="loginPath"
        class="mt-6 block text-center text-sm text-muted underline-offset-4 hover:text-highlighted hover:underline"
      >
        {{ copy.backToLogin }}
      </NuxtLink>
    </form>
  </main>
</template>
