import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event): Promise<{ success: true }> => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Page id is required.'
    })
  }

  await dashboardDirectusRequest(event, `/items/pages/${id}`, {
    method: 'DELETE'
  })

  return { success: true }
})
