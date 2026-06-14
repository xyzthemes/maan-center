// Phase 6: authenticated upload that streams a multipart file to Tigris and
// returns its public CDN URL. Wired to the dashboard's rich-text editor —
// images, plus (Phase 2 / S4) document attachments and audio/video media.

import { createError, readMultipartFormData, setResponseStatus } from 'h3'
import { randomUUID } from 'node:crypto'

// Per-type size caps (Q3): images stay small, documents 25 MB, A/V 50 MB.
const MB = 1024 * 1024
const IMAGE_MAX = 5 * MB
const DOC_MAX = 25 * MB
const AV_MAX = 50 * MB

// Single source of truth for what we accept: MIME → file extension + cap. Any
// MIME not in this table is rejected (the auth guard + this allow-list are the
// only gate before an object lands in the public bucket — keep it tight).
const FILE_SPEC: Record<string, { ext: string, maxBytes: number }> = {
  // Images
  'image/png': { ext: 'png', maxBytes: IMAGE_MAX },
  'image/jpeg': { ext: 'jpg', maxBytes: IMAGE_MAX },
  'image/webp': { ext: 'webp', maxBytes: IMAGE_MAX },
  'image/avif': { ext: 'avif', maxBytes: IMAGE_MAX },
  'image/gif': { ext: 'gif', maxBytes: IMAGE_MAX },
  // Documents (downloadable attachments)
  'application/pdf': { ext: 'pdf', maxBytes: DOC_MAX },
  'application/msword': { ext: 'doc', maxBytes: DOC_MAX },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', maxBytes: DOC_MAX },
  'application/vnd.ms-excel': { ext: 'xls', maxBytes: DOC_MAX },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: 'xlsx', maxBytes: DOC_MAX },
  'application/vnd.ms-powerpoint': { ext: 'ppt', maxBytes: DOC_MAX },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: 'pptx', maxBytes: DOC_MAX },
  'text/plain': { ext: 'txt', maxBytes: DOC_MAX },
  'text/csv': { ext: 'csv', maxBytes: DOC_MAX },
  // Video
  'video/mp4': { ext: 'mp4', maxBytes: AV_MAX },
  'video/webm': { ext: 'webm', maxBytes: AV_MAX },
  'video/ogg': { ext: 'ogv', maxBytes: AV_MAX },
  'video/quicktime': { ext: 'mov', maxBytes: AV_MAX },
  // Audio
  'audio/mpeg': { ext: 'mp3', maxBytes: AV_MAX },
  'audio/ogg': { ext: 'oga', maxBytes: AV_MAX },
  'audio/wav': { ext: 'wav', maxBytes: AV_MAX },
  'audio/webm': { ext: 'weba', maxBytes: AV_MAX }
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
  // Uploads serve every editing surface, so allow any staff member
  // with a content-editing scope. Admins bypass via the helper.
  await requireAnyPermission(event, ['posts', 'pages', 'blocks', 'forms'])

  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.filename && p.data)

  if (!file?.data || !file.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Missing file part.' })
  }

  const contentType = (file.type || '').toLowerCase()
  const spec = FILE_SPEC[contentType]
  if (!spec) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unsupported MIME type: ${contentType || 'unknown'}. Allowed: ${Object.keys(FILE_SPEC).join(', ')}.`
    })
  }

  if (file.data.length > spec.maxBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: `File too large (${(file.data.length / MB).toFixed(1)} MB). Max ${spec.maxBytes / MB} MB for this file type.`
    })
  }

  const stem = file.filename.replace(/\.[^.]+$/, '')
  const key = `posts/${randomUUID().slice(0, 8)}-${slugifyStem(stem)}.${spec.ext}`

  const url = await uploadObject({
    key,
    body: file.data,
    contentType
  })

  setResponseStatus(event, 201)
  return { url, key, size: file.data.length, contentType }
})
