<script setup lang="ts">
useSeoMeta({
  title: 'شكراً — مركز معاً للتربية الخاصة',
  description: 'تم استلام استفساركم. سيتابع فريق المركز معكم خلال يوم العمل.',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="maan-page">
    <section class="maan-hero">
      <UContainer class="py-20 sm:py-28">
        <div class="mx-auto max-w-2xl text-center">
          <div
            class="mx-auto mb-6 grid size-16 place-items-center rounded-full"
            style="background: color-mix(in srgb, var(--maan-down) 18%, transparent); color: var(--maan-down);"
            aria-hidden="true"
          >
            <UIcon
              name="i-lucide-check"
              class="size-8"
            />
          </div>
          <span class="maan-eyebrow maan-eyebrow--down">تم استلام الاستفسار</span>
          <h1 class="maan-hero-title mt-4 text-3xl font-bold sm:text-4xl">
            شكراً لكم — وصلنا استفساركم.
          </h1>
          <p class="maan-hero-copy mx-auto mt-5 max-w-xl text-lg">
            سيتابع معكم أخصائي من فريق المركز خلال يوم العمل. لو احتجتم رداً أسرع، تواصلوا معنا
            مباشرة عبر واتساب.
          </p>

          <div class="mt-8 grid gap-3 sm:grid-cols-3">
            <div
              class="maan-card text-start"
              style="border-top: 4px solid var(--maan-autism);"
            >
              <UIcon
                name="i-lucide-clock"
                class="size-5"
                style="color: var(--maan-autism);"
              />
              <h3 class="maan-card-title mt-3 text-base">
                خلال يوم العمل
              </h3>
              <p class="maan-card-body mt-1.5 text-sm">
                سنراجع رسالتكم ونرد عليكم بالخطوة التالية المناسبة.
              </p>
            </div>
            <div
              class="maan-card text-start"
              style="border-top: 4px solid var(--maan-down);"
            >
              <UIcon
                name="i-lucide-phone"
                class="size-5"
                style="color: var(--maan-down);"
              />
              <h3 class="maan-card-title mt-3 text-base">
                يتواصل معكم أخصائي
              </h3>
              <p class="maan-card-body mt-1.5 text-sm">
                نتواصل صوتياً أو عبر واتساب بحسب تفضيلكم.
              </p>
            </div>
            <div
              class="maan-card text-start"
              style="border-top: 4px solid var(--maan-ld);"
            >
              <UIcon
                name="i-lucide-shield-check"
                class="size-5"
                style="color: var(--maan-ld);"
              />
              <h3 class="maan-card-title mt-3 text-base">
                بياناتكم آمنة
              </h3>
              <p class="maan-card-body mt-1.5 text-sm">
                الرسائل مشفرة ولا يتم مشاركتها.
              </p>
            </div>
          </div>

          <div class="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/97332055666?text=%D8%A3%D9%88%D8%AF%20%D8%A7%D8%B3%D8%AA%D8%B4%D8%A7%D8%B1%D8%A9%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%B7%D9%81%D9%84%D9%8A"
              target="_blank"
              rel="noopener noreferrer"
              class="maan-cta-btn"
            >
              <UIcon
                name="i-lucide-message-circle"
                class="size-5"
              />
              <span>دردشة واتساب</span>
            </a>
            <NuxtLink
              to="/ar/blog"
              class="maan-ghost-btn"
            >
              <UIcon
                name="i-lucide-book-open"
                class="size-5"
              />
              <span>المرجع العلمي</span>
            </NuxtLink>
            <NuxtLink
              to="/ar"
              class="maan-ghost-btn"
            >
              <UIcon
                name="i-lucide-home"
                class="size-5"
              />
              <span>الرئيسية</span>
            </NuxtLink>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>
