<script setup lang="ts">
const { getPageSeo, getPosts } = useMaanContent()
const { getFormBlockById } = useMaanForms()

const { data: posts } = await useAsyncData<MaanPost[]>('maan-home-posts', async () => {
  const items = await getPosts()

  return items.slice(0, 3)
}, {
  default: () => []
})
const { data: pageSeo } = await useAsyncData<MaanSeo>('maan-page-seo-home', () => getPageSeo('/', {
  title: 'Maan Special Education Center',
  description: 'Maan Special Education Center provides individualized learning, therapy, and family support for children with diverse needs.'
}))
const { data: resourcesForm } = await useAsyncData<MaanFormBlock | undefined>('maan-home-resources-form', () => getFormBlockById('1419faec-e263-431c-bd5f-a57f394c39f6'))

const services = [
  {
    icon: 'i-lucide-clipboard-check',
    title: 'Individualized Education Plans',
    description: 'Assessment-led goals, classroom strategies, and progress reviews built around each learner.'
  },
  {
    icon: 'i-lucide-message-circle-heart',
    title: 'Speech and Communication',
    description: 'Practical communication support for spoken language, social interaction, and assisted communication.'
  },
  {
    icon: 'i-lucide-hand-heart',
    title: 'Occupational Therapy',
    description: 'Fine motor, sensory regulation, and daily living support that helps children participate with confidence.'
  },
  {
    icon: 'i-lucide-users',
    title: 'Family Guidance',
    description: 'Parent meetings, home routines, and shared strategies so support continues beyond the center.'
  }
]

const pathways = [
  'Early assessment and intake',
  'Individual learning plan',
  'Therapy and classroom support',
  'Progress review with families'
]

const resolvedSeo = useMaanSeo({
  seo: pageSeo.value || undefined,
  fallback: {
    title: 'Maan Special Education Center',
    description: 'Maan Special Education Center provides individualized learning, therapy, and family support for children with diverse needs.'
  },
  ogFallback: {
    title: 'Learning support shaped around every child.',
    description: 'Individualized education, therapy, and family support for children with diverse learning needs.',
    eyebrow: 'Special Education Center',
    locale: 'en'
  }
})

useSchemaOrg([
  defineWebPage({
    name: resolvedSeo.title,
    description: resolvedSeo.description,
    inLanguage: 'en'
  }),
  defineItemList({
    name: 'Special education and therapy support',
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': service.title,
      'description': service.description
    }))
  })
])
</script>

<template>
  <div class="maan-page">
    <section class="maan-hero border-b border-default">
      <UContainer class="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div class="max-w-3xl">
          <UBadge
            color="primary"
            variant="subtle"
            class="mb-5"
          >
            Special Education Center
          </UBadge>
          <h1 class="maan-hero-title text-5xl font-semibold text-highlighted sm:text-6xl">
            Learning support shaped around every child.
          </h1>
          <p class="maan-hero-copy mt-6 max-w-2xl text-lg leading-8 text-muted">
            Maan Special Education Center helps children build communication, independence, social confidence, and academic readiness through individualized plans and coordinated therapy.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              to="#programs"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
            >
              Explore programs
            </UButton>
            <UButton
              to="/blog"
              color="neutral"
              variant="subtle"
              size="xl"
              icon="i-lucide-book-open"
            >
              Read the blog
            </UButton>
          </div>
        </div>

        <div class="maan-garden-visual">
          <div class="maan-photo-card">
            <img
              src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Autistic_children_receiving_individual_education_in_special_classes_%28FL63605208%29.jpg"
              alt="A teacher supporting children during individual education activities"
            >
          </div>
          <div class="maan-path-card">
            Practice
          </div>
          <div class="maan-path-card">
            Repeat
          </div>
          <div class="maan-note-card">
            <p class="text-sm font-medium text-highlighted">
              Coordinated care team
            </p>
            <p class="mt-1 text-sm leading-6 text-muted">
              Educators, therapists, and families work from one shared plan.
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <UPageSection
      id="programs"
      class="maan-programs"
      title="Programs built for steady progress"
      description="A focused set of education and therapy services designed around each child’s strengths, needs, and daily routines."
      :features="services"
    />

    <section class="maan-section-band border-y border-default">
      <UContainer class="grid gap-10 py-16 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div>
          <UBadge
            color="secondary"
            variant="subtle"
            class="mb-4"
          >
            How Support Works
          </UBadge>
          <h2 class="text-3xl font-semibold text-highlighted sm:text-4xl">
            Clear steps for families from intake to progress review.
          </h2>
          <p class="mt-5 text-base leading-7 text-muted">
            The center keeps support practical and collaborative, with goals that can be understood by teachers, therapists, and caregivers.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="(pathway, index) in pathways"
            :key="pathway"
            class="maan-garden-card p-6"
          >
            <div class="maan-step-number mb-5 flex size-10 items-center justify-center text-sm font-semibold">
              {{ index + 1 }}
            </div>
            <h3 class="text-lg font-semibold text-highlighted">
              {{ pathway }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-muted">
              Practical next steps, shared notes, and measurable goals keep the plan moving.
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-16 sm:py-20">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <UBadge
            color="primary"
            variant="subtle"
            class="mb-4"
          >
            Latest Articles
          </UBadge>
          <h2 class="text-3xl font-semibold text-highlighted">
            Guidance for everyday support
          </h2>
        </div>
        <UButton
          to="/blog"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-arrow-right"
        >
          View all
        </UButton>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <article
          v-for="post in posts"
          :key="post.slug"
          class="maan-garden-card group p-6 transition hover:-translate-y-1"
        >
          <UBadge
            color="neutral"
            variant="soft"
          >
            {{ post.category }}
          </UBadge>
          <h3 class="mt-5 text-xl font-semibold leading-7 text-highlighted">
            <NuxtLink :to="`/blog/${post.slug}`">
              {{ post.title }}
            </NuxtLink>
          </h3>
          <p class="mt-3 line-clamp-3 text-sm leading-6 text-muted">
            {{ post.description }}
          </p>
          <div class="mt-6 flex items-center justify-between text-sm text-muted">
            <NuxtTime
              :datetime="post.publishedAt"
              month="short"
              day="numeric"
            />
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 text-primary transition group-hover:translate-x-1"
            />
          </div>
        </article>
      </div>
    </UContainer>

    <MaanDirectusForm
      :block="resourcesForm"
      locale="en"
    />

    <UPageSection class="maan-cta-section">
      <UPageCTA
        title="Start with a conversation about your child’s needs."
        description="Maan can help families understand the next practical step, from initial assessment to an individualized support plan."
        variant="subtle"
        :links="[{
          label: 'Contact the center',
          to: '/contact',
          icon: 'i-lucide-mail',
          color: 'primary'
        }, {
          label: 'Read family resources',
          to: '/blog',
          icon: 'i-lucide-book-open',
          color: 'neutral',
          variant: 'outline'
        }]"
      />
    </UPageSection>
  </div>
</template>
