import { describe, expect, it, vi } from 'vitest'
import { GraphqlSubscriptions, type SubscriptionTransport } from 'src/modules/graphql-subscriptions'
import { GraphqlDialogueBackend } from '../..'
import { graphqlResponse } from './http-fixtures'

describe('Self-contained GraphQL adapter', () => {
  it('loads a dialogue using injected HTTP configuration and its own operation client', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(graphqlResponse({ dialogue: { id: 'chat', title: 'Planning' } }))
    const backend = new GraphqlDialogueBackend(
      {
        endpoint: 'https://core.local/graphql',
        fetch,
        headers: { 'X-Workspace': 'test' },
        credentials: 'omit',
      },
      new GraphqlSubscriptions({ endpoint: 'https://core.local/graphql/stream' }),
    )
    const result = await backend.details('chat')

    expect(result.title).toBe('Planning')
    const [url, request] = fetch.mock.calls[0]
    expect(url).toBe('https://core.local/graphql')
    expect(request?.credentials).toBe('omit')
    expect(new Headers(request?.headers).get('X-Workspace')).toBe('test')
    const body = JSON.parse(String(request?.body))
    expect(body.query).toContain('query DialogueDetails')
    expect(body.variables).toEqual({ id: 'chat' })
  })

  it('prepares subscription cursors afresh through the injected shared transport', async () => {
    let cursor = 'snapshot'
    const receive = vi.fn(async () => {})
    const called = vi.fn()
    const subscribe: SubscriptionTransport['subscribe'] = (_document, options) => {
      called()
      const done = Promise.resolve(options.prepare(options.signal)).then(async (variables) => {
        expect(variables).toEqual({ ids: ['chat'], after: 'snapshot' })
        cursor = 'applied'
        expect(await options.prepare(options.signal)).toEqual({ ids: ['chat'], after: 'applied' })
      })

      return { dispose: vi.fn(), done }
    }
    const backend = new GraphqlDialogueBackend({ endpoint: 'https://core.local/graphql' }, { subscribe })
    await backend.watch('chat', {
      signal: new AbortController().signal,
      prepare: async () => cursor,
      receive,
      changed: vi.fn(),
      recover: () => false,
    })
    expect(called).toHaveBeenCalledOnce()
  })
})
