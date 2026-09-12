import { afterEach, describe, expect, it, vi } from 'vitest'
import { GraphqlService, resolveGraphqlHttpUrl, resolveGraphqlSseUrl } from 'src/shared/api'

const GRAPHQL_ENDPOINT = 'http://admin.test/graphql'
const HTTP_ORIGIN = 'http://127.0.0.1:5173/runs'
const HTTPS_ORIGIN = 'https://admin.revisium.test/runs'

const SYSTEM_INFO = { name: 'revo-core', status: 'ok' }

const SYSTEM_INFO_RESPONSE = { data: { systemInfo: SYSTEM_INFO } }

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('GraphQL endpoints', () => {
  it('resolves same-origin HTTP and SSE URLs from a request origin', () => {
    expect(resolveGraphqlHttpUrl(HTTP_ORIGIN)).toBe('http://127.0.0.1:5173/graphql')
    expect(resolveGraphqlSseUrl(HTTP_ORIGIN)).toBe('http://127.0.0.1:5173/graphql/stream')
    expect(resolveGraphqlSseUrl(HTTPS_ORIGIN)).toBe('https://admin.revisium.test/graphql/stream')
  })

  it('uses the public build-time GraphQL URL override', () => {
    vi.stubEnv('REACT_APP_GRAPHQL_SERVER_URL', GRAPHQL_ENDPOINT)

    expect(resolveGraphqlHttpUrl()).toBe(GRAPHQL_ENDPOINT)
    expect(resolveGraphqlSseUrl()).toBe('http://admin.test/graphql/stream')
  })
})

describe('GraphqlService', () => {
  it('loads generated GraphQL SDK operations through the shared HTTP client', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(init?.body)).toContain('query SystemInfo')

      return new Response(JSON.stringify(SYSTEM_INFO_RESPONSE), {
        headers: { 'content-type': 'application/json' },
      })
    })

    const graphql = new GraphqlService({ endpoint: GRAPHQL_ENDPOINT, fetch: fetchMock })

    await expect(graphql.client.SystemInfo()).resolves.toEqual({ systemInfo: SYSTEM_INFO })
    expect(fetchMock).toHaveBeenCalledWith(GRAPHQL_ENDPOINT, expect.objectContaining({ method: 'POST' }))
  })
})
