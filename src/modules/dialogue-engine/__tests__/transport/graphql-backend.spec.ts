import { describe, expect, it, vi } from 'vitest'
import { GraphqlDialogueBackend } from '../..'
import { graphqlResponse, sseResponse } from './http-fixtures'

describe('Self-contained GraphQL adapter', () => {
  it('loads a dialogue using injected HTTP configuration and its own operation client', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(graphqlResponse({ dialogue: { id: 'chat', title: 'Planning' } }))
    const backend = new GraphqlDialogueBackend({
      endpoint: 'https://core.local/graphql',
      fetch,
      headers: { 'X-Workspace': 'test' },
      credentials: 'omit',
    })

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

  it('uses the same injected transport for SSE and forwards the resume cursor', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      sseResponse({
        data: { dialogueChanges: { cursor: 'next', dialogueId: 'chat', kind: 'SUMMARY_UPDATED' } },
      }),
    )
    const backend = new GraphqlDialogueBackend({ endpoint: 'https://core.local/graphql', fetch })
    const receive = vi.fn(async () => {})
    const controller = new AbortController()

    await backend.watch('chat', 'snapshot', controller.signal, receive, vi.fn())

    expect(receive).toHaveBeenCalledWith({ cursor: 'next', dialogueId: 'chat', kind: 'SUMMARY_UPDATED' })
    const request = JSON.parse(String(fetch.mock.calls[0][1]?.body))
    expect(request.variables).toEqual({ ids: ['chat'], after: 'snapshot' })
  })
})
