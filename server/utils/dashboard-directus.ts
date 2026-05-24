// Phase 4 trimmed this file to its post-auth-swap residue. The Better Auth
// module now owns sign-in / sign-out / session cookies; this helper survives
// only to keep the dashboard data routes (posts, pages, submissions) calling
// Directus until Phase 5 swaps them to Prisma.
//
// Once Phase 5 lands every `dashboardDirectusRequest(...)` call site, this
// file can be deleted in Phase 7 along with `nuxt-directus`.

import { createError, type H3Event } from 'h3'

export const getDashboardDirectusUrl = (event: H3Event) => {
  const config = useRuntimeConfig(event)
  const directusUrl = String(config.public.directus.url || '').replace(/\/$/, '')

  if (!directusUrl) {
    throw createError({
      statusCode: 503,
      statusMessage: 'CMS is not configured.'
    })
  }

  return directusUrl
}

const toDashboardError = (error: unknown) => {
  const fetchError = error as {
    response?: { status?: number }
    status?: number
    statusCode?: number
    data?: { errors?: Array<{ message?: string }> }
    message?: string
  }
  const statusCode = fetchError.response?.status || fetchError.statusCode || fetchError.status || 500
  const message = fetchError.data?.errors?.[0]?.message || fetchError.message || 'CMS request failed.'

  return createError({
    statusCode,
    statusMessage: statusCode === 403
      ? 'Your role does not have permission for this action.'
      : message,
    data: fetchError.data
  })
}

// Server-side calls now use the static DIRECTUS_SERVER_TOKEN (Phase 4 deleted
// the per-user Directus session flow). Phase 5 will rewrite each call site to
// use Prisma instead, after which this helper goes away entirely.
export const dashboardDirectusRequest = async <T>(
  event: H3Event,
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    query?: Record<string, unknown>
    body?: Record<string, unknown>
  } = {}
): Promise<T> => {
  const config = useRuntimeConfig(event)
  const token = config.directusToken

  if (!token) {
    throw createError({
      statusCode: 503,
      statusMessage: 'CMS server token not configured.'
    })
  }

  try {
    const response = await $fetch(`${getDashboardDirectusUrl(event)}${path}`, {
      method: options.method || 'GET',
      query: options.query,
      body: options.body,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response as T
  } catch (error) {
    throw toDashboardError(error)
  }
}
