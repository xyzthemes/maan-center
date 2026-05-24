<script setup lang="ts">
definePageMeta({
  alias: ['/ar/dashboard/forgot-password'],
  layout: false,
  auth: 'guest' // already-signed-in users don't need to reset
})

const { isArabic, t } = useDashboardI18n()

// useAuthClientAction wraps an arbitrary Better Auth client method into an
// action handle with status/data/error refs, matching the pattern useSignIn
// uses. `requestPasswordReset` generates the token + sends the reset email
// via our server-side `sendResetPassword` callback (see server/auth.config.ts).
const requestResetAction = useAuthClientAction(c => c.requestPasswordReset)

const copy = computed(() => isArabic.value
  ? {
      title: 'استعادة كلمة المرور | لوحة تحكم معا',
      badge: 'لوحة تحكم المديرين',
      heading: 'استعادة كلمة المرور',
      intro: 'أدخل بريدك الإلكتروني وسنرسل إليك رابط إعادة التعيين.',
      email: 'البريد الإلكتروني',
      submit: 'إرسال رابط الإعادة',
      backToLogin: 'العودة إلى تسجيل الدخول',
      success: 'إذا كان الحساب موجوداً، فقد أرسلنا رابط إعادة التعيين إلى بريدك الإلكتروني.',
      fallbackError: 'تعذر إرسال البريد.'
    }
  : {
      title: 'Forgot password | Maan Dashboard',
      badge: 'Manager Dashboard',
      heading: 'Forgot your password?',
      intro: 'Enter your email and we will send you a reset link.',
      email: 'Email',
      submit: 'Send reset link',
      backToLogin: 'Back to sign in',
      success: 'If an account exists for that email, we have sent a reset link.',
      fallbackError: 'Could not send email.'
    })

useSeoMeta({
  title: () => copy.value.title,
  robots: 'noindex, nofollow'
})

const email = ref('')
const isLoading = computed(() => requestResetAction.status.value === 'pending')
const errorMessage = computed(() => requestResetAction.error.value?.message || '')
const succeeded = computed(() => requestResetAction.status.value === 'success')

// The callbackURL points at our reset page; Better Auth appends `?token=...`
// to it when building the email body.
const resetCallbackPath = computed(() => isArabic.value
  ? '/ar/dashboard/reset-password'
  : '/dashboard/reset-password')

const submit = async () => {
  await requestResetAction.execute({
    email: email.value,
    redirectTo: resetCallbackPath.value
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
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ copy.email }}</span>
          <input
            v-model="email"
            class="maan-form-input"
            type="email"
            autocomplete="email"
            required
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
        icon="i-lucide-mail"
        :loading="isLoading"
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
