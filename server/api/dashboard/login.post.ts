import { createError, readBody } from 'h3'

export default defineEventHandler(async (event): Promise<{ user?: DashboardDirectusUser }> => {
  const body = await readBody<{ email?: string, password?: string }>(event)
  const email = body.email?.trim()
  const password = body.password

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required.'
    })
  }

  try {
    const response = await $fetch<{
      data?: {
        access_token: string
        refresh_token?: string
        expires?: number
      }
    }>(`${getDashboardDirectusUrl(event)}/auth/login`, {
      method: 'POST',
      body: {
        email,
        password,
        mode: 'json'
      }
    })

    if (!response.data?.access_token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Sign-in did not return a session.'
      })
    }

    setDashboardAuthCookies(event, response.data)

    const user: DashboardDirectusUser | undefined = await getDashboardUserWithToken(event, response.data.access_token)

    return { user }
  } catch (error) {
    const fetchError = error as {
      response?: { status?: number }
      status?: number
      statusCode?: number
      statusMessage?: string
      data?: { errors?: Array<{ message?: string }>, message?: string }
      message?: string
    }
    const statusCode = fetchError.response?.status
      || fetchError.statusCode
      || fetchError.status
      || 401
    const upstreamMessage = fetchError.data?.errors?.[0]?.message || fetchError.data?.message
    const statusMessage = statusCode === 401
      ? 'Invalid credentials.'
      : fetchError.statusMessage || upstreamMessage || fetchError.message || 'Could not sign in.'

    throw createError({
      statusCode,
      statusMessage
    })
  }
})
