type DirectusForm = {
  id: string
  is_active?: boolean
  on_success?: 'message' | 'redirect'
  success_message?: string
  success_redirect_url?: string
}

type DirectusFormField = {
  id: string
  name?: string
  type?: string
  required?: boolean
  validation?: string
}

type SubmitBody = {
  formId?: string
  values?: Record<string, unknown>
  website?: string
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value))

const normalizeValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(item => String(item)).filter(Boolean).join(', ')
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return typeof value === 'string' ? value.trim() : String(value ?? '').trim()
}

const validateField = (field: DirectusFormField, value: string) => {
  if (field.required && !value) {
    return `${field.name || 'Field'} is required.`
  }

  const rules = String(field.validation || '').split('|').filter(Boolean)

  for (const rule of rules) {
    if (!value) {
      continue
    }

    if (rule === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${field.name || 'Email'} must be a valid email address.`
    }

    if (rule === 'url') {
      try {
        new URL(value)
      } catch {
        return `${field.name || 'URL'} must be a valid URL.`
      }
    }

    if (rule.startsWith('min:') && value.length < Number(rule.split(':')[1])) {
      return `${field.name || 'Field'} is too short.`
    }

    if (rule.startsWith('max:') && value.length > Number(rule.split(':')[1])) {
      return `${field.name || 'Field'} is too long.`
    }

    if (rule.startsWith('length:') && value.length !== Number(rule.split(':')[1])) {
      return `${field.name || 'Field'} has the wrong length.`
    }
  }

  return undefined
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const directusUrl = String(config.public.directus.url || '').replace(/\/$/, '')
  const directusToken = process.env.DIRECTUS_SERVER_TOKEN
    || process.env.DIRECTUS_TOKEN
    || String(config.directusToken || '')

  if (!directusUrl || !directusToken) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Form submissions are not configured.'
    })
  }

  const body = await readBody<SubmitBody>(event)

  if (body.website) {
    return { ok: true }
  }

  if (!body.formId || !isPlainObject(body.values)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid form submission.'
    })
  }

  const headers = {
    Authorization: `Bearer ${directusToken}`
  }
  const [formResponse, fieldsResponse] = await Promise.all([
    $fetch<{ data?: DirectusForm }>(`${directusUrl}/items/forms/${body.formId}`, {
      headers,
      query: {
        fields: 'id,is_active,on_success,success_message,success_redirect_url'
      }
    }),
    $fetch<{ data?: DirectusFormField[] }>(`${directusUrl}/items/form_fields`, {
      headers,
      query: {
        fields: 'id,name,type,required,validation,sort',
        filter: { form: { _eq: body.formId } },
        sort: 'sort',
        limit: -1
      }
    })
  ])
  const form = formResponse.data
  const fields = fieldsResponse.data || []

  if (!form?.id || form.is_active === false) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Form not found.'
    })
  }

  const errors: Record<string, string> = {}
  const values = fields
    .filter(field => field.type !== 'hidden' && field.type !== 'file')
    .map((field, index) => {
      const value = normalizeValue(field.name ? body.values?.[field.name] : '')
      const error = validateField(field, value)

      if (error && field.name) {
        errors[field.name] = error
      }

      return {
        field: field.id,
        value,
        sort: index + 1
      }
    })

  if (Object.keys(errors).length) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Please check the form fields.',
      data: { errors }
    })
  }

  await $fetch(`${directusUrl}/items/form_submissions`, {
    method: 'POST',
    headers,
    body: {
      form: form.id,
      values
    }
  })

  setResponseStatus(event, 201)

  return {
    ok: true,
    onSuccess: form.on_success || 'message',
    successMessage: form.success_message,
    successRedirectUrl: form.success_redirect_url
  }
})
