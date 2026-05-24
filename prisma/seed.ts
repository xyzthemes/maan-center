// Phase 3 — seed Postgres from Directus.
//
// Resumable by design: every collection is paginated, every page fetch retries
// 502/503/504 with backoff, and every row is `upsert`ed by Directus id so
// re-running is safe. Run with `pnpm db:seed` while `fly proxy 5432 -a maan-db`
// is active.
//
// User passwords: rows are created with `Account.password = NULL`. Plaintext
// temporary passwords are printed to stdout for the operator only — capture
// them out-of-band. Phase 4 swaps in Better Auth's passwordReset flow at
// cutover, so seeded passwords never enter the auth path.

import 'dotenv/config'
import { randomBytes, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client.ts'

// ── Directus client (reuses the .vscode/mcp.json token via .tmp helper) ─────

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)
const mcpConfig = JSON.parse(fs.readFileSync(path.join(repoRoot, '.vscode/mcp.json'), 'utf8'))
const mcpUrl = new URL(mcpConfig.servers['maan-directus'].url)
const directusToken = mcpUrl.searchParams.get('access_token')
const directusBase = `${mcpUrl.protocol}//${mcpUrl.host}`

if (!directusToken) throw new Error('No access_token in .vscode/mcp.json maan-directus url')

type Query = Record<string, string | number | object>

async function directus<T = any>(pathname: string, opts: { query?: Query } = {}): Promise<T> {
  const url = new URL(`${directusBase}${pathname}`)
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      url.searchParams.set(k, typeof v === 'string' ? v : typeof v === 'number' ? String(v) : JSON.stringify(v))
    }
  }
  // Retry transient Directus errors (its container has been 502'ing intermittently).
  let lastErr: any
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${directusToken}` } })
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) {
        if ([502, 503, 504].includes(res.status)) {
          const wait = Math.min(30_000, 1000 * 2 ** (attempt - 1))
          console.warn(`  ↻ Directus ${pathname} ${res.status}, retry ${attempt}/8 in ${wait}ms`)
          await sleep(wait)
          continue
        }
        const err = new Error(`Directus ${pathname} ${res.status}: ${text.slice(0, 200)}`)
        ;(err as any).status = res.status
        throw err
      }
      return data as T
    } catch (e: any) {
      lastErr = e
      if (e.name === 'TypeError' || e.code === 'ECONNRESET' || e.code === 'UND_ERR_SOCKET') {
        const wait = Math.min(30_000, 1000 * 2 ** (attempt - 1))
        console.warn(`  ↻ Directus ${pathname} ${e.code || e.message}, retry ${attempt}/8 in ${wait}ms`)
        await sleep(wait)
        continue
      }
      throw e
    }
  }
  throw lastErr ?? new Error(`Directus ${pathname} exhausted retries`)
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function* paginate<T>(collection: string, extraQuery: Query = {}): AsyncGenerator<T[]> {
  const limit = 100
  let page = 1
  while (true) {
    const res = await directus<{ data: T[] }>(`/items/${collection}`, {
      query: { ...extraQuery, limit, page, sort: 'id' }
    })
    const rows = res.data || []
    if (!rows.length) return
    yield rows
    if (rows.length < limit) return
    page++
  }
}

// ── Prisma client ───────────────────────────────────────────────────────────

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
pool.on('error', err => console.warn('[pg-pool]', err.message))
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, 'draft' | 'in_review' | 'published'> = {
  draft: 'draft',
  in_review: 'in_review',
  published: 'published',
  // Directus sometimes uses these synonyms — map defensively
  review: 'in_review',
  archived: 'draft'
}

function mapStatus(s: unknown): 'draft' | 'in_review' | 'published' {
  if (typeof s !== 'string') return 'draft'
  return STATUS_MAP[s] ?? 'draft'
}

function parseDate(v: unknown): Date | null {
  if (!v || typeof v !== 'string') return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

function tempPassword(): string {
  // 18 random bytes → ~24 base64url chars, no padding
  return randomBytes(18).toString('base64url')
}

function ensureUuid(id: unknown): string {
  return typeof id === 'string' && id.length > 0 ? id : randomUUID()
}

// Wrap a phase so a thrown error per-collection doesn't abort the whole run.
async function phase(name: string, fn: () => Promise<void>) {
  console.log(`\n── ${name} ─────────────────────────────`)
  const t0 = Date.now()
  try {
    await fn()
    console.log(`✓ ${name} (${((Date.now() - t0) / 1000).toFixed(1)}s)`)
  } catch (e: any) {
    console.error(`✗ ${name}:`, e?.message ?? e)
    console.error(`  Re-run \`pnpm db:seed\` to resume — upserts make this safe.`)
  }
}

// ── Seed phases ─────────────────────────────────────────────────────────────

type DirectusUser = {
  id: string
  email: string | null
  first_name?: string | null
  last_name?: string | null
  status?: string | null
  role?: string | null
}

const tempCreds: { email: string, password: string }[] = []

async function seedUsers() {
  // Directus users live at /users (not /items/directus_users)
  let page = 1
  const limit = 100
  let total = 0
  while (true) {
    const res = await directus<{ data: DirectusUser[] }>('/users', {
      query: { limit, page, fields: 'id,email,first_name,last_name,status,role' }
    })
    const rows = res.data || []
    if (!rows.length) break

    for (const u of rows) {
      if (!u.email) continue
      const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.email
      const id = ensureUuid(u.id)
      const banned = u.status === 'suspended' || u.status === 'inactive'

      await prisma.user.upsert({
        where: { id },
        update: {
          email: u.email,
          name,
          banned
        },
        create: {
          id,
          email: u.email,
          name,
          emailVerified: u.status === 'active',
          role: 'user', // Better Auth admin plugin default; cutover step elevates as needed
          banned
        }
      })

      const tmp = tempPassword()
      tempCreds.push({ email: u.email, password: tmp })
      total++
    }

    if (rows.length < limit) break
    page++
  }
  console.log(`  users upserted: ${total}`)
}

async function seedPosts() {
  let total = 0
  for await (const rows of paginate<any>('posts', { fields: '*' })) {
    for (const p of rows) {
      const id = ensureUuid(p.id)
      const slug: string = p.slug || `post-${id.slice(0, 8)}`
      const data = {
        slug,
        title: p.title ?? '(untitled)',
        description: p.description ?? null,
        content: p.content ?? null,
        image: p.image ?? null,
        status: mapStatus(p.status),
        publishedAt: parseDate(p.publishedAt ?? p.published_at ?? p.date_published),
        sort: typeof p.sort === 'number' ? p.sort : null,
        seo: p.seo ?? null,
        createdAt: parseDate(p.date_created) ?? new Date(),
        updatedAt: parseDate(p.date_updated) ?? new Date()
      }

      await prisma.post.upsert({
        where: { id },
        update: data,
        create: { id, ...data }
      })
      total++
    }
    console.log(`  posts: ${total}`)
  }
}

async function seedPages() {
  let total = 0
  for await (const rows of paginate<any>('pages', { fields: '*' })) {
    for (const p of rows) {
      const id = ensureUuid(p.id)
      const permalink: string = p.permalink || p.slug || `/page-${id.slice(0, 8)}`
      const data = {
        permalink,
        title: p.title ?? '(untitled)',
        content: p.content ?? null,
        status: mapStatus(p.status),
        publishedAt: parseDate(p.publishedAt ?? p.published_at ?? p.date_published),
        sort: typeof p.sort === 'number' ? p.sort : null,
        seo: p.seo ?? null,
        createdAt: parseDate(p.date_created) ?? new Date(),
        updatedAt: parseDate(p.date_updated) ?? new Date()
      }
      await prisma.page.upsert({
        where: { id },
        update: data,
        create: { id, ...data }
      })
      total++
    }
    console.log(`  pages: ${total}`)
  }
}

async function seedForms() {
  let total = 0
  for await (const rows of paginate<any>('forms', { fields: '*' })) {
    for (const f of rows) {
      const id = ensureUuid(f.id)
      const data = {
        title: f.title ?? '(untitled form)',
        isActive: f.is_active ?? f.isActive ?? true,
        submitLabel: f.submit_label ?? f.submitLabel ?? null,
        onSuccess: f.on_success ?? f.onSuccess ?? 'message',
        successMessage: f.success_message ?? f.successMessage ?? null,
        successRedirectUrl: f.success_redirect_url ?? f.successRedirectUrl ?? null,
        createdAt: parseDate(f.date_created) ?? new Date(),
        updatedAt: parseDate(f.date_updated) ?? new Date()
      }
      await prisma.form.upsert({
        where: { id },
        update: data,
        create: { id, ...data }
      })
      total++
    }
  }
  console.log(`  forms: ${total}`)
}

async function seedFormFields() {
  let total = 0, skipped = 0
  for await (const rows of paginate<any>('form_fields', { fields: '*' })) {
    for (const f of rows) {
      const id = ensureUuid(f.id)
      const formId = typeof f.form === 'object' ? f.form?.id : f.form
      if (!formId) { skipped++; continue }

      const data = {
        formId,
        name: f.name ?? f.key ?? `field-${id.slice(0, 8)}`,
        type: f.type ?? 'text',
        label: f.label ?? null,
        placeholder: f.placeholder ?? null,
        help: f.help ?? null,
        width: f.width ?? null,
        validation: f.validation ?? null,
        choices: f.choices ?? null,
        required: f.required ?? false,
        sort: typeof f.sort === 'number' ? f.sort : null
      }
      try {
        await prisma.formField.upsert({
          where: { id },
          update: data,
          create: { id, ...data }
        })
        total++
      } catch (e: any) {
        // Foreign key violation: parent form missing. Log and continue.
        console.warn(`  ⚠ form_field ${id} skipped: ${e.message?.split('\n')[0]}`)
        skipped++
      }
    }
  }
  console.log(`  form_fields: ${total} (${skipped} skipped)`)
}

async function seedFormSubmissions() {
  let total = 0, skipped = 0
  for await (const rows of paginate<any>('form_submissions', { fields: '*' })) {
    for (const s of rows) {
      const id = ensureUuid(s.id)
      const formId = typeof s.form === 'object' ? s.form?.id : s.form
      if (!formId) { skipped++; continue }
      const data = {
        formId,
        timestamp: parseDate(s.timestamp ?? s.date_created) ?? new Date(),
        ipAddress: s.ip_address ?? s.ipAddress ?? null,
        userAgent: s.user_agent ?? s.userAgent ?? null
      }
      try {
        await prisma.formSubmission.upsert({
          where: { id },
          update: data,
          create: { id, ...data }
        })
        total++
      } catch (e: any) {
        console.warn(`  ⚠ form_submission ${id} skipped: ${e.message?.split('\n')[0]}`)
        skipped++
      }
    }
  }
  console.log(`  form_submissions: ${total} (${skipped} skipped)`)
}

async function seedFormBlocks() {
  let total = 0, skipped = 0
  try {
    for await (const rows of paginate<any>('block_form', { fields: '*' })) {
      for (const b of rows) {
        const id = ensureUuid(b.id)
        const formId = typeof b.form === 'object' ? b.form?.id : b.form
        if (!formId) { skipped++; continue }
        const data = {
          formId,
          headline: b.headline ?? null,
          tagline: b.tagline ?? null,
          createdAt: parseDate(b.date_created) ?? new Date(),
          updatedAt: parseDate(b.date_updated) ?? new Date()
        }
        try {
          await prisma.formBlock.upsert({
            where: { id },
            update: data,
            create: { id, ...data }
          })
          total++
        } catch (e: any) {
          console.warn(`  ⚠ form_block ${id} skipped: ${e.message?.split('\n')[0]}`)
          skipped++
        }
      }
    }
  } catch (e: any) {
    if (e.status === 403 || e.status === 404) {
      console.warn(`  collection block_form not exposed (${e.status}); skipping`)
      return
    }
    throw e
  }
  console.log(`  form_blocks: ${total} (${skipped} skipped)`)
}

async function seedFormSubmissionValues() {
  // The Directus row has `form_submission` + `field` FKs but no `name`/`label`
  // snapshots — our Prisma model stores name/label denormalized so historical
  // submissions survive field deletions. Resolve them from the related field.
  const fieldCache = new Map<string, { name: string, label: string | null }>()
  async function resolveField(fieldId: string) {
    let f = fieldCache.get(fieldId)
    if (f) return f
    const row = await prisma.formField.findUnique({
      where: { id: fieldId },
      select: { name: true, label: true }
    })
    f = row ? { name: row.name, label: row.label } : { name: '(unknown)', label: null }
    fieldCache.set(fieldId, f)
    return f
  }

  let total = 0, skipped = 0
  try {
    for await (const rows of paginate<any>('form_submission_values', { fields: '*' })) {
      for (const v of rows) {
        const id = ensureUuid(v.id)
        const submissionId = typeof v.form_submission === 'object'
          ? v.form_submission?.id
          : v.form_submission
        const fieldId = typeof v.field === 'object' ? v.field?.id : (v.field ?? null)
        if (!submissionId) { skipped++; continue }

        const fieldMeta = fieldId ? await resolveField(fieldId) : { name: '(unknown)', label: null }
        const data = {
          submissionId,
          fieldId: fieldId || null,
          name: fieldMeta.name,
          label: fieldMeta.label ?? fieldMeta.name,
          value: v.value == null ? null : String(v.value)
        }
        try {
          await prisma.formSubmissionValue.upsert({
            where: { id },
            update: data,
            create: { id, ...data }
          })
          total++
        } catch (e: any) {
          console.warn(`  ⚠ form_submission_value ${id} skipped: ${e.message?.split('\n')[0]}`)
          skipped++
        }
      }
    }
  } catch (e: any) {
    if (e.status === 403 || e.status === 404) {
      console.warn(`  collection form_submission_values not exposed (${e.status}); skipping`)
      return
    }
    throw e
  }
  console.log(`  form_submission_values: ${total} (${skipped} skipped)`)
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding from Directus → ${directusBase}`)
  console.log(`Target DB: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@')}`)

  await phase('users (directus_users)', seedUsers)
  await phase('posts', seedPosts)
  await phase('pages', seedPages)
  await phase('forms', seedForms)
  await phase('form_fields', seedFormFields)
  await phase('form_blocks', seedFormBlocks)
  await phase('form_submissions', seedFormSubmissions)
  await phase('form_submission_values', seedFormSubmissionValues)

  if (tempCreds.length) {
    console.log('\n────────────────────────────────────────')
    console.log('TEMPORARY PASSWORDS (capture these — not stored anywhere):')
    console.log('────────────────────────────────────────')
    for (const { email, password } of tempCreds) {
      console.log(`  ${email}\t${password}`)
    }
    console.log('────────────────────────────────────────')
    console.log('These are NOT written to the DB. Phase 4 cutover will email a')
    console.log('Better Auth passwordReset link instead.\n')
  }
}

main()
  .catch(e => {
    console.error('\nSeed aborted:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
