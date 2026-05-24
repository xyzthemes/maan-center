// Phase 6: authenticated image upload that streams a multipart file to Tigris
// and returns its public CDN URL. Wired to the dashboard's rich-text editor.

import { createError, readMultipartFormData, setResponseStatus } from 'h3'
import { randomUUID } from 'node:crypto'

const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/gif'
])

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB — keep editors honest about asset size

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif'
}

// Slugify a filename's stem so the storage key stays URL-clean (preserves
// Arabic-script glyphs since the blog mixes EN/AR slugs).
const slugifyStem = (stem: string) => stem
  .normalize('NFKD')
  .toLowerCase()
  .replace(/[^a-z0-9؀-ۿ]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60) || 'image'

export default defineEventHandler(async (event) => {
  // Phase 7 cleanup will tighten this to `{ user: { role: ['admin', 'writer'] } }`
  // once the seed elevates the appropriate users via Better Auth's admin plugin.
  await requireUserSession(event, { user: { role: 'admin' } })

  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.filename && p.data)

  if (!file?.data || !file.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Missing file part.' })
  }

  const contentType = (file.type || '').toLowerCase()
  if (!ALLOWED_MIME.has(contentType)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unsupported MIME type: ${contentType || 'unknown'}. Allowed: ${[...ALLOWED_MIME].join(', ')}.`
    })
  }

  if (file.data.length > MAX_BYTES) {
    throw createError({
      statusCode: 413,
      statusMessage: `File too large (${(file.data.length / 1024 / 1024).toFixed(1)} MB). Max ${MAX_BYTES / 1024 / 1024} MB.`
    })
  }

  const stem = file.filename.replace(/\.[^.]+$/, '')
  const ext = EXT_BY_MIME[contentType] ?? 'bin'
  const key = `posts/${randomUUID().slice(0, 8)}-${slugifyStem(stem)}.${ext}`

  const url = await uploadObject({
    key,
    body: file.data,
    contentType
  })

  setResponseStatus(event, 201)
  return { url, key, size: file.data.length, contentType }
})
