import { parse } from 'graphql'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GraphqlSubscriptions, SubscriptionExecutionError, SubscriptionOverflowError } from '..'
import type { GraphqlSubscriptionsOptions, SubscriptionOptions } from '..'
import { multiplexServer } from './multiplex-server'
import { DialogueEngine, GraphqlDialogueBackend, PersistentCommandStorage } from 'src/modules/dialogue-engine'

type Data = { message: string }
type Variables = { scope: string; after?: string }
const document: TypedDocumentNode<Data, Variables> = parse(
  'subscription Message($scope: String!, $after: String) { message(scope: $scope, after: $after) }',
)
const cleanup: (() => void | Promise<void>)[] = []

afterEach(async () => {
  for (const dispose of cleanup.reverse()) await dispose()
  cleanup.length = 0
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function setup(options: Partial<GraphqlSubscriptionsOptions> = {}) {
  const server = await multiplexServer()
  cleanup.push(() => server.close())
  const service = new GraphqlSubscriptions({
    endpoint: server.endpoint,
    enabled: () => true,
    idleGraceMs: 0,
    retryDelayMs: 10,
    ...options,
  })
  cleanup.push(() => service.dispose())

  function subscribe(scope: string, extra: Partial<SubscriptionOptions<Data, Variables>> = {}) {
    return service.subscribe(document, {
      signal: new AbortController().signal,
      prepare: () => ({ scope }),
      next: () => {},
      ...extra,
    })
  }

  return { server, service, subscribe }
}

describe('Shared multiplex subscription transport', () => {
  it('uses one physical GET for several operations and cancels each independently', async () => {
    const { server, subscribe } = await setup()
    const first = subscribe('first')
    const next = vi.fn()
    const second = subscribe('second', { next })
    await vi.waitFor(() => expect(server.active.size).toBe(2))
    expect(
      server.requests.filter((method) => method === 'GET'),
      JSON.stringify(server.wire),
    ).toHaveLength(1)
    first.dispose()
    await first.done
    await vi.waitFor(() => expect(server.active.size).toBe(1))
    server.push('second', 'live')
    await vi.waitFor(() => expect(next).toHaveBeenCalledWith({ message: 'live' }, expect.any(AbortSignal)))
    expect(server.streams.size).toBe(1)
    second.dispose()
    await vi.waitFor(() => expect(server.streams.size).toBe(0))
  })

  it('isolates operation GraphQL and HTTP authorization errors from healthy subscriptions', async () => {
    const { server, subscribe } = await setup()
    const next = vi.fn()
    const healthy = subscribe('healthy', { next })
    const forbidden = subscribe('forbidden')
    await vi.waitFor(() => expect(server.active.size).toBe(2))
    server.push('forbidden', 'FORBIDDEN')
    await expect(forbidden.done).rejects.toBeInstanceOf(SubscriptionExecutionError)
    server.reject.set('POST', 403)
    const denied = subscribe('denied')
    await expect(denied.done).rejects.toThrow()
    server.push('healthy', 'still live')
    await vi.waitFor(() => expect(next).toHaveBeenCalled())
    expect(
      server.requests.filter((method) => method === 'GET'),
      JSON.stringify(server.wire),
    ).toHaveLength(1)
    healthy.dispose()
  })

  it('reconnects once and waits for an old async apply before preparing fresh cursors', async () => {
    const { server, subscribe } = await setup()
    let cursor = 'snapshot'
    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const next = vi.fn(async () => {
      await gate
      cursor = 'applied'
    })
    subscribe('first', { prepare: () => ({ scope: 'first', after: cursor }), next })
    subscribe('second')
    await vi.waitFor(() => expect(server.active.size).toBe(2))
    server.push('first', 'update')
    await vi.waitFor(() => expect(next).toHaveBeenCalled())
    server.sever()
    await vi.waitFor(() => expect(server.subscriptions.filter((item) => item.scope === 'second')).toHaveLength(2))
    expect(server.subscriptions.filter((item) => item.scope === 'first')).toHaveLength(1)
    release()
    await vi.waitFor(() => expect(server.subscriptions.filter((item) => item.scope === 'first')).toHaveLength(2))
    expect(server.subscriptions.at(-1)?.after).toBe('applied')
    expect(
      server.requests.filter((method) => method === 'GET'),
      JSON.stringify(server.wire),
    ).toHaveLength(2)
  })

  it('applies events in order and makes overflow explicit without blocking another operation', async () => {
    const { server, subscribe } = await setup({ queueLimit: 2 })
    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const slow = subscribe('slow', { next: () => gate })
    const next = vi.fn()
    subscribe('fast', { next })
    await vi.waitFor(() => expect(server.active.size).toBe(2))
    for (const value of ['a', 'b', 'c', 'd', 'e']) server.push('slow', value)
    server.push('fast', 'independent')
    await vi.waitFor(() => expect(next).toHaveBeenCalled())
    release()
    await expect(slow.done).rejects.toBeInstanceOf(SubscriptionOverflowError)
    expect(server.streams.size).toBe(1)
  })

  it('supports bounded operation-local recovery from the current applied position', async () => {
    const { server, subscribe } = await setup()
    let failed = false
    const recover = vi.fn(() => true)
    const prepare = vi.fn(() => {
      if (!failed) {
        failed = true
        throw new Error('Temporary snapshot failure')
      }
      return { scope: 'recovered', after: 'fresh' }
    })
    subscribe('recovered', { prepare, recover })
    subscribe('healthy')
    await vi.waitFor(() => expect(server.active.size).toBe(2))
    expect(prepare).toHaveBeenCalledTimes(2)
    expect(recover).toHaveBeenCalledOnce()
    expect(
      server.requests.filter((method) => method === 'GET'),
      JSON.stringify(server.wire),
    ).toHaveLength(1)
  })

  it('stops globally after physical authentication rejection or bounded reconnect exhaustion', async () => {
    const { server, service, subscribe } = await setup({ retryAttempts: 1 })
    server.reject.set('PUT', 401)
    const denied = subscribe('denied')
    await expect(denied.done).rejects.toThrow('access denied')
    expect(service.status).toBe('Stopped')
    expect(server.requests).toEqual(['PUT'])
  })

  it('bounds shared retry attempts even when GET briefly connects before closing', async () => {
    const { server, service, subscribe } = await setup({ retryAttempts: 1 })
    const lease = subscribe('active')
    await vi.waitFor(() => expect(server.active.size).toBe(1))
    server.sever()
    await vi.waitFor(() =>
      expect(
        server.requests.filter((method) => method === 'GET'),
        JSON.stringify(server.wire),
      ).toHaveLength(2),
    )
    server.sever()
    await expect(lease.done).rejects.toThrow('exhausted')
    expect(service.status).toBe('Stopped')
    expect(
      server.requests.filter((method) => method === 'GET'),
      JSON.stringify(server.wire),
    ).toHaveLength(2)
  })

  it('measures liveness on the persistent stream and cleans it on last release', async () => {
    const { server, subscribe } = await setup({ heartbeatTimeoutMs: 100 })
    const first = subscribe('first')
    await vi.waitFor(() => expect(server.active.size).toBe(1))
    const second = subscribe('second')
    await vi.waitFor(() => expect(server.active.size).toBe(2))
    await vi.waitFor(() => expect(server.requests.filter((method) => method === 'GET').length).toBeGreaterThan(1))
    first.dispose()
    second.dispose()
    await vi.waitFor(() => expect(server.streams.size).toBe(0))
    const attempts = server.requests.length
    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(server.requests).toHaveLength(attempts)
  })

  it('normal completion is terminal and canceled initial signals perform no IO', async () => {
    const { server, subscribe } = await setup()
    const controller = new AbortController()
    controller.abort()
    await subscribe('canceled', { signal: controller.signal }).done
    expect(server.requests).toEqual([])
    const complete = vi.fn()
    const lease = subscribe('finite', { complete })
    await vi.waitFor(() => expect(server.subscriptions).toHaveLength(1))
    await server.subscriptions[0].source.return()
    await lease.done
    expect(complete).toHaveBeenCalledOnce()
    expect(server.requests.filter((method) => method === 'POST')).toHaveLength(1)
  })

  it('does not let lifecycle observer exceptions interrupt other operations', async () => {
    const { server, subscribe } = await setup()
    subscribe('broken', {
      changed: () => {
        throw new Error('Broken observer')
      },
      error: () => {
        throw new Error('Broken error observer')
      },
    })
    const next = vi.fn()
    subscribe('healthy', { next })
    await vi.waitFor(() => expect(server.active.size).toBe(1))
    server.push('healthy', 'live')
    await vi.waitFor(() => expect(next).toHaveBeenCalled())
  })

  it('exhausts local recovery without reconnecting the shared stream', async () => {
    const { server, subscribe } = await setup()
    subscribe('healthy')
    const prepare = vi.fn(() => {
      throw new Error('Permanent snapshot failure')
    })
    const failing = subscribe('failing', { prepare, recover: () => true })
    await expect(failing.done).rejects.toThrow('Permanent snapshot failure')
    expect(prepare).toHaveBeenCalledTimes(4)
    await vi.waitFor(() => expect(server.active.size).toBe(1))
    expect(
      server.requests.filter((method) => method === 'GET'),
      JSON.stringify(server.wire),
    ).toHaveLength(1)
  })

  it('ignores late prepare resolution after cancellation and does not post the operation', async () => {
    const { server, subscribe } = await setup()
    let resolve = () => {}
    const gate = new Promise<void>((done) => {
      resolve = done
    })
    const prepare = vi.fn(async () => {
      await gate
      return { scope: 'abandoned' }
    })
    const next = vi.fn()
    const lease = subscribe('abandoned', { prepare, next })
    await vi.waitFor(() => expect(prepare).toHaveBeenCalled())
    lease.dispose()
    resolve()
    await lease.done
    await vi.waitFor(() => expect(server.streams.size).toBe(0))
    expect(server.requests.filter((method) => method === 'POST')).toHaveLength(0)
    expect(next).not.toHaveBeenCalled()
  })

  it('serializes async applications and discards queued callbacks after cancellation', async () => {
    const { server, subscribe } = await setup()
    let resolve = () => {}
    const gate = new Promise<void>((done) => {
      resolve = done
    })
    const seen: string[] = []
    const next = vi.fn(async (data: Data) => {
      await gate
      seen.push(data.message)
    })
    const lease = subscribe('ordered', { next })
    await vi.waitFor(() => expect(server.active.size).toBe(1))
    server.push('ordered', 'one')
    server.push('ordered', 'two')
    await vi.waitFor(() => expect(next).toHaveBeenCalledTimes(1))
    expect(seen).toEqual([])
    resolve()
    await vi.waitFor(() => expect(seen).toEqual(['one', 'two']))
    lease.dispose()
    server.push('ordered', 'late')
    await lease.done
    expect(next).toHaveBeenCalledTimes(2)
  })

  it('replays an overflowing operation locally after the prior apply settles', async () => {
    const { server, subscribe } = await setup({ queueLimit: 1 })
    let resolve = () => {}
    const gate = new Promise<void>((done) => {
      resolve = done
    })
    let cursor = 'initial'
    const recover = vi.fn((error) => error instanceof SubscriptionOverflowError)
    const next = vi.fn(async (data: Data) => {
      await gate
      cursor = data.message
    })
    subscribe('slow', { prepare: () => ({ scope: 'slow', after: cursor }), next, recover })
    subscribe('healthy')
    await vi.waitFor(() => expect(server.active.size).toBe(2))
    server.push('slow', 'applied')
    await vi.waitFor(() => expect(next).toHaveBeenCalledOnce())
    server.push('slow', 'queued')
    server.push('slow', 'overflow')
    await vi.waitFor(() => expect(server.active.size).toBe(1))
    resolve()
    await vi.waitFor(() => expect(server.subscriptions.filter((item) => item.scope === 'slow')).toHaveLength(2))
    expect(server.subscriptions.at(-1)?.after).toBe('applied')
    expect(recover).toHaveBeenCalledOnce()
    expect(
      server.requests.filter((method) => method === 'GET'),
      JSON.stringify(server.wire),
    ).toHaveLength(1)
  })

  it('stops timers while offline, resumes once online, and removes lifecycle listeners', async () => {
    const window = new EventTarget()
    const navigator = { onLine: true }
    vi.stubGlobal('window', window)
    vi.stubGlobal('navigator', navigator)
    const remove = vi.spyOn(window, 'removeEventListener')
    const { server, service, subscribe } = await setup()
    const first = subscribe('first')
    const second = subscribe('second')
    await vi.waitFor(() => expect(server.active.size).toBe(2))
    navigator.onLine = false
    window.dispatchEvent(new Event('offline'))
    expect(service.status).toBe('Offline')
    await vi.waitFor(() => expect(server.streams.size).toBe(0))
    navigator.onLine = true
    window.dispatchEvent(new Event('online'))
    window.dispatchEvent(new Event('online'))
    await vi.waitFor(() => expect(server.active.size).toBe(2))
    expect(
      server.requests.filter((method) => method === 'GET'),
      JSON.stringify(server.wire),
    ).toHaveLength(2)
    first.dispose()
    second.dispose()
    expect(remove).toHaveBeenCalledWith('offline', expect.any(Function))
    expect(remove).toHaveBeenCalledWith('online', expect.any(Function))
    await vi.waitFor(() => expect(server.streams.size).toBe(0))
    window.dispatchEvent(new Event('online'))
    expect(
      server.requests.filter((method) => method === 'GET'),
      JSON.stringify(server.wire),
    ).toHaveLength(2)
  })

  it('releasing the dialogue engine leaves unrelated feature leases connected', async () => {
    const { server, service, subscribe } = await setup()
    const backend = new GraphqlDialogueBackend({ endpoint: server.endpoint }, service)
    vi.spyOn(backend, 'list').mockResolvedValue({ items: [], snapshot: 'list-snapshot', total: 0 })
    // The domain port uses the fixture subscription while preserving actual engine lease ownership.
    vi.spyOn(backend, 'watch').mockImplementation(
      (scope, options) =>
        service.subscribe(document, {
          signal: options.signal,
          prepare: async (signal) => ({ scope: scope ?? 'summaries', after: await options.prepare(signal) }),
          changed: options.changed,
          next: () => {},
        }).done,
    )
    const engine = new DialogueEngine(backend, new PersistentCommandStorage())
    const next = vi.fn()
    const unrelated = subscribe('another-feature', { next })
    engine.start()
    engine.get('unopened')
    await vi.waitFor(() => expect(server.active.size).toBe(2))
    expect(server.subscriptions.map((item) => item.scope).sort()).toEqual(['another-feature', 'summaries'])
    engine.dispose()
    await vi.waitFor(() => expect(server.active.size).toBe(1))
    server.push('another-feature', 'still connected')
    await vi.waitFor(() => expect(next).toHaveBeenCalled())
    expect(
      server.requests.filter((method) => method === 'GET'),
      JSON.stringify(server.wire),
    ).toHaveLength(1)
    unrelated.dispose()
  })

  it('does not reuse the protocol token or mutate injected headers on reconnect', async () => {
    const headers = { 'X-Workspace': 'test' }
    const reservationTokens: (string | null)[] = []
    const fetch = vi.fn<typeof globalThis.fetch>((input, init) => {
      if (init?.method === 'PUT') reservationTokens.push(new Headers(init.headers).get('x-graphql-event-stream-token'))

      return globalThis.fetch(input, init)
    })
    const { server, subscribe } = await setup({ headers, fetch })
    subscribe('active')
    await vi.waitFor(() => expect(server.active.size).toBe(1))
    server.sever()
    await vi.waitFor(() => expect(server.subscriptions).toHaveLength(2))
    expect(headers).toEqual({ 'X-Workspace': 'test' })
    const reservations = fetch.mock.calls.filter(([, init]) => init?.method === 'PUT')
    expect(reservations).toHaveLength(2)
    expect(reservationTokens).toEqual([null, null])
    expect(new Headers(reservations[0][1]?.headers).get('X-Workspace')).toBe('test')
    expect(reservations[0][1]?.headers).not.toBe(reservations[1][1]?.headers)
  })

  it('preserves coded HTTP GraphQL rejections and cleans the rejected operation reservation', async () => {
    const { server, subscribe } = await setup()
    subscribe('healthy')
    await vi.waitFor(() => expect(server.active.size).toBe(1))
    server.reject.set('POST', 400)
    server.rejectionBodies.set('POST', {
      errors: [{ message: 'Replay expired.', extensions: { code: 'INVALID_CURSOR' } }],
    })
    const lease = subscribe('invalid-cursor')
    await expect(lease.done).rejects.toMatchObject({
      errors: [{ message: 'Replay expired.', extensions: { code: 'INVALID_CURSOR' } }],
    })
    expect(server.requests.filter((method) => method === 'DELETE')).toHaveLength(1)
    expect(server.streams.size).toBe(1)
  })

  it('cleans a server operation canceled before its POST acknowledgement reaches the client', async () => {
    let release = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const fetch: typeof globalThis.fetch = async (input, init) => {
      const response = await globalThis.fetch(input, init)

      if (init?.method === 'POST') await gate

      return response
    }
    const { server, subscribe } = await setup({ fetch, idleGraceMs: 1000 })
    const lease = subscribe('abandoned')
    await vi.waitFor(() => expect(server.active.size).toBe(1))
    lease.dispose()
    release()
    await vi.waitFor(() => expect(server.active.size).toBe(0))
    expect(server.requests.filter((method) => method === 'DELETE')).toHaveLength(1)
  })
})
