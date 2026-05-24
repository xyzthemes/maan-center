<script setup lang="ts">
// Phase 8 — Post-submission thank-you page.
// The contact form `onSuccess: 'redirect'` sends here.

useSeoMeta({
  title: 'Thank you — Maan Special Education Center',
  description: 'Your enquiry has been received. The Maan team will follow up within one working day.',
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
          <span class="maan-eyebrow maan-eyebrow--down">Enquiry received</span>
          <h1 class="maan-hero-title mt-4 text-3xl font-bold sm:text-4xl">
            Thank you — we’ve received your enquiry.
          </h1>
          <p class="maan-hero-copy mx-auto mt-5 max-w-xl text-lg">
            A specialist from our team will follow up within one working day. If your question is
            urgent, you can reach us instantly on WhatsApp.
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
                Within one working day
              </h3>
              <p class="maan-card-body mt-1.5 text-sm">
                We’ll review your message and reply with the recommended next step.
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
                A real specialist will call
              </h3>
              <p class="maan-card-body mt-1.5 text-sm">
                We use voice or WhatsApp depending on your preference.
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
                Your data stays private
              </h3>
              <p class="maan-card-body mt-1.5 text-sm">
                Submissions are encrypted and never shared.
              </p>
            </div>
          </div>

          <div class="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/97332055666?text=I%20would%20like%20a%20consultation%20about%20my%20child"
              target="_blank"
              rel="noopener noreferrer"
              class="maan-cta-btn"
            >
              <UIcon
                name="i-lucide-message-circle"
                class="size-5"
              />
              <span>Chat on WhatsApp</span>
            </a>
            <NuxtLink
              to="/blog"
              class="maan-ghost-btn"
            >
              <UIcon
                name="i-lucide-book-open"
                class="size-5"
              />
              <span>Read the Scientific Reference</span>
            </NuxtLink>
            <NuxtLink
              to="/"
              class="maan-ghost-btn"
            >
              <UIcon
                name="i-lucide-home"
                class="size-5"
              />
              <span>Back to homepage</span>
            </NuxtLink>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>
