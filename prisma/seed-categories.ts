// Idempotent local/dev seed for the Category taxonomy table.
//
// Production gets these rows from the `_add_category` migration's seed INSERT
// (the Fly `release_command` runs `prisma migrate deploy`, not this script).
// This standalone script exists for local/dev databases: `pnpm db:seed:categories`.
//
// Kept separate from the HISTORICAL Directus `seed.ts` (which is Directus-coupled
// and documented "do not extend"). Re-running is safe — every row is upserted by slug.

import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client.ts'

// Mirrors POST_CATEGORIES in app/composables/useMaanTaxonomy.ts (slugs unchanged)
// and the seed rows embedded in prisma/migrations/.../_add_category/migration.sql.
const CATEGORIES = [
  { slug: 'autism', nameEn: 'Autism Spectrum', nameAr: 'طيف التوحد', sort: 1 },
  { slug: 'down-syndrome', nameEn: 'Down Syndrome', nameAr: 'متلازمة داون', sort: 2 },
  { slug: 'learning-difficulties', nameEn: 'Learning Difficulties', nameAr: 'صعوبات التعلم', sort: 3 },
  { slug: 'family-support', nameEn: 'Family Support', nameAr: 'دعم الأسرة', sort: 4 },
  { slug: 'assessment', nameEn: 'Assessment', nameAr: 'التقييم', sort: 5 },
  { slug: 'therapy', nameEn: 'Therapy', nameAr: 'العلاج', sort: 6 }
] as const

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
pool.on('error', err => console.warn('[pg-pool]', err.message))
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  console.log(`Seeding categories → ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@')}`)
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nameEn: c.nameEn, nameAr: c.nameAr, sort: c.sort },
      create: c
    })
  }
  console.log(`  categories upserted: ${CATEGORIES.length}`)
}

main()
  .catch((e) => {
    console.error('\nCategory seed aborted:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
