import { createClient, type Client } from 'graphql-sse'
import type { GraphqlSubscriptionsOptions } from './subscription.types'

const HEARTBEAT_TIMEOUT_MS = 45000
const CONNECT_TIMEOUT_MS = 45000
const UNAUTHORIZED = 401
const FORBIDDEN = 403
const ACCEPTED = 202
const CLEANUP_TIMEOUT_MS = 5000

/** Owns exactly one protocol connection; only GET stream bytes extend its heartbeat. */
export class SseConnection {
  public readonly client: Client<true>
  private readonly controller = new AbortController()
  private heartbeat?: ReturnType<typeof setTimeout>
  private connecting?: ReturnType<typeof setTimeout>
  private disposed = false

  public constructor(
    private readonly options: GraphqlSubscriptionsOptions,
    connected: () => void,
    private readonly failed: (error: unknown) => void,
  ) {
    this.connecting = setTimeout(
      () => this.fail(new Error('Subscription connection timed out.')),
      options.connectTimeoutMs ?? CONNECT_TIMEOUT_MS,
    )
    this.client = createClient({
      url: options.endpoint,
      singleConnection: true,
      lazy: false,
      retryAttempts: 0,
      credentials: options.credentials ?? 'include',
      headers: { ...options.headers },
      fetchFn: this.fetch,
      onNonLazyError: (error) => this.fail(error),
      on: {
        connected: () => {
          if (this.disposed) return
          clearTimeout(this.connecting)
          connected()
        },
      },
    })
  }

  public dispose(): void {
    if (this.disposed) return
    this.disposed = true
    clearTimeout(this.connecting)
    clearTimeout(this.heartbeat)
    this.controller.abort()
    this.client.dispose()
  }

  private fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const signal = AbortSignal.any([this.controller.signal, ...(init?.signal ? [init.signal] : [])])
    signal.throwIfAborted()
    let response: Response

    try {
      response = await (this.options.fetch ?? globalThis.fetch)(input, { ...init, signal })

      if (init?.method === 'POST' && response.status !== ACCEPTED) {
        // The library aborts a rejected POST before notifying its sink. Detach the error body
        // first so operation-level GraphQL codes remain readable after that abort.
        response = new Response(await response.arrayBuffer(), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        })
      }
    } catch (error) {
      await this.cleanupOperation(input, init)
      throw error
    }

    if (init?.method === 'POST' && (response.status !== ACCEPTED || signal.aborted)) {
      await this.cleanupOperation(input, init)
    }

    if (signal.aborted) {
      await response.body?.cancel()
      signal.throwIfAborted()
    }

    if (
      (init?.method === 'PUT' || init?.method === 'GET') &&
      (response.status === UNAUTHORIZED || response.status === FORBIDDEN)
    ) {
      this.fail(new Error('Subscription access denied.', { cause: response.status }))
    }

    if (this.disposed || init?.method !== 'GET' || !response.ok || !response.body) return response
    this.touch()
    const body = response.body.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform: (chunk, controller) => {
          this.touch()
          controller.enqueue(chunk)
        },
      }),
    )

    return new Response(body, { status: response.status, headers: response.headers })
  }

  private touch(): void {
    if (this.disposed) return
    clearTimeout(this.heartbeat)
    this.heartbeat = setTimeout(
      () => this.fail(new Error('The subscription stream stopped responding.')),
      this.options.heartbeatTimeoutMs ?? HEARTBEAT_TIMEOUT_MS,
    )
  }

  private async cleanupOperation(input: RequestInfo | URL, init?: RequestInit): Promise<void> {
    if (init?.method !== 'POST' || typeof init.body !== 'string' || this.disposed) return
    const request: { extensions?: { operationId?: string } } = JSON.parse(init.body)
    const operationId = request.extensions?.operationId

    if (!operationId) return
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), CLEANUP_TIMEOUT_MS)

    try {
      // graphql-sse reserves before validation but only auto-cancels after receiving 202.
      // Cover rejected POSTs and cancellation while that acknowledgement is in flight.
      await (this.options.fetch ?? globalThis.fetch)(
        `${String(input)}?operationId=${encodeURIComponent(operationId)}`,
        {
          method: 'DELETE',
          headers: init.headers,
          credentials: init.credentials,
          signal: AbortSignal.any([this.controller.signal, controller.signal]),
        },
      )
    } catch {
      // Preserve the original operation failure; closing the shared stream releases remaining work.
    } finally {
      clearTimeout(timeout)
    }
  }

  private fail(error: unknown): void {
    if (!this.disposed) this.failed(error)
  }
}
