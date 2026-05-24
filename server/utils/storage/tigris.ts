import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Singleton S3 client pointing at Fly Tigris.
// Tigris is S3-compatible; the AWS SDK works unmodified with the right endpoint.
// Auto-injected env vars from `fly storage create`:
//   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
//   AWS_REGION=auto, AWS_ENDPOINT_URL_S3=https://fly.storage.tigris.dev,
//   BUCKET_NAME=maan-media

const globalForTigris = globalThis as unknown as {
  tigris: S3Client | undefined
}

export const tigris = globalForTigris.tigris ?? new S3Client({
  region: process.env.AWS_REGION ?? 'auto',
  endpoint: process.env.AWS_ENDPOINT_URL_S3 ?? 'https://fly.storage.tigris.dev',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ''
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalForTigris.tigris = tigris
}

const bucket = process.env.BUCKET_NAME ?? 'maan-media'

/**
 * Public CDN URL pattern for a Tigris public bucket.
 * Served via Fly's anycast edge — no separate CDN needed.
 *
 * Virtual-hosted-style URL: `https://<bucket>.fly.storage.tigris.dev/<key>`.
 * (The earlier `pub-<bucket>` subdomain prefix is no longer routed by Tigris —
 * it resolves to a bucket named `pub-<bucket>` which doesn't exist.)
 */
export const publicUrl = (key: string) =>
  `https://${bucket}.fly.storage.tigris.dev/${key.replace(/^\/+/, '')}`

export interface UploadParams {
  key: string
  body: Buffer | Uint8Array | string
  contentType: string
  cacheControl?: string
}

/**
 * Upload an object to the configured Tigris bucket and return its public URL.
 * Bucket must be public for the URL to be readable without signing.
 */
export const uploadObject = async ({ key, body, contentType, cacheControl }: UploadParams) => {
  await tigris.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl ?? 'public, max-age=31536000, immutable'
    })
  )

  return publicUrl(key)
}
