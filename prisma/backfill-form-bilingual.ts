// Backfill — fills in the Arabic side of every Form / FormBlock / FormField
// JSON envelope that's still empty. The SQL migration already wrapped
// every legacy string into { en: <value>, ar: '' }; this script finishes
// the job for the seed forms by porting the Arabic translations that
// used to live in MaanForm.vue's hardcoded `localizedField()` lookup.
//
// Idempotent: any envelope whose `.ar` is already non-empty is left alone.
// Re-running the script after admins have edited Arabic copy is safe.
//
// Run: `pnpm tsx prisma/backfill-form-bilingual.ts`

import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client.ts'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const log = (...args: unknown[]) => console.log(' ', ...args)

type Pair = { en?: string, ar?: string }

const asPair = (raw: unknown): Pair => {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Pair
    return { en: typeof o.en === 'string' ? o.en : '', ar: typeof o.ar === 'string' ? o.ar : '' }
  }
  if (typeof raw === 'string') return { en: raw, ar: '' }
  return { en: '', ar: '' }
}

const fill = (current: unknown, ar: string): Pair => {
  const pair = asPair(current)
  if (pair.ar && pair.ar.trim()) return pair // admin already filled it
  return { en: pair.en || '', ar }
}

// ── Translations sourced from the legacy MaanForm.vue localizedField() ──

const FIELD_LABEL_AR: Record<string, string> = {
  'first-name': 'الاسم الأول',
  'last-name': 'اسم العائلة',
  'email': 'البريد الإلكتروني',
  'department': 'ما نوع الدعم الذي تود السؤال عنه؟',
  'comments': 'كيف يمكننا مساعدتك؟'
}

const FIELD_PLACEHOLDER_AR: Record<string, string> = {
  'first-name': 'الاسم الأول',
  'last-name': 'اسم العائلة',
  'email': 'name@example.com',
  'comments': 'شارك عمر الطفل واحتياجاته والخطوة التي تود السؤال عنها.'
}

const CHOICE_TEXT_AR: Record<string, string> = {
  'assessment': 'التقييم',
  'individualized-education': 'الخطة التعليمية الفردية',
  'speech-communication': 'النطق والتواصل',
  'occupational-therapy': 'العلاج الوظيفي',
  'family-guidance': 'إرشاد الأسرة'
}

// FormBlock-level translations — used for the contact / homepage / blog
// resource blocks the site renders today.
const BLOCK_TRANSLATIONS: Array<{ id: string, headlineAr: string, taglineAr: string }> = [
  {
    id: '185eca12-4af1-4a1c-bfd7-4bc2fab52097', // contact page block
    headlineAr: 'تواصل مع فريقنا للاستفسار عن التقييم والعلاج والدعم التعليمي الفردي',
    taglineAr: 'تواصل معنا'
  },
  {
    id: '36493b64-2bad-4c58-9d70-785ccb12ee26', // contact form fallback block
    headlineAr: 'تواصل مع فريقنا للاستفسار عن التقييم والعلاج والدعم التعليمي الفردي',
    taglineAr: 'تواصل معنا'
  }
]

const FORM_TITLE_AR: Record<string, string> = {
  // Best-effort mapping; admins fine-tune via the new editor.
  'Contact Maan': 'تواصل مع مركز معاً',
  'Contact form': 'نموذج التواصل'
}

const SUCCESS_MESSAGE_AR = 'تم استلام الطلب. سيتواصل معك فريقنا قريباً.'
const SUBMIT_LABEL_AR = 'إرسال الطلب'

async function backfillForms() {
  const forms = await prisma.form.findMany({})
  let touched = 0
  for (const form of forms) {
    const title = asPair(form.title)
    const submitLabel = asPair(form.submitLabel)
    const successMessage = asPair(form.successMessage)

    const titleArDefault = (title.en && FORM_TITLE_AR[title.en]) || ''

    const next = {
      title: fill(form.title, titleArDefault),
      submitLabel: form.submitLabel === null
        ? null
        : fill(form.submitLabel, submitLabel.ar || SUBMIT_LABEL_AR),
      successMessage: form.successMessage === null
        ? null
        : fill(form.successMessage, successMessage.ar || SUCCESS_MESSAGE_AR)
    }

    await prisma.form.update({ where: { id: form.id }, data: next })
    touched++
  }
  log(`Forms touched: ${touched}`)
}

async function backfillFormBlocks() {
  const blocks = await prisma.formBlock.findMany({})
  let touched = 0
  for (const block of blocks) {
    const translation = BLOCK_TRANSLATIONS.find(t => t.id === block.id)
    if (!translation) continue
    await prisma.formBlock.update({
      where: { id: block.id },
      data: {
        headline: fill(block.headline, translation.headlineAr),
        tagline: fill(block.tagline, translation.taglineAr)
      }
    })
    touched++
  }
  log(`FormBlocks touched: ${touched}`)
}

async function backfillFormFields() {
  const fields = await prisma.formField.findMany({})
  let touched = 0
  for (const field of fields) {
    const labelAr = FIELD_LABEL_AR[field.name] || ''
    const placeholderAr = FIELD_PLACEHOLDER_AR[field.name] || ''

    // Choices: wrap text into { en, ar } envelopes if still legacy.
    let nextChoices: unknown = field.choices
    if (Array.isArray(field.choices)) {
      nextChoices = (field.choices as unknown[]).map((c) => {
        if (!c || typeof c !== 'object') return c
        const choice = c as { value?: string, text?: unknown }
        const arFromTable = choice.value ? CHOICE_TEXT_AR[choice.value] || '' : ''
        return { value: choice.value, text: fill(choice.text, arFromTable) }
      })
    }

    await prisma.formField.update({
      where: { id: field.id },
      data: {
        label: field.label === null ? null : fill(field.label, labelAr),
        placeholder: field.placeholder === null ? null : fill(field.placeholder, placeholderAr),
        help: field.help === null ? null : fill(field.help, ''),
        choices: nextChoices as never
      }
    })
    touched++
  }
  log(`FormFields touched: ${touched}`)
}

async function main() {
  console.log('— backfill-form-bilingual')
  await backfillForms()
  await backfillFormBlocks()
  await backfillFormFields()
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (err) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })
