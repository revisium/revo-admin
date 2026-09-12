import { getEnv } from 'src/shared/lib/getEnv'

const GRAPHQL_PATH = '/graphql'

const withGraphqlPath = (origin: string): string => new URL(GRAPHQL_PATH, origin).toString()

export const resolveGraphqlHttpUrl = (origin?: string): string => {
  if (origin) {
    return withGraphqlPath(origin)
  }

  return getEnv('REACT_APP_GRAPHQL_SERVER_URL') ?? GRAPHQL_PATH
}

export const resolveGraphqlSseUrl = (origin?: string): string => {
  const endpoint = resolveGraphqlHttpUrl(origin)

  return `${endpoint.replace(/\/$/, '')}/stream`
}

export { GRAPHQL_PATH }
