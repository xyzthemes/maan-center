<script setup lang="ts">
const { getPageSeo, getPosts } = useMaanContent()
const { getFormBlockById } = useMaanForms()

const { data: posts } = await useAsyncData<MaanPost[]>('maan-home-posts', async () => {
  // Layer 1 — only surface posts that admins explicitly placed here.
  // Fallback: when zero are tagged, show the latest published instead so
  // the homepage isn't visibly empty during the transition window.
  const featured = await getPosts('en', { placement: 'homepage-featured', limit: 3 })
  if (featured.length) return featured
  const items = await getPosts()
  return items.slice(0, 3)
}, {
  default: () => []
})
const { data: pageSeo } = await useAsyncData<MaanSeo>('maan-page-seo-home', () => getPageSeo('/', {
  title: 'Maan Special Education Center | Bahrain',
  description: 'Maan Special Education Center in Bahrain — assessment, individualized education plans, and integrated therapy for autism spectrum, Down syndrome, and learning difficulties.'
}))
const { data: resourcesForm } = await useAsyncData<MaanFormBlock | undefined>('maan-home-resources-form', () => getFormBlockById('1419faec-e263-431c-bd5f-a57f394c39f6'))

// ────────────────────────────────────────────────────────────────────
const programs = [
  {
    variant: 'autism' as const,
    icon: 'i-lucide-puzzle',
    title: 'Autism Spectrum Programs',
    description: 'Behavior modification, alternative communication, and graduated inclusion within a science-based individual plan.',
    to: '/programs/autism',
    ctaLabel: 'Explore program'
  },
  {
    variant: 'down' as const,
    icon: 'i-lucide-heart-handshake',
    title: 'Down Syndrome Programs',
    description: 'Early intervention, Portage-based motor support, and muscle strengthening focused on daily independence.',
    to: '/programs/down-syndrome',
    ctaLabel: 'Explore program'
  },
  {
    variant: 'ld' as const,
    icon: 'i-lucide-book-open-check',
    title: 'Learning Difficulties Programs',
    description: 'Reading and writing support, academic skills development, and visual-first advanced arithmetic.',
    to: '/programs/learning-difficulties',
    ctaLabel: 'Explore program'
  }
]

const assessmentTools = [
  { icon: 'i-lucide-clipboard-check', name: 'CARS Scale', desc: 'Structured assessment of autism spectrum trait intensity in children.' },
  { icon: 'i-lucide-list-checks', name: 'GILLIAM Scale', desc: 'Widely used screening tool for behavioral indicators of autism.' },
  { icon: 'i-lucide-brain', name: 'Intelligence Measures', desc: 'Standardized cognitive assessments to map strengths and learning needs.' }
]

const iepMethods = [
  { icon: 'i-lucide-target', name: 'Lovaas', desc: 'Intensive applied behavior analysis that builds skills step by step.' },
  { icon: 'i-lucide-grid-3x3', name: 'TEACCH', desc: 'Structured visual teaching that supports independence at school and home.' },
  { icon: 'i-lucide-baby', name: 'Portage', desc: 'Family-based early intervention rooted in observing the child in their environment.' }
]

const therapies = [
  { icon: 'i-lucide-message-circle-heart', name: 'Speech & Language', desc: 'Support for verbal, alternative, and social-language communication.' },
  { icon: 'i-lucide-hand-heart', name: 'Occupational Therapy', desc: 'Fine motor and daily-living skills development.' },
  { icon: 'i-lucide-waves', name: 'Sensory Integration', desc: 'Calibrating sensory input to improve attention and participation.' }
]

const whyUs = [
  { icon: 'i-lucide-shield-check', title: 'Accurate scientific assessment', desc: 'Internationally recognized tools and clear methodology before any plan.' },
  { icon: 'i-lucide-users-round', title: 'Multidisciplinary team', desc: 'Teachers, therapists, and specialists working from one shared plan.' },
  { icon: 'i-lucide-home', title: 'Family support every step', desc: 'Home plans and recurring reviews bridge the center and the home.' },
  { icon: 'i-lucide-sparkles', title: 'Calm, sensory-friendly space', desc: 'Environments designed to lower stimulation and ease focus.' }
]

const faqs = [
  { q: 'How long is a single session?', a: 'Sessions typically run 45–60 minutes. The exact duration is set after the initial assessment based on the child’s needs.' },
  { q: 'What age range does the center accept?', a: 'We support children from an early age through school-age. The assessment team determines the right service per age and need.' },
  { q: 'How does the assessment process begin?', a: 'It starts with a family meeting to gather context, followed by an observation session and applicable measures, then a written report and action plan.' },
  { q: 'What role does the family play in the plan?', a: 'The family is a core partner. We share goals and observations regularly and provide simplified home plans to reinforce progress.' },
  { q: 'How do I book an appointment?', a: 'Contact us via WhatsApp, phone, or the form below. Our team follows up within one working day.' }
]

const stats = [
  { value: '+100', label: 'Children supported' },
  { value: '+3,000', label: 'Therapy hours delivered' },
  { value: '+80', label: 'Families walked alongside' },
  { value: 'Years', label: 'Of specialist experience' }
]

const testimonials = [
  {
    quote: 'We found a team that listens to the family first. Our child’s plan became clear and doable at home.',
    attribution: 'Parent, Manama'
  },
  {
    quote: 'The continuous communication with therapists is what we needed — slow, steady progress.',
    attribution: 'Parent, Muharraq'
  },
  {
    quote: 'The space is calm and well-suited to our child. The difference was clear from the very first session.',
    attribution: 'Parent, Riffa'
  }
]

// Layer 2 — pull testimonial/FAQ/stat blocks from the DB if any are
// published; otherwise fall back to the typed arrays above. Each
// useAsyncData key is locale + type + placement-scoped so the SSR cache
// buckets don't collide with the Arabic homepage.
const { byType: getBlocks } = useMaanBlocks()

const { data: testimonialBlocks } = await useAsyncData(
  'home-testimonials-en',
  () => getBlocks<{ quote: string, attribution: string }>('testimonial', 'en', { placement: 'homepage-featured', limit: 6 }),
  { default: () => [] }
)
const resolvedTestimonials = computed(() =>
  testimonialBlocks.value.length
    ? testimonialBlocks.value.map(b => ({ quote: b.payload.quote, attribution: b.payload.attribution }))
    : testimonials
)

const { data: faqBlocks } = await useAsyncData(
  'home-faq-en',
  () => getBlocks<{ q: string, a: string }>('faq_item', 'en', { placement: 'homepage-featured', limit: 10 }),
  { default: () => [] }
)
const resolvedFaqs = computed(() =>
  faqBlocks.value.length
    ? faqBlocks.value.map(b => ({ q: b.payload.q, a: b.payload.a }))
    : faqs
)

const { data: statBlocks } = await useAsyncData(
  'home-stats-en',
  () => getBlocks<{ value: string, label: string }>('stat_tile', 'en', { placement: 'homepage-featured', limit: 8 }),
  { default: () => [] }
)
// Precedence: SiteSetting `stats` (singleton) → Layer-2 stat_tile blocks
// → hardcoded fallback array. The singleton wins because it's the
// canonical "four numbers" surface; the block path is here for future
// flexibility.
const resolvedStats = computed(() => {
  if (statsFromSettings.value) return statsFromSettings.value
  if (statBlocks.value.length) return statBlocks.value.map(b => ({ value: b.payload.value, label: b.payload.label }))
  return stats
})

// Layer 3 — All admin-editable singletons the EN homepage needs:
// mission/vision, Dr Osama bio, stats list. One batched fetch keeps the
// SSR cache to a single key per locale. Empty values let downstream
// components fall back to their structural copy.
type HomeSettings = {
  'mission-vision'?: { value: { mission?: string, vision?: string } } | null
  'dr-osama-bio'?: { value: { name?: string, headline?: string, bio?: string, tags?: string[] } } | null
  'stats'?: { value: { items?: Array<{ value: string, label: string }> } } | null
}
const { getMany: getSettings } = useMaanSettings()
const { data: homeSettings } = await useAsyncData<HomeSettings>(
  'home-settings-en',
  () => getSettings(['mission-vision', 'dr-osama-bio', 'stats'], 'en') as Promise<HomeSettings>,
  { default: (): HomeSettings => ({}) }
)
const missionVision = computed(() => {
  const v = homeSettings.value['mission-vision']?.value
  return {
    mission: v?.mission || '',
    vision: v?.vision || ''
  }
})
const drOsamaBio = computed(() => {
  const v = homeSettings.value['dr-osama-bio']?.value
  return {
    name: v?.name || '',
    headline: v?.headline || '',
    bio: v?.bio || '',
    tags: Array.isArray(v?.tags) ? v.tags : []
  }
})
// Stats singleton — takes precedence over Layer-2 stat_tile blocks. A
// single setting row is the right shape for "the four numbers at the
// top of the homepage"; blocks remain useful if admins want a more
// modular structure later.
const statsFromSettings = computed(() => {
  const items = homeSettings.value.stats?.value?.items
  return Array.isArray(items) && items.length ? items : null
})

const resolvedSeo = useMaanSeo({
  seo: pageSeo.value || undefined,
  fallback: {
    title: 'Maan Special Education Center | Bahrain',
    description: 'Assessment, individualized plans, and integrated therapy for children with autism spectrum disorder, Down syndrome, and learning difficulties — in Bahrain.'
  },
  ogFallback: {
    title: 'Learning support shaped around every child.',
    description: 'Science-based assessment, individualized education plans, and integrated therapy.',
    eyebrow: 'Maan Special Education Center',
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
    name: 'Maan Special Education Center — programs',
    itemListElement: programs.map((p, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': p.title,
      'description': p.description
    }))
  })
])
</script>

<template>
  <div class="maan-page">
    <!-- HERO -->
    <section class="maan-hero border-b">
      <UContainer class="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div class="max-w-3xl">
          <span class="maan-eyebrow">
            <UIcon
              name="i-lucide-sparkles"
              class="size-3.5"
            />
            Special Education Center in Bahrain
          </span>
          <h1 class="maan-hero-title mt-5 text-4xl font-bold sm:text-5xl lg:text-6xl">
            Learning and therapy shaped around every child.
          </h1>
          <p class="maan-hero-copy mt-6 max-w-2xl text-lg">
            Maan Special Education Center delivers accurate assessment, individualized education plans,
            and integrated therapy for children with autism spectrum disorder, Down syndrome, and
            learning difficulties — in a calm space that respects each child’s pace.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
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
              <span>Chat on WhatsApp</span>
            </a>
          </div>
          <div
            class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
            style="color: var(--maan-ink-muted);"
          >
            <span class="inline-flex items-center gap-1.5">
              <UIcon
                name="i-lucide-shield-check"
                class="size-4"
                style="color: var(--maan-down);"
              />
              Accurate scientific assessment
            </span>
            <span class="inline-flex items-center gap-1.5">
              <UIcon
                name="i-lucide-users-round"
                class="size-4"
                style="color: var(--maan-autism);"
              />
              Multidisciplinary team
            </span>
            <span class="inline-flex items-center gap-1.5">
              <UIcon
                name="i-lucide-heart"
                class="size-4"
                style="color: var(--maan-cta);"
              />
              Full family support
            </span>
          </div>
        </div>

        <MaanHeroVisual locale="en" />
      </UContainer>
    </section>

    <!-- STATS -->
    <section
      class="border-b"
      style="border-color: var(--maan-line);"
    >
      <UContainer class="py-10 sm:py-14">
        <MaanStats :items="resolvedStats" />
        <p
          class="mt-4 text-center text-xs"
          style="color: var(--maan-ink-muted);"
        >
          <!-- TODO_IMPLEMENTATION_REFERENCES: replace with audited figures. -->
          Figures are estimates pending administration confirmation.
        </p>
      </UContainer>
    </section>

    <!-- PROGRAMS -->
    <section
      id="programs"
      class="maan-section"
    >
      <UContainer>
        <div class="mx-auto max-w-2xl text-center">
          <span class="maan-eyebrow">Three programs</span>
          <h2 class="maan-h2 mt-4">
            Three specialty areas — one plan designed around your child.
          </h2>
          <p class="maan-lead mx-auto mt-4">
            Start from the program closest to your child’s needs. Each is led by a specialist team and
            built on a careful scientific assessment.
          </p>
        </div>
        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <MaanProgramCard
            v-for="p in programs"
            :key="p.to"
            v-bind="p"
            locale="en"
          />
        </div>
      </UContainer>
    </section>

    <!-- ASSESSMENT -->
    <section class="maan-band maan-band--autism">
      <UContainer class="maan-section grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div>
          <span class="maan-eyebrow">Initial assessment & intake</span>
          <h2 class="maan-h2 mt-4">
            We start by understanding your child before suggesting any plan.
          </h2>
          <p class="maan-lead mt-4">
            We use internationally recognized measures to draw an accurate picture of strengths and needs,
            then share it with the family in a clear written report.
          </p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="tool in assessmentTools"
            :key="tool.name"
            class="maan-card"
          >
            <div class="maan-card-icon">
              <UIcon
                :name="tool.icon"
                class="size-5"
              />
            </div>
            <h3 class="maan-card-title">
              {{ tool.name }}
            </h3>
            <p class="maan-card-body mt-2">
              {{ tool.desc }}
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- IEP METHODS -->
    <section class="maan-section">
      <UContainer>
        <div class="mx-auto max-w-2xl text-center">
          <span class="maan-eyebrow maan-eyebrow--ld">Individualized Education Plan (IEP)</span>
          <h2 class="maan-h2 mt-4">
            Established methodologies behind every plan.
          </h2>
          <p class="maan-lead mx-auto mt-4">
            We build each IEP on internationally recognized methodologies, choosing the tools
            that best fit your child’s profile.
          </p>
        </div>
        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <div
            v-for="m in iepMethods"
            :key="m.name"
            class="maan-card"
          >
            <div class="maan-card-icon maan-card-icon--ld">
              <UIcon
                :name="m.icon"
                class="size-6"
              />
            </div>
            <h3 class="maan-card-title">
              {{ m.name }}
            </h3>
            <p class="maan-card-body mt-2">
              {{ m.desc }}
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- THERAPIES -->
    <section class="maan-band maan-band--down">
      <UContainer class="maan-section">
        <div class="mx-auto max-w-2xl text-center">
          <span class="maan-eyebrow maan-eyebrow--down">Therapeutic & educational support</span>
          <h2 class="maan-h2 mt-4">
            Specialist sessions that reinforce the individualized plan.
          </h2>
        </div>
        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <div
            v-for="t in therapies"
            :key="t.name"
            class="maan-card"
          >
            <div class="maan-card-icon maan-card-icon--down">
              <UIcon
                :name="t.icon"
                class="size-6"
              />
            </div>
            <h3 class="maan-card-title">
              {{ t.name }}
            </h3>
            <p class="maan-card-body mt-2">
              {{ t.desc }}
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- FAMILY PROGRESS -->
    <section class="maan-section">
      <UContainer class="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <span class="maan-eyebrow">Digital family follow-up</span>
          <h2 class="maan-h2 mt-4">
            A digital home plan delivered on a regular cadence.
          </h2>
          <p class="maan-lead mt-4">
            We translate team observations and session goals into a readable, doable home plan
            shared with you on a recurring schedule, so progress continues between sessions.
          </p>
          <ul
            class="mt-6 space-y-3 text-sm"
            style="color: var(--maan-ink);"
          >
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="size-5 mt-0.5"
                style="color: var(--maan-down);"
              />
              <span>Written report after each review</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="size-5 mt-0.5"
                style="color: var(--maan-down);"
              />
              <span>Illustrated, doable home exercises</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="size-5 mt-0.5"
                style="color: var(--maan-down);"
              />
              <span>Clear channels to reach the follow-up team</span>
            </li>
          </ul>
        </div>
        <div class="maan-card p-2">
          <div
            class="rounded-xl p-6"
            style="background: linear-gradient(135deg, var(--maan-autism-soft), var(--maan-down-soft));"
          >
            <div class="grid gap-3">
              <div class="rounded-lg bg-white/80 p-4 shadow-sm">
                <p
                  class="text-xs font-semibold"
                  style="color: var(--maan-autism);"
                >
                  Week 12
                </p>
                <p
                  class="mt-1 font-semibold"
                  style="color: var(--maan-ink);"
                >
                  Alternative communication
                </p>
                <p
                  class="mt-1 text-xs"
                  style="color: var(--maan-ink-muted);"
                >
                  4 home sessions / 10 minutes
                </p>
              </div>
              <div class="rounded-lg bg-white/80 p-4 shadow-sm">
                <p
                  class="text-xs font-semibold"
                  style="color: var(--maan-down);"
                >
                  Motor skills
                </p>
                <p
                  class="mt-1 font-semibold"
                  style="color: var(--maan-ink);"
                >
                  Pencil grip strengthening
                </p>
                <p
                  class="mt-1 text-xs"
                  style="color: var(--maan-ink-muted);"
                >
                  3 daily, doable exercises
                </p>
              </div>
              <div class="rounded-lg bg-white/80 p-4 shadow-sm">
                <p
                  class="text-xs font-semibold"
                  style="color: var(--maan-ld);"
                >
                  Team notes
                </p>
                <p
                  class="mt-1 font-semibold"
                  style="color: var(--maan-ink);"
                >
                  Noticeable focus improvement
                </p>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- DR OSAMA -->
    <section
      id="about-dr-osama"
      class="maan-section maan-band"
    >
      <UContainer>
        <MaanDrOsamaCard
          locale="en"
          :name="drOsamaBio.name"
          :headline="drOsamaBio.headline"
          :bio="drOsamaBio.bio"
          :tags="drOsamaBio.tags"
        />
      </UContainer>
    </section>

    <!-- WHY MAAN -->
    <section class="maan-section">
      <UContainer>
        <div class="mx-auto max-w-2xl text-center">
          <span class="maan-eyebrow maan-eyebrow--cta">Why Maan?</span>
          <h2 class="maan-h2 mt-4">
            A trusted reference for families looking for real support.
          </h2>
        </div>
        <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="w in whyUs"
            :key="w.title"
            class="maan-card"
          >
            <div class="maan-card-icon">
              <UIcon
                :name="w.icon"
                class="size-6"
              />
            </div>
            <h3 class="maan-card-title">
              {{ w.title }}
            </h3>
            <p class="maan-card-body mt-2">
              {{ w.desc }}
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- MISSION & VISION -->
    <section class="maan-section maan-band maan-band--autism">
      <UContainer>
        <MaanMissionVision
          locale="en"
          :mission="missionVision.mission"
          :vision="missionVision.vision"
        />
      </UContainer>
    </section>

    <!-- TESTIMONIALS -->
    <section class="maan-section">
      <UContainer>
        <div class="mx-auto max-w-2xl text-center">
          <span class="maan-eyebrow">Family stories</span>
          <h2 class="maan-h2 mt-4">
            Words from families who walked the journey with us.
          </h2>
          <p class="maan-lead mx-auto mt-4">
            We share parent reflections only — never any data about children — out of respect for their privacy.
          </p>
        </div>
        <div class="mt-10">
          <MaanTestimonials :items="resolvedTestimonials" />
        </div>
      </UContainer>
    </section>

    <!-- LATEST ARTICLES -->
    <section class="maan-section maan-band maan-band--ld">
      <UContainer>
        <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span class="maan-eyebrow maan-eyebrow--ld">Comprehensive Scientific Reference</span>
            <h2 class="maan-h2 mt-4">
              Maan’s Empowerment Guide
            </h2>
            <p class="maan-lead mt-3">
              Articles and guides from our team for families and educators.
            </p>
          </div>
          <NuxtLink
            to="/blog"
            class="maan-ghost-btn"
          >
            <span>View all</span>
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4"
            />
          </NuxtLink>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <article
            v-for="post in posts"
            :key="post.slug"
            class="maan-card group"
          >
            <UBadge
              color="primary"
              variant="subtle"
            >
              {{ post.category }}
            </UBadge>
            <h3 class="maan-card-title mt-4">
              <NuxtLink
                :to="`/blog/${post.slug}`"
                class="hover:underline"
              >
                {{ post.title }}
              </NuxtLink>
            </h3>
            <p class="maan-card-body mt-2 line-clamp-3">
              {{ post.description }}
            </p>
            <div
              class="mt-5 flex items-center justify-between text-xs"
              style="color: var(--maan-ink-muted);"
            >
              <NuxtTime
                :datetime="post.publishedAt"
                month="short"
                day="numeric"
              />
              <span
                class="inline-flex items-center gap-1 font-semibold"
                style="color: var(--maan-autism);"
              >
                Read article
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </article>
        </div>
      </UContainer>
    </section>

    <!-- FAQ -->
    <section class="maan-section">
      <UContainer class="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div class="lg:sticky lg:top-28">
          <span class="maan-eyebrow">Frequently Asked</span>
          <h2 class="maan-h2 mt-4">
            Quick answers to common parent questions.
          </h2>
          <p class="maan-lead mt-4">
            Couldn’t find your answer? Reach out on WhatsApp — we’ll reply within one working day.
          </p>
        </div>
        <MaanFaq :items="resolvedFaqs" />
      </UContainer>
    </section>

    <!-- RESOURCES FORM (existing CMS-backed) -->
    <MaanForm
      :block="resourcesForm"
      locale="en"
    />

    <!-- FINAL CTA -->
    <section class="maan-section maan-band">
      <UContainer>
        <div class="maan-card mx-auto max-w-4xl p-8 text-center sm:p-12">
          <h2 class="maan-h2">
            Start your child’s journey with Maan.
          </h2>
          <p class="maan-lead mx-auto mt-4">
            One step away from a thoughtful assessment and a plan built for your child.
            Pick the channel that suits you.
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
              <span>Book an assessment now</span>
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
            <a
              href="tel:+97332055666"
              class="maan-ghost-btn"
            >
              <UIcon
                name="i-lucide-phone"
                class="size-5"
              />
              <span dir="ltr">+973 3205 5666</span>
            </a>
          </div>
          <p
            class="mt-6 text-xs"
            style="color: var(--maan-ink-muted);"
          >
            Your data is encrypted, secure, and never shared.
          </p>
        </div>
      </UContainer>
    </section>

    <!-- CAREERS -->
    <section
      id="careers"
      class="maan-section"
    >
      <UContainer>
        <div class="maan-card flex flex-col items-center gap-3 p-8 text-center sm:p-10">
          <span class="maan-eyebrow maan-eyebrow--down">Join us</span>
          <h2 class="maan-h2">
            Careers & Volunteers
          </h2>
          <p class="maan-lead">
            We welcome specialists, educators, and volunteers passionate about supporting children
            with diverse needs. Reach out and we’ll share open opportunities.
          </p>
          <NuxtLink
            to="/contact"
            class="maan-cta-btn mt-2"
          >
            <UIcon
              name="i-lucide-send"
              class="size-5"
            />
            <span>Send your CV</span>
          </NuxtLink>
        </div>
      </UContainer>
    </section>
  </div>
</template>
