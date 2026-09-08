import { print } from 'graphql'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import type { Client, ExecutionResult } from 'graphql-sse'
import { subscriptionError, SubscriptionExecutionError, SubscriptionOverflowError } from './SubscriptionError'
import type { SubscriptionLease, SubscriptionOptions, SubscriptionState } from './subscription.types'

const MAX_RECOVERIES = 3

export class SubscriptionOperation<Data, Variables extends Record<string, unknown>> implements SubscriptionLease {
  public readonly done: Promise<void>
  private resolve = () => {}
  private reject: (error: unknown) => void = () => {}
  private disposed = false
  private epoch = 0
  private controller = new AbortController()
  private unsubscribe?: () => void
  private pending = Promise.resolve()
  private queue: ExecutionResult<Data, unknown>[] = []
  private draining = false
  private completed = false
  private recoveries = 0
  private client?: Client<true>

  public constructor(
    private readonly document: TypedDocumentNode<Data, Variables>,
    private readonly options: SubscriptionOptions<Data, Variables>,
    private readonly queueLimit: number,
    private readonly release: () => void,
  ) {
    this.done = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
    options.signal.addEventListener('abort', this.dispose, { once: true })
  }

  public change(state: SubscriptionState): void {
    if (this.disposed) return

    try {
      this.options.changed?.(state)
    } catch (error) {
      this.stop(error)
    }
  }

  public start(client: Client<true>): void {
    this.suspend()
    this.client = client
    const epoch = this.epoch
    const signal = this.controller.signal
    this.pending = this.pending
      .then(async () => {
        if (!this.active(epoch)) return
        const variables = await this.options.prepare(signal)

        if (!this.active(epoch)) return
        this.unsubscribe = client.subscribe<Data>(
          { query: print(this.document), variables },
          {
            next: (result) => this.receive(epoch, result),
            error: (error) => {
              if (this.active(epoch)) this.fail(error)
            },
            complete: () => {
              if (!this.active(epoch)) return
              this.completed = true
              this.drain(epoch)
            },
          },
        )
      })
      .catch((error: unknown) => {
        if (this.active(epoch)) this.fail(error)
      })
  }

  public suspend(): void {
    this.epoch += 1
    this.controller.abort()
    this.controller = new AbortController()
    this.unsubscribe?.()
    this.unsubscribe = undefined
    this.queue = []
    this.completed = false
    this.client = undefined
  }

  public dispose = (): void => {
    if (this.disposed) return
    this.finish()
  }

  public stop(error: unknown): void {
    if (this.disposed) return
    this.finish(error)
  }

  private active(epoch: number): boolean {
    return !this.disposed && !this.options.signal.aborted && epoch === this.epoch
  }

  private receive(epoch: number, result: ExecutionResult<Data, unknown>): void {
    if (!this.active(epoch)) return

    if (this.queue.length >= this.queueLimit) {
      this.fail(new SubscriptionOverflowError())
      return
    }

    this.queue.push(result)
    this.drain(epoch)
  }

  private drain(epoch: number): void {
    if (this.draining) return
    this.draining = true
    this.pending = this.pending
      .then(async () => {
        while (this.active(epoch) && this.queue.length) {
          const result = this.queue.shift()

          if (result?.errors?.length) throw new SubscriptionExecutionError(result.errors)
          if (result?.data) await this.options.next(result.data, this.controller.signal)
        }

        if (this.active(epoch) && this.completed) {
          this.options.complete?.()
          this.finish()
        }
      })
      .catch((error: unknown) => {
        if (this.active(epoch)) this.fail(error)
      })
      .finally(() => {
        this.draining = false

        if (this.queue.length || this.completed) this.drain(this.epoch)
      })
  }

  private async fail(error: unknown): Promise<void> {
    const client = this.client
    this.suspend()
    const epoch = this.epoch
    await this.pending
    error = await subscriptionError(error)

    if (!this.active(epoch)) return

    try {
      const recovered =
        this.recoveries < MAX_RECOVERIES && (await this.options.recover?.(error, this.controller.signal))

      if (!this.active(epoch)) return

      if (recovered && client) {
        this.recoveries += 1
        this.start(client)
      } else {
        this.stop(error)
      }
    } catch (recoveryError) {
      if (this.active(epoch)) this.stop(recoveryError)
    }
  }

  private finish(error?: unknown): void {
    this.disposed = true
    this.suspend()
    this.options.signal.removeEventListener('abort', this.dispose)
    this.release()

    if (error === undefined) {
      this.resolve()
    } else {
      this.reject(error)
      try {
        this.options.error?.(error)
      } catch {
        // Observer failures cannot interrupt the shared connection's other leases.
      }
    }
  }
}
