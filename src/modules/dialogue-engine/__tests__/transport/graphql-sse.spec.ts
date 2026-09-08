import { sseResponse } from './http-fixtures'
import { describe, expect, it, vi } from 'vitest'
import { parse } from 'graphql'
import { GraphqlSseService } from '../../transport/graphql/GraphqlSseService'

describe('SSE HTTP transport', () => {
  it('reads GraphQL SSE frames and surfaces GraphQL execution errors', async () => {
    const fetchMock = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(sseResponse({ data: { ping: 'first' } }, { errors: [{ message: 'Cursor expired' }] }))
    const service = new GraphqlSseService({ endpoint: 'http://localhost/graphql', fetch: fetchMock })
    const receive = vi.fn(async () => undefined)
    const controller = new AbortController()

    await expect(
      service.consume(parse('subscription { ping }'), { after: 'snapshot' }, controller.signal, receive, vi.fn()),
    ).rejects.toThrow('Cursor expired')

    expect(receive).toHaveBeenCalledWith({ ping: 'first' })
    expect(String(fetchMock.mock.calls[0][1]?.body)).toContain('snapshot')
  })
})
