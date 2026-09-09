import { createServer, type ServerResponse } from 'node:http'
import { once } from 'node:events'
import { buildSchema, GraphQLError } from 'graphql/index.js'
import { createHandler } from 'graphql-sse/lib/use/http'
import { parse } from 'graphql'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { vi } from 'vitest'
import { GraphqlSubscriptions } from '..'
import type { GraphqlSubscriptionsOptions, SubscriptionOptions, SubscriptionState } from '..'
import { DialogueEngine, GraphqlDialogueBackend, PersistentCommandStorage } from 'src/modules/dialogue-engine'

const DELIVERY_SETTLE_MS = 20

class EventSource implements AsyncIterableIterator<{ message: string }> {
  private values: string[] = []
  private waiting?: (value: IteratorResult<{ message: string }>) => void
  private closed = false

  public constructor(private readonly close: () => void) {}

  public push(message: string): void {
    if (this.waiting) {
      const waiting = this.waiting
      this.waiting = undefined
      waiting({ done: false, value: { message } })
    } else {
      this.values.push(message)
    }
  }

  public async next(): Promise<IteratorResult<{ message: string }>> {
    const message = this.values.shift()

    if (message !== undefined) return { done: false, value: { message } }
    if (this.closed) return { done: true, value: undefined }

    return new Promise((resolve) => {
      this.waiting = resolve
    })
  }

  public async return(): Promise<IteratorResult<{ message: string }>> {
    this.closed = true
    this.waiting?.({ done: true, value: undefined })
    this.waiting = undefined
    this.close()

    return { done: true, value: undefined }
  }

  public [Symbol.asyncIterator]() {
    return this
  }
}

async function multiplexServer() {
  const subscriptions: { scope: string; after: string | undefined; source: EventSource }[] = []
  const active = new Set<EventSource>()
  const streams = new Set<ServerResponse>()
  const requests: string[] = []
  const reservations: (string | undefined)[] = []
  const reject = new Map<string, number>()
  const rejectionBodies = new Map<string, unknown>()
  const schema = buildSchema(
    'type Query { ping: String } type Subscription { message(scope: String!, after: String): String! }',
  )
  const field = schema.getSubscriptionType()?.getFields().message

  if (!field) throw new Error('Missing fixture field')
  field.subscribe = (_root, args: { scope: string; after?: string }) => {
    const source = new EventSource(() => active.delete(source))
    subscriptions.push({ scope: args.scope, after: args.after, source })
    active.add(source)

    return source
  }
  field.resolve = (event: { message: string }) => {
    if (event.message === 'FORBIDDEN') throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } })
    return event.message
  }
  const handler = createHandler({ schema })
  const server = createServer((request, response) => {
    const method = request.method ?? 'GET'
    requests.push(method)
    if (method === 'PUT') reservations.push(request.headers['x-graphql-event-stream-token'] as string | undefined)
    const status = reject.get(method)

    if (status) {
      reject.delete(method)
      const body = rejectionBodies.get(method)
      rejectionBodies.delete(method)
      response
        .writeHead(status, { 'content-type': 'application/json' })
        .end(body === undefined ? undefined : JSON.stringify(body))
      return
    }

    if (method === 'GET') {
      streams.add(response)
      response.on('close', () => streams.delete(response))
    }

    handler(request, response).catch((error: unknown) => {
      if (!response.destroyed) response.destroy(error instanceof Error ? error : new Error(String(error)))
    })
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()

  if (!address || typeof address === 'string') throw new Error('Missing server address')

  return {
    endpoint: `http://127.0.0.1:${address.port}/graphql/stream`,
    subscriptions,
    active,
    requests,
    reservations,
    reject,
    rejectionBodies,
    streams,
    push(scope: string, message: string) {
      for (const subscription of subscriptions) {
        if (subscription.scope === scope && active.has(subscription.source)) subscription.source.push(message)
      }
    },
    sever() {
      for (const stream of streams) stream.destroy()
    },
    async close() {
      for (const source of active) await source.return()
      server.closeAllConnections()
      await new Promise<void>((resolve) => server.close(() => resolve()))
    },
  }
}

type Message = { message: string }
type Variables = { scope: string; after?: string }
type Callbacks = Partial<SubscriptionOptions<Message, Variables>>
interface FixtureOptions extends Partial<GraphqlSubscriptionsOptions> {
  acknowledgement?: Promise<void>
}
const document: TypedDocumentNode<Message, Variables> = parse(
  'subscription Message($scope: String!, $after: String) { message(scope: $scope, after: $after) }',
)

export function deferred() {
  let resolve = () => {}
  const promise = new Promise<void>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

/** Controls application events and connection failures around the real graphql-sse HTTP handler. */
export async function subscriptionFixture({ acknowledgement, ...options }: FixtureOptions = {}) {
  const server = await multiplexServer()
  const network = new EventTarget()
  const navigator = { onLine: true }
  vi.stubGlobal('window', network)
  vi.stubGlobal('navigator', navigator)
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const response = await (options.fetch ?? globalThis.fetch)(input, init)

    if (init?.method === 'POST') await acknowledgement

    return response
  }
  const transport = new GraphqlSubscriptions({
    endpoint: server.endpoint,
    idleGraceMs: 0,
    retryDelayMs: 10,
    ...options,
    fetch,
  })
  const engines: DialogueEngine[] = []

  return {
    get streamsOpened() {
      return server.requests.filter((method) => method === 'GET').length
    },
    get activeStreams() {
      return server.streams.size
    },
    get requests() {
      return server.requests
    },
    get reservationTokens() {
      return server.reservations
    },
    starts(scope: string) {
      return server.subscriptions.filter((item) => item.scope === scope).map(({ after }) => after)
    },
    subscribe(scope: string, callbacks: Callbacks = {}) {
      const received: string[] = []
      const states: SubscriptionState[] = []
      const lease = transport.subscribe(document, {
        ...callbacks,
        signal: callbacks.signal ?? new AbortController().signal,
        prepare: callbacks.prepare ?? (() => ({ scope })),
        next: async (data, signal) => {
          await callbacks.next?.(data, signal)
          received.push(data.message)
        },
        changed: (state) => {
          states.push(state)
          callbacks.changed?.(state)
        },
      })

      return { dispose: () => lease.dispose(), done: lease.done, received, states }
    },
    emit: server.push,
    disconnect: server.sever,
    async complete(scope: string) {
      await server.subscriptions
        .filter((item) => item.scope === scope)
        .at(-1)
        ?.source.return()
    },
    rejectConnection(status: number) {
      server.reject.set('PUT', status)
    },
    rejectOperation(status: number, body?: unknown) {
      server.reject.set('POST', status)
      if (body !== undefined) server.rejectionBodies.set('POST', body)
    },
    offline() {
      navigator.onLine = false
      network.dispatchEvent(new Event('offline'))
    },
    online() {
      navigator.onLine = true
      network.dispatchEvent(new Event('online'))
    },
    waitForActive: (count: number) => vi.waitUntil(() => server.active.size === count),
    waitForStreams: (count: number) => vi.waitUntil(() => server.streams.size === count),
    waitForStarts: (scope: string, count: number) =>
      vi.waitUntil(() => server.subscriptions.filter((item) => item.scope === scope).length === count),
    waitForMessages: (operation: { received: string[] }, count: number) =>
      vi.waitUntil(() => operation.received.length >= count),
    async settle() {
      await new Promise((resolve) => setTimeout(resolve, DELIVERY_SETTLE_MS))
    },
    startDialogueEngine() {
      const backend = new GraphqlDialogueBackend({ endpoint: server.endpoint }, transport)
      vi.spyOn(backend, 'list').mockResolvedValue({ items: [], snapshot: 'snapshot', total: 0 })
      vi.spyOn(backend, 'watch').mockImplementation(
        (scope, callbacks) =>
          transport.subscribe(document, {
            signal: callbacks.signal,
            prepare: async (signal) => ({ scope: scope ?? 'summaries', after: await callbacks.prepare(signal) }),
            changed: callbacks.changed,
            next: () => {},
          }).done,
      )
      const engine = new DialogueEngine(backend, new PersistentCommandStorage())
      engines.push(engine)
      engine.start()

      return engine
    },
    async dispose() {
      for (const engine of engines) engine.dispose()
      transport.dispose()
      await server.close()
    },
  }
}
