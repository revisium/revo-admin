import { createServer, type ServerResponse } from 'node:http'
import { once } from 'node:events'
import { buildSchema, GraphQLError } from 'graphql/index.js'
import { createHandler } from 'graphql-sse/lib/use/http'

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

export async function multiplexServer() {
  const subscriptions: { scope: string; after: string | undefined; source: EventSource }[] = []
  const active = new Set<EventSource>()
  const streams = new Set<ServerResponse>()
  const requests: string[] = []
  const wire: unknown[] = []
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
    wire.push({ method, url: request.url, token: request.headers['x-graphql-event-stream-token'] })
    response.on('close', () => wire.push({ close: method, status: response.statusCode }))
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
    wire,
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
