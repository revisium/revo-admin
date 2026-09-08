import { makeAutoObservable } from 'mobx'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { SubscriptionOperation } from './SubscriptionOperation'
import { SseConnection } from './SseConnection'
import type {
  GraphqlSubscriptionsOptions,
  SubscriptionOptions,
  SubscriptionState,
  SubscriptionTransport,
  SubscriptionLease,
} from './subscription.types'

const RETRY_ATTEMPTS = 5
const RETRY_DELAY_MS = 1000
const MAX_RETRY_DELAY_MS = 30000
const STABLE_CONNECTION_MS = 30000
const IDLE_GRACE_MS = 200
const QUEUE_LIMIT = 128
const BACKOFF_FACTOR = 2
const UNAUTHORIZED = 401
const FORBIDDEN = 403
const JITTER_RANGE = 65536

interface ActiveOperation {
  start(client: SseConnection['client']): void
  suspend(): void
  stop(error: unknown): void
  dispose(): void
  change(state: SubscriptionState): void
}

export class GraphqlSubscriptions implements SubscriptionTransport {
  public status: SubscriptionState['status'] = 'Stopped'
  public error = ''
  private readonly operations = new Set<ActiveOperation>()
  private connection?: SseConnection
  private epoch = 0
  private retries = 0
  private retryTimer?: ReturnType<typeof setTimeout>
  private idleTimer?: ReturnType<typeof setTimeout>
  private stableTimer?: ReturnType<typeof setTimeout>
  private listening = false
  private stopped = false

  public constructor(private readonly options: GraphqlSubscriptionsOptions) {
    makeAutoObservable<this, 'operations' | 'connection'>(
      this,
      { operations: false, connection: false },
      { autoBind: true },
    )
  }

  public subscribe<Data, Variables extends Record<string, unknown>>(
    document: TypedDocumentNode<Data, Variables>,
    options: SubscriptionOptions<Data, Variables>,
  ): SubscriptionLease {
    const operation = new SubscriptionOperation(document, options, this.options.queueLimit ?? QUEUE_LIMIT, () =>
      this.release(operation),
    )

    if (options.signal.aborted || this.stopped || !(this.options.enabled?.() ?? typeof window !== 'undefined')) {
      operation.dispose()
      return operation
    }

    clearTimeout(this.idleTimer)
    this.operations.add(operation)
    this.listen()

    if (this.connection) {
      operation.change({ status: this.status, error: this.error })
      operation.start(this.connection.client)
    } else if (!this.retryTimer) {
      this.connect()
    } else {
      operation.change({ status: this.status, error: this.error })
    }

    return operation
  }

  public dispose(): void {
    this.stopped = true

    for (const operation of this.operations) operation.dispose()
    this.close()
  }

  private connect(): void {
    if (!this.operations.size || this.stopped) return

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.change('Offline', 'Browser is offline.')
      return
    }

    const epoch = ++this.epoch
    this.change(this.retries ? 'Reconnecting' : 'Connecting')

    if (!this.operations.size) return
    const connection = new SseConnection(
      this.options,
      () => this.connected(epoch),
      (error) => this.failed(epoch, error),
    )
    this.connection = connection

    for (const operation of this.operations) operation.start(connection.client)
  }

  private connected(epoch: number): void {
    if (epoch !== this.epoch || !this.connection) return
    this.change('Live')
    this.stableTimer = setTimeout(() => {
      this.retries = 0
    }, STABLE_CONNECTION_MS)
  }

  private failed(epoch: number, error: unknown): void {
    if (epoch !== this.epoch) return
    this.disconnect()
    const message = error instanceof Error ? error.message : 'Subscription connection failed.'

    if (error instanceof Error && (error.cause === UNAUTHORIZED || error.cause === FORBIDDEN)) {
      this.terminate(error)
      return
    }

    if (this.retries >= (this.options.retryAttempts ?? RETRY_ATTEMPTS)) {
      this.terminate(new Error(`Subscription reconnect attempts exhausted. ${message}`))
      return
    }

    this.change('Reconnecting', message)
    const delay = Math.min(
      MAX_RETRY_DELAY_MS,
      (this.options.retryDelayMs ?? RETRY_DELAY_MS) * BACKOFF_FACTOR ** this.retries,
    )
    this.retries += 1
    this.retryTimer = setTimeout(
      () => {
        this.retryTimer = undefined
        this.connect()
      },
      delay + (crypto.getRandomValues(new Uint16Array(1))[0] / JITTER_RANGE) * delay,
    )
  }

  private terminate(error: Error): void {
    this.change('Stopped', error.message)

    for (const operation of this.operations) operation.stop(error)
    this.close()
  }

  private disconnect(): void {
    this.epoch += 1
    clearTimeout(this.stableTimer)

    for (const operation of this.operations) operation.suspend()
    this.connection?.dispose()
    this.connection = undefined
  }

  private release(operation: ActiveOperation): void {
    if (!this.operations.delete(operation)) return

    if (this.operations.size) return
    clearTimeout(this.retryTimer)
    this.retryTimer = undefined
    this.unlisten()
    clearTimeout(this.idleTimer)
    this.idleTimer = setTimeout(this.close, this.options.idleGraceMs ?? IDLE_GRACE_MS)
  }

  private close(): void {
    this.disconnect()
    clearTimeout(this.retryTimer)
    clearTimeout(this.idleTimer)
    this.retryTimer = undefined
    this.retries = 0
    this.unlisten()
    this.change('Stopped', this.error)
  }

  private change(status: SubscriptionState['status'], error = ''): void {
    this.status = status
    this.error = error

    for (const operation of this.operations) operation.change({ status, error })
  }

  private listen(): void {
    if (this.listening || typeof window === 'undefined') return
    this.listening = true
    window.addEventListener('offline', this.offline)
    window.addEventListener('online', this.online)
  }

  private unlisten(): void {
    if (!this.listening || typeof window === 'undefined') return
    this.listening = false
    window.removeEventListener('offline', this.offline)
    window.removeEventListener('online', this.online)
  }

  private offline(): void {
    this.disconnect()
    clearTimeout(this.retryTimer)
    this.retryTimer = undefined
    this.change('Offline', 'Browser is offline.')
  }

  private online(): void {
    if (!this.connection && !this.retryTimer) this.connect()
  }
}
