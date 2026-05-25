// One-off backfill: seed the existing hardcoded content into the new
// editable surfaces (SiteSetting + ContentBlock + Post taxonomy).
//
// Idempotent on three axes:
//   • SiteSettings — only create when no row exists for (key, locale).
//     Existing admin edits are preserved.
//   • ContentBlocks — only insert when no rows exist for the target
//     (type, locale, placement) triple. If an admin has already
//     published any block of that shape we leave them alone.
//   • Posts — match by `slug` and overwrite categories/placements
//     because the pre-Layer-1 schema didn't store them.
//
// Re-running the script is safe.
//
// Run: `pnpm tsx prisma/backfill-content.ts`

import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client.ts'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

// ── Helpers ───────────────────────────────────────────────────────────────

const log = (...args: unknown[]) => console.log(' ', ...args)

async function seedSettingIfMissing(
  key: string,
  locale: '*' | 'en' | 'ar',
  value: object
) {
  const existing = await prisma.siteSetting.findUnique({
    where: { key_locale: { key, locale } }
  })
  if (existing) {
    log(`skip setting ${key}/${locale} (already exists)`)
    return
  }
  await prisma.siteSetting.create({
    data: { key, locale, value: value as never }
  })
  log(`created setting ${key}/${locale}`)
}

type SeedBlockInput = {
  type: 'testimonial' | 'faq_item' | 'stat_tile' | 'team_member' | 'service_card'
  locale: 'en' | 'ar' | '*'
  placement: string
  items: Array<object>
}

async function seedBlocksIfMissing({ type, locale, placement, items }: SeedBlockInput) {
  // Skip ENTIRELY if any block of this (type, locale, placement)
  // already exists — even a single admin-published row tells us this
  // surface has been touched manually.
  const existing = await prisma.contentBlock.count({
    where: {
      type,
      locale,
      placements: { has: placement }
    }
  })
  if (existing > 0) {
    log(`skip ${type}/${locale}/${placement} (${existing} already exists)`)
    return
  }

  const now = new Date()
  let sort = 10
  for (const payload of items) {
    await prisma.contentBlock.create({
      data: {
        type,
        locale,
        payload: payload as never,
        placements: [placement],
        status: 'published',
        sort,
        publishedAt: now
      }
    })
    sort += 10
  }
  log(`created ${items.length} × ${type} (${locale}, ${placement})`)
}

async function setPostTaxonomy(slug: string, categories: string[], placements: string[]) {
  const existing = await prisma.post.findUnique({ where: { slug } })
  if (!existing) {
    log(`skip post ${slug} (not in DB)`)
    return
  }
  await prisma.post.update({
    where: { slug },
    data: { categories, placements }
  })
  log(`tagged post ${slug} → categories=${categories.join(',') || '∅'}, placements=${placements.join(',') || '∅'}`)
}

// ── 1. Site settings ──────────────────────────────────────────────────────

async function seedSettings() {
  console.log('— SiteSettings')

  // Working hours: Sun–Thu 08:00–12:00 + 16:00–20:00, Fri closed, Sat 09:00–13:00
  await seedSettingIfMissing('working-hours', '*', {
    days: [
      { day: 0, opens: '08:00', closes: '12:00', secondOpens: '16:00', secondCloses: '20:00' },
      { day: 1, opens: '08:00', closes: '12:00', secondOpens: '16:00', secondCloses: '20:00' },
      { day: 2, opens: '08:00', closes: '12:00', secondOpens: '16:00', secondCloses: '20:00' },
      { day: 3, opens: '08:00', closes: '12:00', secondOpens: '16:00', secondCloses: '20:00' },
      { day: 4, opens: '08:00', closes: '12:00', secondOpens: '16:00', secondCloses: '20:00' },
      { day: 5, closed: true },
      { day: 6, opens: '09:00', closes: '13:00' }
    ]
  })

  // Contact info — current production values (locale-agnostic).
  await seedSettingIfMissing('contact-info', '*', {
    phone: '+97332055666',
    whatsapp: '+97332055666',
    email: '',
    mapsUrl: 'https://maps.app.goo.gl/GNB7VK94az3Wcrrq8',
    address: ''
  })

  // Mission + Vision (matches the structural copy in MaanMissionVision.vue).
  await seedSettingIfMissing('mission-vision', 'en', {
    mission: 'We provide accurate assessment, individualized education plans, and integrated therapy sessions in a calm, safe environment — walking alongside the family at every step of the journey.',
    vision: 'To be a trusted reference in Bahrain for empowering children with autism spectrum disorder, Down syndrome, and learning difficulties — and supporting their families with a scientific and humane vision.'
  })
  await seedSettingIfMissing('mission-vision', 'ar', {
    mission: 'نقدم تقييماً دقيقاً وخططاً تعليمية فردية وجلسات علاجية متكاملة في بيئة آمنة وهادئة، ونرافق الأسرة في كل خطوة على الطريق.',
    vision: 'أن يكون مركز معاً مرجعاً موثوقاً في البحرين لتمكين الأطفال ذوي اضطراب طيف التوحد ومتلازمة داون وصعوبات التعلم، ودعم أسرهم برؤية علمية وإنسانية.'
  })

  // Dr Osama bio — placeholder body matches the current MaanDrOsamaCard
  // structural copy. The headline + tags are new fields the admin can
  // fill in to refine the card without a code change.
  await seedSettingIfMissing('dr-osama-bio', 'en', {
    name: 'Dr. Osama Madbooly',
    headline: 'Founder & Director',
    bio: 'Founder of Maan Special Education Center and a specialist reference in assessing autism spectrum disorder, Down syndrome, and learning difficulties. Dr. Osama leads the design of individualized education plans, the training of therapy teams, and family guidance throughout the journey.',
    tags: ['Autism Spectrum', 'Down Syndrome', 'Learning Difficulties']
  })
  await seedSettingIfMissing('dr-osama-bio', 'ar', {
    name: 'د. أسامة مدبولي',
    headline: 'المؤسس والمدير',
    bio: 'مؤسس مركز معاً للتربية الخاصة ومرجع متخصص في تقييم اضطراب طيف التوحد ومتلازمة داون وصعوبات التعلم. يقود د. أسامة تصميم الخطط التعليمية الفردية وتدريب الفرق العلاجية ومرافقة الأسر خطوة بخطوة.',
    tags: ['اضطراب طيف التوحد', 'متلازمة داون', 'صعوبات التعلم']
  })

  // Homepage stats — the four numbers visible on the hero band.
  await seedSettingIfMissing('stats', 'en', {
    items: [
      { value: '+100', label: 'Children supported' },
      { value: '+3,000', label: 'Therapy hours delivered' },
      { value: '+80', label: 'Families walked alongside' },
      { value: 'Years', label: 'Of specialist experience' }
    ]
  })
  await seedSettingIfMissing('stats', 'ar', {
    items: [
      { value: '+١٠٠', label: 'طفل تم دعمه' },
      { value: '+٣٠٠٠', label: 'ساعة تدريبية' },
      { value: '+٨٠', label: 'أسرة مرافقة' },
      { value: 'سنوات', label: 'من الخبرة المتخصصة' }
    ]
  })
}

// ── 2. Content blocks ─────────────────────────────────────────────────────

async function seedContentBlocks() {
  console.log('— ContentBlocks')

  // Homepage testimonials — three parent quotes (no children named).
  await seedBlocksIfMissing({
    type: 'testimonial',
    locale: 'en',
    placement: 'homepage-featured',
    items: [
      { quote: 'We found a team that listens to the family first. Our child’s plan became clear and doable at home.', attribution: 'Parent, Manama' },
      { quote: 'The continuous communication with therapists is what we needed — slow, steady progress.', attribution: 'Parent, Muharraq' },
      { quote: 'The space is calm and well-suited to our child. The difference was clear from the very first session.', attribution: 'Parent, Riffa' }
    ]
  })
  await seedBlocksIfMissing({
    type: 'testimonial',
    locale: 'ar',
    placement: 'homepage-featured',
    items: [
      { quote: 'وجدنا في المركز فريقاً يصغي للأسرة قبل أي شيء. خطّة طفلنا أصبحت مفهومة وعملية في البيت.', attribution: 'أم من المنامة' },
      { quote: 'أحببنا التواصل المستمر مع المعالجين. التقدم بطيء وثابت، وهذا ما كنا نبحث عنه.', attribution: 'أب من المحرق' },
      { quote: 'البيئة هادئة جداً ومناسبة لطفلتي، وهذا الفرق كان واضحاً منذ الجلسة الأولى.', attribution: 'أم من الرفاع' }
    ]
  })

  // Homepage FAQ — 5 items, both locales.
  await seedBlocksIfMissing({
    type: 'faq_item',
    locale: 'en',
    placement: 'homepage-featured',
    items: [
      { q: 'How long is a single session?', a: 'Sessions typically run 45–60 minutes. The exact duration is set after the initial assessment based on the child’s needs.' },
      { q: 'What age range does the center accept?', a: 'We support children from an early age through school-age. The assessment team determines the right service per age and need.' },
      { q: 'How does the assessment process begin?', a: 'It starts with a family meeting to gather context, followed by an observation session and applicable measures, then a written report and action plan.' },
      { q: 'What role does the family play in the plan?', a: 'The family is a core partner. We share goals and observations regularly and provide simplified home plans to reinforce progress.' },
      { q: 'How do I book an appointment?', a: 'Contact us via WhatsApp, phone, or the form below. Our team follows up within one working day.' }
    ]
  })
  await seedBlocksIfMissing({
    type: 'faq_item',
    locale: 'ar',
    placement: 'homepage-featured',
    items: [
      { q: 'كم تستغرق الجلسة الواحدة؟', a: 'تتراوح الجلسة عادة بين ٤٥ و٦٠ دقيقة، وتُحدد المدة بدقة بعد التقييم الأولي وفق احتياج الطفل.' },
      { q: 'ما الفئة العمرية التي يقبلها المركز؟', a: 'يستقبل المركز الأطفال من سن مبكرة وحتى مرحلة المدرسة. يحدد فريق التقييم الخدمة المناسبة لكل عمر.' },
      { q: 'كيف تبدأ عملية التقييم؟', a: 'تبدأ بلقاء مع الأسرة لجمع المعلومات، ثم جلسة ملاحظة وتطبيق المقاييس المناسبة، يليها تقرير وخطة عمل مكتوبة.' },
      { q: 'ما دور الأسرة في الخطة؟', a: 'الأسرة شريك أساسي. نشارككم الأهداف والملاحظات بانتظام، ونزودكم بخطط منزلية مبسطة لتعزيز ما يُنجز في المركز.' },
      { q: 'كيف أحجز موعداً؟', a: 'يمكنكم التواصل عبر واتساب أو الاتصال أو نموذج التواصل في الأسفل، وسيتابع معكم الفريق خلال يوم العمل.' }
    ]
  })

  // Note on stat_tile blocks: we intentionally do NOT seed them because
  // the homepage now reads from the `stats` SiteSetting (singleton wins
  // over blocks). Seeding both would create two editing surfaces with
  // one silently winning — confusing UX. Admins can still create
  // stat_tile blocks later if they want per-tile publish control.
}

// ── 3. Post taxonomy ──────────────────────────────────────────────────────
//
// The three EN posts and three AR posts each cover one subject:
//   • building-confident-routines-at-home → family-support
//   • how-early-assessment-guides-support → assessment
//   • supporting-communication-through-play → therapy
//
// All three are evergreen general-advice posts, so all three get the
// `homepage-featured` placement (matches the previous "latest 3"
// auto-curation; the editor can prune later if they want fewer).

async function seedPostTaxonomy() {
  console.log('— Post taxonomy')

  await setPostTaxonomy(
    'building-confident-routines-at-home',
    ['family-support'],
    ['homepage-featured']
  )
  await setPostTaxonomy(
    'how-early-assessment-guides-support',
    ['assessment'],
    ['homepage-featured']
  )
  await setPostTaxonomy(
    'supporting-communication-through-play',
    ['therapy'],
    ['homepage-featured']
  )

  await setPostTaxonomy(
    'ar-building-confident-routines-at-home',
    ['family-support'],
    ['homepage-featured']
  )
  await setPostTaxonomy(
    'ar-how-early-assessment-guides-support',
    ['assessment'],
    ['homepage-featured']
  )
  await setPostTaxonomy(
    'ar-supporting-communication-through-play',
    ['therapy'],
    ['homepage-featured']
  )
}

// ── Entrypoint ────────────────────────────────────────────────────────────

async function main() {
  console.log('Backfilling editable content from hardcoded sources…')
  await seedSettings()
  await seedContentBlocks()
  await seedPostTaxonomy()
  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
