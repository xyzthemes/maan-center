type DirectusSubmissionValue = {
  id: string
  value?: string | null
  field?: {
    name?: string
    label?: string
  }
}

type DirectusSubmission = {
  id: string
  timestamp?: string
  form?: {
    id?: string
    title?: string
  }
  values?: DirectusSubmissionValue[]
}

export default defineEventHandler(async (event): Promise<{
  submissions: Array<{
    id: string
    timestamp?: string
    form?: { id?: string, title?: string }
    values: Array<{ id: string, name: string, label: string, value: string }>
  }>
}> => {
  const response: { data?: DirectusSubmission[] } = await dashboardDirectusRequest<{ data?: DirectusSubmission[] }>(event, '/items/form_submissions', {
    query: {
      fields: 'id,timestamp,form.id,form.title,values.id,values.value,values.field.name,values.field.label',
      sort: '-timestamp',
      limit: 100
    }
  })

  return {
    submissions: (response.data || []).map((submission: DirectusSubmission) => ({
      id: submission.id,
      timestamp: submission.timestamp,
      form: submission.form,
      values: (submission.values || []).map((value: DirectusSubmissionValue) => ({
        id: value.id,
        name: value.field?.name || '',
        label: value.field?.label || value.field?.name || 'Field',
        value: value.value || ''
      }))
    }))
  }
})
