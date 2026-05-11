<script setup lang="ts">
definePageMeta({
  alias: ['/ar/dashboard/login'],
  layout: false
})

const { isArabic, dashboardHome, t } = useDashboardI18n()

const loginT = computed(() => isArabic.value
  ? {
      title: 'تسجيل دخول المديرين | لوحة تحكم معا',
      badge: 'لوحة تحكم المديرين',
      heading: 'تسجيل دخول المدير',
      intro: 'استخدم حسابك الحالي. الوصول يتبع صلاحيات دورك.',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      submit: 'تسجيل الدخول',
      fallbackError: 'تعذر تسجيل الدخول.'
    }
  : {
      title: 'Manager Login | Maan Dashboard',
      badge: 'Manager Dashboard',
      heading: 'Manager sign in',
      intro: 'Use your existing account. Access follows your role permissions.',
      email: 'Email',
      password: 'Password',
      submit: 'Sign in',
      fallbackError: 'Could not sign in.'
    })

useSeoMeta({
  title: () => loginT.value.title,
  robots: 'noindex, nofollow'
})

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const login = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    await $fetch('/api/dashboard/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })
    await navigateTo(dashboardHome.value)
  } catch (error) {
    const fetchError = error as { data?: { message?: string }, statusMessage?: string }

    errorMessage.value = fetchError.data?.message || fetchError.statusMessage || loginT.value.fallbackError
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="maan-main grid min-h-screen place-items-center px-4 py-10">
    <form
      class="maan-form-card w-full max-w-md p-6 sm:p-8"
      @submit.prevent="login"
    >
      <div class="mb-6 flex items-center gap-3">
        <AppLogo class="h-9 w-auto shrink-0" />
        <div>
          <UBadge
            color="primary"
            variant="subtle"
            size="sm"
          >
            {{ loginT.badge }}
          </UBadge>
          <p class="mt-1 text-xs text-muted">
            {{ t.brand }}
          </p>
        </div>
      </div>

      <h1 class="text-3xl font-semibold text-highlighted">
        {{ loginT.heading }}
      </h1>
      <p class="mt-3 text-sm leading-6 text-muted">
        {{ loginT.intro }}
      </p>

      <div class="mt-8 grid gap-5">
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ loginT.email }}</span>
          <input
            v-model="email"
            class="maan-form-input"
            type="email"
            autocomplete="email"
            required
          >
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-highlighted">{{ loginT.password }}</span>
          <input
            v-model="password"
            class="maan-form-input"
            type="password"
            autocomplete="current-password"
            required
          >
        </label>
      </div>

      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage"
        class="mt-5"
      />

      <UButton
        type="submit"
        size="xl"
        icon="i-lucide-log-in"
        :loading="isLoading"
        class="mt-6"
        block
      >
        {{ loginT.submit }}
      </UButton>
    </form>
  </main>
</template>
