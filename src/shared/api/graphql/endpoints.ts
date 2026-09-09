const GRAPHQL_PATH = '/graphql'
const DEFAULT_GRAPHQL_ORIGIN = 'http://127.0.0.1:19222'

const processEnv = (key: string): string | undefined => {
  if (typeof process === 'undefined') {
    return undefined
  }

  return process.env[key]
}

const browserLocation = (): Location | undefined => {
  if (globalThis.window === undefined) {
    return undefined
  }

  return globalThis.window.location
}

const withGraphqlPath = (origin: string): string => new URL(GRAPHQL_PATH, origin).toString()

export const resolveGraphqlHttpUrl = (origin?: string): string => {
  const explicit = processEnv('REVO_ADMIN_GRAPHQL_HTTP_URL') ?? processEnv('REVO_ADMIN_GRAPHQL_ENDPOINT')
  if (explicit) {
    return explicit
  }

  if (origin) {
    return withGraphqlPath(origin)
  }

  if (browserLocation()) {
    return GRAPHQL_PATH
  }

  return withGraphqlPath(DEFAULT_GRAPHQL_ORIGIN)
}

export const resolveGraphqlSseUrl = (origin?: string): string => {
  const endpoint = resolveGraphqlHttpUrl(origin)

  return `${endpoint.replace(/\/$/, '')}/stream`
}

export { GRAPHQL_PATH }
