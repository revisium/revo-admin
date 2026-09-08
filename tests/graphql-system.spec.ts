import { parse } from 'graphql'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GraphqlService, GraphqlSubscriptions, resolveGraphqlHttpUrl, resolveGraphqlSseUrl } from 'src/shared/api'

const GRAPHQL_ENDPOINT = 'http://admin.test/graphql'
const HTTP_ORIGIN = 'http://127.0.0.1:5173/runs'
const HTTPS_ORIGIN = 'https://admin.revisium.test/runs'

const SYSTEM_INFO = { name: 'revo-core', status: 'ok' }

const SYSTEM_INFO_RESPONSE = { data: { systemInfo: SYSTEM_INFO } }

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.REVO_ADMIN_GRAPHQL_HTTP_URL
  delete process.env.REVO_ADMIN_GRAPHQL_ENDPOINT
})

describe('GraphQL endpoints', () => {
  it('resolves same-origin HTTP and SSE URLs from a request origin', () => {
    expect(resolveGraphqlHttpUrl(HTTP_ORIGIN)).toBe('http://127.0.0.1:5173/graphql')
    expect(resolveGraphqlSseUrl(HTTP_ORIGIN)).toBe('http://127.0.0.1:5173/graphql/stream')
    expect(resolveGraphqlSseUrl(HTTPS_ORIGIN)).toBe('https://admin.revisium.test/graphql/stream')
  })

  it('uses explicit GraphQL environment overrides', () => {
    process.env.REVO_ADMIN_GRAPHQL_HTTP_URL = GRAPHQL_ENDPOINT

    expect(resolveGraphqlHttpUrl(HTTP_ORIGIN)).toBe(GRAPHQL_ENDPOINT)
    expect(resolveGraphqlSseUrl(HTTP_ORIGIN)).toBe('http://admin.test/graphql/stream')
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

describe('Shared subscription composition', () => {
  it('does not connect during server-side rendering', async () => {
    const fetch = vi.fn()
    const service = new GraphqlSubscriptions({ endpoint: GRAPHQL_ENDPOINT, fetch })
    const controller = new AbortController()
    const lease = service.subscribe(parse('subscription { ping }'), {
      signal: controller.signal,
      prepare: () => ({}),
      next: vi.fn(),
    })
    await lease.done
    expect(fetch).not.toHaveBeenCalled()
    service.dispose()
  })
})
