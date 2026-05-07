<script setup lang="ts">
definePageMeta({
  alias: ['/ar/dashboard/login'],
  layout: false
})

const route = useRoute()
const isArabic = computed(() => route.path.startsWith('/ar'))
const dashboardPath = computed(() => isArabic.value ? '/ar/dashboard' : '/dashboard')
const t = computed(() => isArabic.value
  ? {
      title: 'تسجيل دخول المديرين | لوحة تحكم معا',
      badge: 'لوحة تحكم المديرين',
      heading: 'تسجيل الدخول بحساب Directus',
      intro: 'استخدم حساب Directus الحالي. الوصول يتبع صلاحيات دورك في Directus.',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      submit: 'تسجيل الدخول',
      fallbackError: 'تعذر تسجيل الدخول باستخدام Directus.'
    }
  : {
      title: 'Manager Login | Maan Dashboard',
      badge: 'Manager Dashboard',
      heading: 'Sign in with Directus',
      intro: 'Use your existing Directus account. Access follows your Directus role permissions.',
      email: 'Email',
      password: 'Password',
      submit: 'Sign in',
      fallbackError: 'Could not sign in with Directus.'
    })

useSeoMeta({
  title: () => t.value.title,
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
    await navigateTo(dashboardPath.value)
  } catch (error) {
    const fetchError = error as { data?: { message?: string }, statusMessage?: string }

    errorMessage.value = fetchError.data?.message || fetchError.statusMessage || t.value.fallbackError
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UApp>
    <main class="maan-main grid min-h-screen place-items-center px-4 py-10">
      <form
        class="maan-form-card w-full max-w-md p-6 sm:p-8"
        @submit.prevent="login"
      >
        <UBadge
          color="primary"
          variant="subtle"
          class="mb-5"
        >
          {{ t.badge }}
        </UBadge>
        <h1 class="text-3xl font-semibold text-highlighted">
          {{ t.heading }}
        </h1>
        <p class="mt-3 text-sm leading-6 text-muted">
          {{ t.intro }}
        </p>

        <div class="mt-8 grid gap-5">
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.email }}</span>
            <input
              v-model="email"
              class="maan-form-input"
              type="email"
              autocomplete="email"
              required
            >
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-highlighted">{{ t.password }}</span>
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
          {{ t.submit }}
        </UButton>
      </form>
    </main>
  </UApp>
</template>
