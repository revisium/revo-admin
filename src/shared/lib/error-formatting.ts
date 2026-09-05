type GraphqlErrorDetails =
  | { readonly recognized: false }
  | { readonly recognized: true; readonly message: string | undefined }

const graphqlErrorDetailsOf = (error: unknown): GraphqlErrorDetails => {
  if (typeof error !== 'object' || error === null || !('response' in error)) return { recognized: false }
  const response = error.response
  if (typeof response !== 'object' || response === null) return { recognized: false }

  if ('errors' in response && Array.isArray(response.errors)) {
    const firstError = response.errors[0]
    if (typeof firstError === 'object' && firstError !== null && 'message' in firstError) {
      const message = typeof firstError.message === 'string' ? firstError.message.trim() : ''
      if (message) return { recognized: true, message }
    }
  }

  if (!('request' in error) || !('status' in response)) return { recognized: false }
  const status = response.status
  return {
    recognized: true,
    message: typeof status === 'number' ? `GraphQL request failed (status ${status}).` : undefined,
  }
}

export function errorMessageOf(error: unknown): string | undefined
export function errorMessageOf(error: unknown, fallback: string): string
export function errorMessageOf(error: unknown, fallback?: string): string | undefined {
  const graphqlError = graphqlErrorDetailsOf(error)
  if (graphqlError.recognized) return graphqlError.message ?? fallback
  return error instanceof Error && error.message ? error.message : fallback
}
