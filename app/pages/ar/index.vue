<script setup lang="ts">
const { getPageSeo, getPosts } = useMaanContent()

const { data: posts } = await useAsyncData<MaanPost[]>('maan-home-posts-ar', async () => {
  const items = await getPosts('ar')

  return items.slice(0, 3)
}, {
  default: () => []
})
const { data: pageSeo } = await useAsyncData<MaanSeo>('maan-page-seo-home-ar', () => getPageSeo('/ar', {
  title: 'مركز معاً للتربية الخاصة | البحرين',
  description: 'مركز معاً للتربية الخاصة في البحرين — تقييم وخطط فردية وجلسات علاجية للأطفال ذوي اضطراب طيف التوحد ومتلازمة داون وصعوبات التعلم.'
}))

// ────────────────────────────────────────────────────────────────────
// Programs — three areas of expertise
// ────────────────────────────────────────────────────────────────────
const programs = [
  {
    variant: 'autism' as const,
    icon: 'i-lucide-puzzle',
    title: 'برامج اضطراب طيف التوحد',
    description: 'تعديل سلوك، تواصل بديل، ودمج تدريجي ضمن خطة فردية مبنية على التقييم العلمي.',
    to: '/ar/programs/autism',
    ctaLabel: 'استكشف البرنامج'
  },
  {
    variant: 'down' as const,
    icon: 'i-lucide-heart-handshake',
    title: 'برامج متلازمة داون',
    description: 'تدخل مبكر، دعم حركي وفق بورتاج، وتقوية عضلية تركز على الاستقلالية اليومية.',
    to: '/ar/programs/down-syndrome',
    ctaLabel: 'استكشف البرنامج'
  },
  {
    variant: 'ld' as const,
    icon: 'i-lucide-book-open-check',
    title: 'برامج صعوبات التعلم',
    description: 'دعم القراءة والكتابة، تطوير المهارات الأكاديمية، والحساب المتقدم بأدوات مرئية.',
    to: '/ar/programs/learning-difficulties',
    ctaLabel: 'استكشف البرنامج'
  }
]

// ────────────────────────────────────────────────────────────────────
// Assessment tools — CARS / GILLIAM / Intelligence measures
// ────────────────────────────────────────────────────────────────────
const assessmentTools = [
  { icon: 'i-lucide-clipboard-check', name: 'مقياس CARS', desc: 'تقييم منظم لشدة سمات طيف التوحد لدى الأطفال.' },
  { icon: 'i-lucide-list-checks', name: 'مقياس GILLIAM', desc: 'أداة فحص شائعة لرصد المؤشرات السلوكية لاضطراب التوحد.' },
  { icon: 'i-lucide-brain', name: 'مقاييس الذكاء', desc: 'تقييمات معرفية موحدة لفهم نقاط القوة والاحتياجات الأكاديمية.' }
]

// ────────────────────────────────────────────────────────────────────
// IEP methodologies — Lovaas / TEACCH / Portage
// ────────────────────────────────────────────────────────────────────
const iepMethods = [
  { icon: 'i-lucide-target', name: 'Lovaas', desc: 'تحليل سلوكي تطبيقي مكثف يبني المهارات خطوة بخطوة.' },
  { icon: 'i-lucide-grid-3x3', name: 'TEACCH', desc: 'تعليم بصري منظم يدعم الاستقلالية في الصف والمنزل.' },
  { icon: 'i-lucide-baby', name: 'Portage', desc: 'برنامج تدخل مبكر للأسرة يعتمد على ملاحظة الطفل في بيئته.' }
]

// ────────────────────────────────────────────────────────────────────
// Therapies
// ────────────────────────────────────────────────────────────────────
const therapies = [
  { icon: 'i-lucide-message-circle-heart', name: 'علاج النطق واللغة', desc: 'دعم التواصل اللفظي والبديل ومهارات اللغة الاجتماعية.' },
  { icon: 'i-lucide-hand-heart', name: 'العلاج الوظيفي', desc: 'تنمية المهارات الحركية الدقيقة ومهارات الحياة اليومية.' },
  { icon: 'i-lucide-waves', name: 'التكامل الحسي', desc: 'تنظيم المدخلات الحسية لتحسين الانتباه والمشاركة.' }
]

// ────────────────────────────────────────────────────────────────────
// Why us
// ────────────────────────────────────────────────────────────────────
const whyUs = [
  { icon: 'i-lucide-shield-check', title: 'تقييم علمي دقيق', desc: 'أدوات معتمدة دولياً ومنهجية واضحة قبل أي خطة.' },
  { icon: 'i-lucide-users-round', title: 'فريق متعدد التخصصات', desc: 'معلمون ومعالجون وأخصائيون يعملون من خطة واحدة مشتركة.' },
  { icon: 'i-lucide-home', title: 'دعم الأسرة في كل خطوة', desc: 'خطط منزلية ومراجعات دورية تربط بين البيت والمركز.' },
  { icon: 'i-lucide-sparkles', title: 'بيئة هادئة ومناسبة حسياً', desc: 'مساحات مصممة لتقليل المثيرات وزيادة التركيز والراحة.' }
]

// ────────────────────────────────────────────────────────────────────
// FAQ
// ────────────────────────────────────────────────────────────────────
const faqs = [
  { q: 'كم تستغرق الجلسة الواحدة؟', a: 'تتراوح الجلسة عادة بين ٤٥ و٦٠ دقيقة، وتُحدد المدة بدقة بعد التقييم الأولي وفق احتياج الطفل.' },
  { q: 'ما الفئة العمرية التي يقبلها المركز؟', a: 'يستقبل المركز الأطفال من سن مبكرة وحتى مرحلة المدرسة. يحدد فريق التقييم الخدمة المناسبة لكل عمر.' },
  { q: 'كيف تبدأ عملية التقييم؟', a: 'تبدأ بلقاء مع الأسرة لجمع المعلومات، ثم جلسة ملاحظة وتطبيق المقاييس المناسبة، يليها تقرير وخطة عمل مكتوبة.' },
  { q: 'ما دور الأسرة في الخطة؟', a: 'الأسرة شريك أساسي. نشارككم الأهداف والملاحظات بانتظام، ونزودكم بخطط منزلية مبسطة لتعزيز ما يُنجز في المركز.' },
  { q: 'كيف أحجز موعداً؟', a: 'يمكنكم التواصل عبر واتساب أو الاتصال أو نموذج التواصل في الأسفل، وسيتابع معكم الفريق خلال يوم العمل.' }
]

// ────────────────────────────────────────────────────────────────────
// Stats — placeholder-safe (no fabricated specific numbers)
// TODO_IMPLEMENTATION_REFERENCES: replace ranges with audited figures.
// ────────────────────────────────────────────────────────────────────
const stats = [
  { value: '+١٠٠', label: 'طفل تم دعمه' },
  { value: '+٣٠٠٠', label: 'ساعة تدريبية' },
  { value: '+٨٠', label: 'أسرة مرافقة' },
  { value: 'سنوات', label: 'من الخبرة المتخصصة' }
]

// ────────────────────────────────────────────────────────────────────
// Testimonials — no children identified
// ────────────────────────────────────────────────────────────────────
const testimonials = [
  {
    quote: 'وجدنا في المركز فريقاً يصغي للأسرة قبل أي شيء. خطّة طفلنا أصبحت مفهومة وعملية في البيت.',
    attribution: 'أم من المنامة'
  },
  {
    quote: 'أحببنا التواصل المستمر مع المعالجين. التقدم بطيء وثابت، وهذا ما كنا نبحث عنه.',
    attribution: 'أب من المحرق'
  },
  {
    quote: 'البيئة هادئة جداً ومناسبة لطفلتي، وهذا الفرق كان واضحاً منذ الجلسة الأولى.',
    attribution: 'أم من الرفاع'
  }
]

const resolvedSeo = useMaanSeo({
  seo: pageSeo.value || undefined,
  fallback: {
    title: 'مركز معاً للتربية الخاصة | البحرين',
    description: 'مركز معاً للتربية الخاصة في البحرين — تقييم وخطط فردية وجلسات علاجية للأطفال ذوي اضطراب طيف التوحد ومتلازمة داون وصعوبات التعلم.'
  },
  ogFallback: {
    title: 'دعم تعليمي مصمم حول كل طفل.',
    description: 'تقييم علمي، خطط تعليمية فردية، وجلسات علاجية متكاملة.',
    eyebrow: 'مركز معاً للتربية الخاصة',
    locale: 'ar'
  }
})

useSchemaOrg([
  defineWebPage({
    name: resolvedSeo.title,
    description: resolvedSeo.description,
    inLanguage: 'ar'
  }),
  defineItemList({
    name: 'برامج التربية الخاصة في مركز معاً',
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
    <!-- ─────────── HERO ─────────── -->
    <section class="maan-hero border-b">
      <UContainer class="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div class="max-w-3xl">
          <span class="maan-eyebrow">
            <UIcon
              name="i-lucide-sparkles"
              class="size-3.5"
            />
            مركز للتربية الخاصة في البحرين
          </span>
          <h1 class="maan-hero-title mt-5 text-4xl font-bold sm:text-5xl lg:text-6xl">
            دعم تعليمي وعلاجي مصمم حول كل طفل.
          </h1>
          <p class="maan-hero-copy mt-6 max-w-2xl text-lg">
            في مركز معاً، نقدم تقييماً علمياً دقيقاً وخططاً تعليمية فردية وجلسات علاجية متكاملة
            للأطفال ذوي اضطراب طيف التوحد ومتلازمة داون وصعوبات التعلم — في بيئة هادئة تحترم
            احتياج كل طفل ووتيرته.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <NuxtLink
              to="/ar/contact"
              class="maan-cta-btn"
            >
              <UIcon
                name="i-lucide-calendar-check"
                class="size-5"
              />
              <span>احجز جلسة تقييم</span>
            </NuxtLink>
            <a
              href="https://wa.me/97332055666?text=%D8%A3%D9%88%D8%AF%20%D8%A7%D8%B3%D8%AA%D8%B4%D8%A7%D8%B1%D8%A9%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%B7%D9%81%D9%84%D9%8A"
              target="_blank"
              rel="noopener noreferrer"
              class="maan-ghost-btn"
            >
              <UIcon
                name="i-lucide-message-circle"
                class="size-5"
              />
              <span>تواصل عبر واتساب</span>
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
              تقييم علمي دقيق
            </span>
            <span class="inline-flex items-center gap-1.5">
              <UIcon
                name="i-lucide-users-round"
                class="size-4"
                style="color: var(--maan-autism);"
              />
              فريق متعدد التخصصات
            </span>
            <span class="inline-flex items-center gap-1.5">
              <UIcon
                name="i-lucide-heart"
                class="size-4"
                style="color: var(--maan-cta);"
              />
              مرافقة كاملة للأسرة
            </span>
          </div>
        </div>

        <MaanHeroVisual locale="ar" />
      </UContainer>
    </section>

    <!-- ─────────── STATS ─────────── -->
    <section
      class="border-b"
      style="border-color: var(--maan-line);"
    >
      <UContainer class="py-10 sm:py-14">
        <MaanStats :items="stats" />
        <p
          class="mt-4 text-center text-xs"
          style="color: var(--maan-ink-muted);"
        >
          <!-- TODO_IMPLEMENTATION_REFERENCES: replace with audited figures. -->
          الأرقام تقديرية حتى تأكيدها من الإدارة.
        </p>
      </UContainer>
    </section>

    <!-- ─────────── THREE PROGRAMS ─────────── -->
    <section
      id="programs"
      class="maan-section"
    >
      <UContainer>
        <div class="mx-auto max-w-2xl text-center">
          <span class="maan-eyebrow">برامجنا الثلاثة</span>
          <h2 class="maan-h2 mt-4">
            ثلاثة مجالات تخصصية، خطة واحدة مصممة لطفلك.
          </h2>
          <p class="maan-lead mx-auto mt-4">
            ابدأ من البرنامج الأقرب لاحتياج طفلك. كل برنامج يقوده فريق متخصص ويُبنى على
            التقييم العلمي قبل أي جلسة.
          </p>
        </div>
        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <MaanProgramCard
            v-for="p in programs"
            :key="p.to"
            v-bind="p"
            locale="ar"
          />
        </div>
      </UContainer>
    </section>

    <!-- ─────────── ASSESSMENT TOOLS ─────────── -->
    <section class="maan-band maan-band--autism">
      <UContainer class="maan-section grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div>
          <span class="maan-eyebrow">التقييم والاستقبال الأولي</span>
          <h2 class="maan-h2 mt-4">
            نبدأ بفهم طفلك قبل أن نقترح أي خطة.
          </h2>
          <p class="maan-lead mt-4">
            نستخدم مقاييس عالمية معتمدة لرسم صورة دقيقة لنقاط القوة والاحتياجات،
            ثم نشاركها مع الأسرة في تقرير واضح ولغة مفهومة.
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

    <!-- ─────────── IEP METHODOLOGIES ─────────── -->
    <section class="maan-section">
      <UContainer>
        <div class="mx-auto max-w-2xl text-center">
          <span class="maan-eyebrow maan-eyebrow--ld">الخطة التعليمية الفردية (IEP)</span>
          <h2 class="maan-h2 mt-4">
            مناهج علمية معتمدة لبناء كل خطة.
          </h2>
          <p class="maan-lead mx-auto mt-4">
            نبني الخطة الفردية بالاعتماد على مناهج معتمدة دولياً، ونختار من أدواتها
            ما يناسب احتياج طفلك بدقة.
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

    <!-- ─────────── THERAPIES ─────────── -->
    <section class="maan-band maan-band--down">
      <UContainer class="maan-section">
        <div class="mx-auto max-w-2xl text-center">
          <span class="maan-eyebrow maan-eyebrow--down">الدعم العلاجي والتعليمي</span>
          <h2 class="maan-h2 mt-4">
            جلسات متخصصة تعزز ما تبنيه الخطة الفردية.
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

    <!-- ─────────── FAMILY PROGRESS / DIGITIZED HOME PLAN ─────────── -->
    <section class="maan-section">
      <UContainer class="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <span class="maan-eyebrow">متابعة الأسرة الرقمية</span>
          <h2 class="maan-h2 mt-4">
            خطة منزلية رقمية تصلكم بانتظام.
          </h2>
          <p class="maan-lead mt-4">
            نحول ملاحظات الفريق وأهداف الجلسات إلى خطة منزلية قابلة للقراءة والتطبيق،
            ونشاركها معكم بصورة دورية حتى يستمر التقدم بين الجلسات.
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
              <span>تقرير مكتوب بعد كل مراجعة</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="size-5 mt-0.5"
                style="color: var(--maan-down);"
              />
              <span>تمارين منزلية مصورة وقابلة للتنفيذ</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="size-5 mt-0.5"
                style="color: var(--maan-down);"
              />
              <span>قنوات تواصل واضحة مع الفريق المتابع</span>
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
                  الأسبوع ١٢
                </p>
                <p
                  class="mt-1 font-semibold"
                  style="color: var(--maan-ink);"
                >
                  تمارين تواصل بديل
                </p>
                <p
                  class="mt-1 text-xs"
                  style="color: var(--maan-ink-muted);"
                >
                  ٤ جلسات منزلية / ١٠ دقائق
                </p>
              </div>
              <div class="rounded-lg bg-white/80 p-4 shadow-sm">
                <p
                  class="text-xs font-semibold"
                  style="color: var(--maan-down);"
                >
                  مهارات حركية
                </p>
                <p
                  class="mt-1 font-semibold"
                  style="color: var(--maan-ink);"
                >
                  تقوية القبضة الدقيقة
                </p>
                <p
                  class="mt-1 text-xs"
                  style="color: var(--maan-ink-muted);"
                >
                  ٣ تمارين قابلة للتنفيذ يومياً
                </p>
              </div>
              <div class="rounded-lg bg-white/80 p-4 shadow-sm">
                <p
                  class="text-xs font-semibold"
                  style="color: var(--maan-ld);"
                >
                  ملاحظات الفريق
                </p>
                <p
                  class="mt-1 font-semibold"
                  style="color: var(--maan-ink);"
                >
                  تحسن ملحوظ في الانتباه
                </p>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ─────────── DR OSAMA ─────────── -->
    <section
      id="about-dr-osama"
      class="maan-section maan-band"
    >
      <UContainer>
        <MaanDrOsamaCard locale="ar" />
      </UContainer>
    </section>

    <!-- ─────────── WHY MA'AN ─────────── -->
    <section class="maan-section">
      <UContainer>
        <div class="mx-auto max-w-2xl text-center">
          <span class="maan-eyebrow maan-eyebrow--cta">لماذا مركز معاً؟</span>
          <h2 class="maan-h2 mt-4">
            مرجع موثوق للأسر التي تبحث عن دعم حقيقي.
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

    <!-- ─────────── MISSION & VISION ─────────── -->
    <section class="maan-section maan-band maan-band--autism">
      <UContainer>
        <MaanMissionVision locale="ar" />
      </UContainer>
    </section>

    <!-- ─────────── TESTIMONIALS ─────────── -->
    <section class="maan-section">
      <UContainer>
        <div class="mx-auto max-w-2xl text-center">
          <span class="maan-eyebrow">قصص نجاح من الأسر</span>
          <h2 class="maan-h2 mt-4">
            تجارب أسر شاركونا الرحلة.
          </h2>
          <p class="maan-lead mx-auto mt-4">
            نشارك انطباعات الأسر فقط دون أي بيانات تخص الأطفال — احتراماً لخصوصيتهم.
          </p>
        </div>
        <div class="mt-10">
          <MaanTestimonials :items="testimonials" />
        </div>
      </UContainer>
    </section>

    <!-- ─────────── LATEST ARTICLES (rename: Scientific Reference) ─────────── -->
    <section class="maan-section maan-band maan-band--ld">
      <UContainer>
        <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span class="maan-eyebrow maan-eyebrow--ld">المرجع العلمي الشامل</span>
            <h2 class="maan-h2 mt-4">
              دليل معاً للتمكين
            </h2>
            <p class="maan-lead mt-3">
              مقالات وأدلة من فريق المركز للأسر والمعلمين.
            </p>
          </div>
          <NuxtLink
            to="/ar/blog"
            class="maan-ghost-btn"
          >
            <span>عرض الكل</span>
            <UIcon
              name="i-lucide-arrow-left"
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
                :to="`/ar/blog/${post.slug}`"
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
                locale="ar"
              />
              <span
                class="inline-flex items-center gap-1 font-semibold"
                style="color: var(--maan-autism);"
              >
                اقرأ المقال
                <UIcon
                  name="i-lucide-arrow-left"
                  class="size-3.5 transition-transform group-hover:-translate-x-0.5"
                />
              </span>
            </div>
          </article>
        </div>
      </UContainer>
    </section>

    <!-- ─────────── FAQ ─────────── -->
    <section class="maan-section">
      <UContainer class="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div class="lg:sticky lg:top-28">
          <span class="maan-eyebrow">أسئلة شائعة</span>
          <h2 class="maan-h2 mt-4">
            إجابات سريعة لأكثر ما يسأله أولياء الأمور.
          </h2>
          <p class="maan-lead mt-4">
            لم تجد إجابتك؟ تواصلوا معنا مباشرة عبر واتساب وسنرد عليكم في يوم العمل.
          </p>
        </div>
        <MaanFaq :items="faqs" />
      </UContainer>
    </section>

    <!-- ─────────── FINAL CTA ─────────── -->
    <section class="maan-section maan-band">
      <UContainer>
        <div class="maan-card mx-auto max-w-4xl p-8 text-center sm:p-12">
          <h2 class="maan-h2">
            ابدأ رحلة طفلك مع مركز معاً.
          </h2>
          <p class="maan-lead mx-auto mt-4">
            خطوة واحدة تفصلكم عن جلسة تقييم وخطة فردية مصممة لطفلك. اختر القناة الأنسب لكم.
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <NuxtLink
              to="/ar/contact"
              class="maan-cta-btn"
            >
              <UIcon
                name="i-lucide-calendar-check"
                class="size-5"
              />
              <span>احجز جلسة تقييم الآن</span>
            </NuxtLink>
            <a
              href="https://wa.me/97332055666?text=%D8%A3%D9%88%D8%AF%20%D8%A7%D8%B3%D8%AA%D8%B4%D8%A7%D8%B1%D8%A9%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%B7%D9%81%D9%84%D9%8A"
              target="_blank"
              rel="noopener noreferrer"
              class="maan-ghost-btn"
            >
              <UIcon
                name="i-lucide-message-circle"
                class="size-5"
              />
              <span>دردشة واتساب</span>
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
            بياناتكم مشفرة وآمنة ولا يتم مشاركتها.
          </p>
        </div>
      </UContainer>
    </section>

    <!-- ─────────── CAREERS PLACEHOLDER ─────────── -->
    <section
      id="careers"
      class="maan-section"
    >
      <UContainer>
        <div class="maan-card flex flex-col items-center gap-3 p-8 text-center sm:p-10">
          <span class="maan-eyebrow maan-eyebrow--down">انضم لفريقنا</span>
          <h2 class="maan-h2">
            وظائف ومتطوعون
          </h2>
          <p class="maan-lead">
            نرحب بأخصائيين، معلمين، ومتطوعين لديهم شغف بدعم الأطفال ذوي الاحتياجات.
            تواصلوا معنا وسنشارككم الفرص المتاحة.
          </p>
          <!-- TODO_IMPLEMENTATION_REFERENCES: dedicated careers form/page. -->
          <NuxtLink
            to="/ar/contact"
            class="maan-cta-btn mt-2"
          >
            <UIcon
              name="i-lucide-send"
              class="size-5"
            />
            <span>أرسل سيرتك الذاتية</span>
          </NuxtLink>
        </div>
      </UContainer>
    </section>
  </div>
</template>
