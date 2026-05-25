<script setup lang="ts">
const groups = useMaanSocialLinks()

useSeoMeta({
  title: 'Connect with Maan — All Channels | Maan Special Education Center',
  description: 'Find every Maan Special Education Center channel in one place — WhatsApp, Instagram, Facebook, YouTube, LinkedIn, and Dr. Osama Madbooly’s personal and outreach accounts.'
})

useSchemaOrg([
  defineWebPage({
    name: 'Connect with Maan',
    description: 'All official social, messaging, and outreach channels for Maan Special Education Center and Dr. Osama Madbooly.',
    inLanguage: 'en'
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Connect', item: '/connect' }
    ]
  })
])
</script>

<template>
  <div class="maan-page">
    <section class="maan-hero border-b">
      <UContainer class="py-14 sm:py-20">
        <div class="mx-auto max-w-3xl text-center">
          <span class="maan-eyebrow">
            <UIcon
              name="i-lucide-share-2"
              class="size-3.5"
            />
            Connect
          </span>
          <h1 class="maan-hero-title mt-5 text-4xl font-bold sm:text-5xl">
            Every way to reach Maan.
          </h1>
          <p class="maan-hero-copy mx-auto mt-5 max-w-2xl text-lg">
            The center’s official channels, Dr. Osama Madbooly’s personal voice,
            and the specialist communities he runs around Down syndrome,
            autism, learning difficulties, and rare conditions.
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <NuxtLink
              to="/contact"
              class="maan-cta-btn"
            >
              <UIcon
                name="i-lucide-calendar-check"
                class="size-5"
              />
              <span>Book an assessment</span>
            </NuxtLink>
            <a
              href="https://wa.me/97332055666?text=I%20would%20like%20a%20consultation%20about%20my%20child"
              target="_blank"
              rel="noopener noreferrer"
              class="maan-ghost-btn"
            >
              <UIcon
                name="i-lucide-message-circle"
                class="size-5"
              />
              <span>WhatsApp chat</span>
            </a>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <MaanSocialGrid
        :groups="groups"
        locale="en"
      />
    </UContainer>
  </div>
</template>
