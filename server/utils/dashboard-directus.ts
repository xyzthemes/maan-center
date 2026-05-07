import {
  createError,
  deleteCookie,
  getCookie,
  getRequestURL,
  setCookie,
  type H3Event
} from 'h3'

type DirectusAuthData = {
  access_token: string
  refresh_token?: string
  expires?: number
}

export type DashboardDirectusUser = {
  id: string
  email?: string
  first_name?: string
  last_name?: string
  role?: string | { id?: string, name?: string }
}

const accessCookie = 'maan_directus_access_token'
const refreshCookie = 'maan_directus_refresh_token'
const dashboardUserFields = 'id,email,first_name,last_name,role.id,role.name'

export const getDashboardDirectusUrl = (event: H3Event) => {
  const config = useRuntimeConfig(event)
  const directusUrl = String(config.public.directus.url || '').replace(/\/$/, '')

  if (!directusUrl) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Directus is not configured.'
    })
  }

  return directusUrl
}

export const setDashboardAuthCookies = (event: H3Event, data: DirectusAuthData) => {
  const secure = getRequestURL(event).protocol === 'https:'
  const accessMaxAge = data.expires ? Math.max(60, Math.floor(data.expires / 1000)) : 15 * 60

  setCookie(event, accessCookie, data.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: accessMaxAge
  })

  if (data.refresh_token) {
    setCookie(event, refreshCookie, data.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: 60 * 60 * 24 * 14
    })
  }
}

export const clearDashboardAuthCookies = (event: H3Event) => {
  deleteCookie(event, accessCookie, { path: '/' })
  deleteCookie(event, refreshCookie, { path: '/' })
}

const refreshDashboardToken = async (event: H3Event) => {
  const refreshToken = getCookie(event, refreshCookie)

  if (!refreshToken) {
    return undefined
  }

  try {
    const response = await $fetch<{ data?: DirectusAuthData }>(`${getDashboardDirectusUrl(event)}/auth/refresh`, {
      method: 'POST',
      body: {
        refresh_token: refreshToken,
        mode: 'json'
      }
    })
    const data = response.data

    if (!data?.access_token) {
      return undefined
    }

    setDashboardAuthCookies(event, data)

    return data.access_token
  } catch {
    clearDashboardAuthCookies(event)

    return undefined
  }
}

export const getDashboardAccessToken = async (event: H3Event) => {
  const token = getCookie(event, accessCookie) || await refreshDashboardToken(event)

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sign in with Directus to continue.'
    })
  }

  return token
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
  const message = fetchError.data?.errors?.[0]?.message || fetchError.message || 'Directus request failed.'

  return createError({
    statusCode,
    statusMessage: statusCode === 403
      ? 'Your Directus role does not have permission for this action.'
      : message,
    data: fetchError.data
  })
}

export const dashboardDirectusRequest = async <T>(
  event: H3Event,
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    query?: Record<string, unknown>
    body?: Record<string, unknown>
  } = {}
): Promise<T> => {
  const directusUrl = getDashboardDirectusUrl(event)
  const request = async (token: string): Promise<T> => {
    const response = await $fetch(`${directusUrl}${path}`, {
      method: options.method || 'GET',
      query: options.query,
      body: options.body,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response as T
  }

  try {
    return await request(await getDashboardAccessToken(event))
  } catch (error) {
    const statusCode = (error as { response?: { status?: number }, status?: number, statusCode?: number }).response?.status
      || (error as { status?: number, statusCode?: number }).statusCode
      || (error as { status?: number }).status

    if (statusCode === 401) {
      const refreshedToken = await refreshDashboardToken(event)

      if (refreshedToken) {
        try {
          return await request(refreshedToken)
        } catch (retryError) {
          throw toDashboardError(retryError)
        }
      }
    }

    throw toDashboardError(error)
  }
}

export const getDashboardUserWithToken = async (
  event: H3Event,
  token: string
): Promise<DashboardDirectusUser | undefined> => {
  const response = await $fetch<{ data?: DashboardDirectusUser }>(`${getDashboardDirectusUrl(event)}/users/me`, {
    query: {
      fields: dashboardUserFields
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return response.data
}

export const getDashboardUser = async (event: H3Event): Promise<DashboardDirectusUser | undefined> => {
  const response: { data?: DashboardDirectusUser } = await dashboardDirectusRequest<{ data?: DashboardDirectusUser }>(event, '/users/me', {
    query: {
      fields: dashboardUserFields
    }
  })

  return response.data
}
