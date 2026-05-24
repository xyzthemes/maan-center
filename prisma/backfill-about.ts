// One-off backfill: populate the empty About-Us pages (EN + AR) with real
// body content so the public site renders something other than the
// "page is being prepared" placeholder.
//
// Idempotent: uses `update` filtered by permalink, and only overwrites
// content when the current row's content is empty / null. Custom dashboard
// edits are preserved.
//
// Run: `pnpm tsx prisma/backfill-about.ts`
//
// The script targets pages by permalink, so it's safe to run on dev or prod
// without knowing the row IDs ahead of time.

import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client.ts'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const EN_PERMALINK = '/about-us'
const AR_PERMALINK = '/ar/about-us'

const EN_CONTENT = `
<p>Maan Special Education Center is a Bahrain-based reference for children with
autism spectrum disorder, Down syndrome, and learning difficulties. We bring
educators, therapists, and families together around one shared plan — built on
a careful scientific assessment and adjusted as the child grows.</p>

<h2>Our approach</h2>
<p>Every child arrives with their own strengths and pace. Our team starts with
an unhurried conversation with the family, applies internationally recognized
measures (CARS, GILLIAM, intelligence scales), and writes an Individualized
Education Plan (IEP) that names what we are working on and how we will know
when it is working.</p>

<h2>What we believe</h2>
<ul>
  <li><strong>Assessment before intervention.</strong> We never recommend a
  plan we cannot defend. If a measure is missing, we say so.</li>
  <li><strong>The family is a partner, not an audience.</strong> Goals,
  observations, and home plans are shared in plain language and reviewed on
  a recurring schedule.</li>
  <li><strong>The environment teaches as much as the lesson.</strong> Our
  spaces are designed to reduce sensory load so a child can focus on what
  matters: their next step.</li>
</ul>

<h2>Programs we run</h2>
<p>Three specialty areas operate as a single, coordinated practice:</p>
<ul>
  <li><strong>Autism spectrum:</strong> behavior support (Lovaas / ABA),
  TEACCH-style structured teaching, and alternative communication.</li>
  <li><strong>Down syndrome:</strong> early intervention rooted in Portage,
  occupational therapy, and muscle strengthening for daily independence.</li>
  <li><strong>Learning difficulties:</strong> multi-sensory teaching for
  reading, writing, and arithmetic with concrete-before-abstract math.</li>
</ul>

<h2>Who we serve</h2>
<p>We work with children from the earliest years through school age. We meet
families across the Kingdom of Bahrain and coordinate with schools and
therapists when it helps the child.</p>

<h2>Get in touch</h2>
<p>If you are wondering whether Maan is right for your child, the first step
is a conversation — no obligation, and every conversation stays confidential.
Reach us on WhatsApp at +973 3205 5666 or through the contact form.</p>
`.trim()

const AR_CONTENT = `
<p>مركز معاً للتربية الخاصة في البحرين مرجعٌ متخصص للأطفال ذوي اضطراب طيف
التوحد ومتلازمة داون وصعوبات التعلم. نجمع المعلمين والمعالجين والأسرة حول
خطة واحدة مشتركة، مبنية على تقييم علمي دقيق وتُعدَّل مع نمو الطفل.</p>

<h2>منهجنا</h2>
<p>كل طفل يصل إلينا بنقاط قوته وإيقاعه. يبدأ فريقنا بلقاء هادئ مع الأسرة،
ثم يطبّق مقاييس علمية معتمدة (CARS و GILLIAM ومقاييس الذكاء)، ثم يكتب خطة
تعليمية فردية (IEP) تحدد ما نعمل عليه وكيف نعرف أنه ينجح.</p>

<h2>ما نؤمن به</h2>
<ul>
  <li><strong>التقييم قبل التدخل.</strong> لا نقترح خطة لا نستطيع تبريرها.
  إذا كانت أداة قياس غير متوفرة، نقولها بوضوح.</li>
  <li><strong>الأسرة شريك لا متفرج.</strong> نشارك الأهداف والملاحظات والخطط
  المنزلية بلغة بسيطة، ونراجعها معكم بانتظام.</li>
  <li><strong>البيئة تعلّم بقدر ما يعلّم الدرس.</strong> مساحاتنا مصممة لتقليل
  الحمل الحسي حتى يتمكن الطفل من التركيز على خطوته التالية.</li>
</ul>

<h2>البرامج التي نقدمها</h2>
<p>ثلاثة مجالات تخصصية تعمل معاً كممارسة واحدة منسّقة:</p>
<ul>
  <li><strong>طيف التوحد:</strong> تعديل سلوك (Lovaas / ABA)، تعليم منظم على
  نمط TEACCH، ودعم التواصل البديل.</li>
  <li><strong>متلازمة داون:</strong> تدخل مبكر وفق بورتاج، علاج وظيفي،
  وتقوية عضلية لبناء الاستقلالية اليومية.</li>
  <li><strong>صعوبات التعلم:</strong> تعليم متعدد الحواس للقراءة والكتابة
  والحساب بأدوات ملموسة قبل الانتقال للمجرد.</li>
</ul>

<h2>من نخدم؟</h2>
<p>نعمل مع الأطفال من السنوات الأولى وحتى سن المدرسة. نلتقي بالأسر في مختلف
أنحاء مملكة البحرين وننسّق مع المدارس والمعالجين حين يخدم ذلك الطفل.</p>

<h2>للتواصل</h2>
<p>إذا كنتم تتساءلون عمّا إذا كان مركز معاً مناسباً لطفلكم، فالخطوة الأولى
هي محادثة — دون أي التزام، وبسرية تامة. تواصلوا معنا عبر واتساب على الرقم
+973 3205 5666 أو من خلال نموذج التواصل.</p>
`.trim()

const seoEn = {
  title: 'About Maan Special Education Center | Our Child-Led Approach',
  meta_description: 'How Maan Special Education Center brings educators, therapists, and families together to create steady progress for children with autism, Down syndrome, and learning difficulties in Bahrain.',
  focus_keyphrase: 'child-led support'
}

const seoAr = {
  title: 'عن مركز معاً للتربية الخاصة | منهجنا المبني حول الطفل',
  meta_description: 'كيف يجمع مركز معاً للتربية الخاصة المعلمين والمعالجين والأسر حول خطة واحدة لتحقيق تقدم ثابت للأطفال ذوي طيف التوحد ومتلازمة داون وصعوبات التعلم في البحرين.',
  focus_keyphrase: 'الدعم المبني حول الطفل'
}

async function updateIfEmpty(permalink: string, content: string, seo: object) {
  const existing = await prisma.page.findFirst({
    where: { permalink }
  })

  if (!existing) {
    console.log(`  skip: no page with permalink ${permalink} (create one in the dashboard first)`)
    return
  }

  const hasContent = typeof existing.content === 'string' && existing.content.trim().length > 0
  if (hasContent) {
    console.log(`  skip: ${permalink} already has body content — preserving dashboard edits`)
    return
  }

  await prisma.page.update({
    where: { id: existing.id },
    data: {
      content,
      seo: seo as never,
      status: 'published',
      publishedAt: existing.publishedAt ?? new Date()
    }
  })
  console.log(`  updated: ${permalink}`)
}

async function main() {
  console.log('Backfilling About-Us pages…')
  await updateIfEmpty(EN_PERMALINK, EN_CONTENT, seoEn)
  await updateIfEmpty(AR_PERMALINK, AR_CONTENT, seoAr)
  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
