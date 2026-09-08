import { makeAutoObservable, observable } from 'mobx'
import { ObservableRequest } from 'src/modules/observable-request'
import type { DialogueBackend } from '../contracts/backend.types'
import type { DialogueStore } from '../state/DialogueStore'
import { ChangeFeed } from '../synchronization/ChangeFeed'
import type { DialogueSynchronization } from '../synchronization/DialogueSynchronization'

interface FeedOwner {
  readonly feed: ChangeFeed
  consumers: number
}

export class DialogueLifecycle {
  private readonly feeds = observable.map<string, FeedOwner>()
  private readonly requests = new Map<string, { controller: AbortController; result: Promise<unknown> }>()
  private lifetime = new AbortController()
  public summaryFeed?: ChangeFeed
  public readonly listRequest

  public constructor(
    private readonly backend: DialogueBackend,
    private readonly store: DialogueStore,
    private readonly sync: DialogueSynchronization,
  ) {
    this.listRequest = ObservableRequest.of(() => this.task('list', (signal) => sync.list(store.listAfter, signal)))
    makeAutoObservable<this, 'feeds'>(this, { feeds: false }, { autoBind: true })
  }

  public start(): void {
    if (this.summaryFeed && !this.summaryFeed.signal.aborted) return

    const feed = new ChangeFeed(this.backend.watch.bind(this.backend))
    this.summaryFeed = feed
    feed.start(
      undefined,
      () => this.sync.list(undefined, feed.signal),
      (change) => this.sync.applySummary(change, feed.signal),
    )
  }

  public open(id: string) {
    const owner = this.acquire(id)
    const ready = owner.feed.ready()
    // Screens may release without awaiting readiness; cancellation is still observable to awaiters.
    ready.catch(() => {})
    let released = false

    return {
      ready,
      release: () => {
        if (released) return

        released = true
        this.release(id, owner)
      },
    }
  }

  private acquire(id: string): FeedOwner {
    const existing = this.feeds.get(id)

    if (existing && !existing.feed.signal.aborted) {
      existing.consumers += 1

      return existing
    }

    const feed = new ChangeFeed(this.backend.watch.bind(this.backend))
    this.feeds.set(id, { feed, consumers: 1 })
    const owner = this.feeds.get(id)!
    feed.start(
      id,
      () => this.sync.snapshot(id, feed.signal),
      (change) => this.sync.apply(change, feed.signal),
    )

    return owner
  }

  private release(id: string, owner: FeedOwner): void {
    if (this.feeds.get(id) !== owner) return

    owner.consumers -= 1

    if (owner.consumers) return

    owner.feed.stop()
    this.feeds.delete(id)
  }

  public connection(id: string) {
    return this.feeds.get(id)?.feed.state ?? { status: 'Stopped', error: '' }
  }

  public loading(id: string): boolean {
    return (
      !this.store.dialogues.get(id)?.historyLoaded &&
      (this.requests.has(id) || this.feeds.get(id)?.feed.status === 'Connecting')
    )
  }

  public refresh(id: string): Promise<void> {
    return this.task(id, async (signal) => {
      await this.sync.snapshot(id, signal)
    })
  }

  public loadMore(id: string): Promise<void> {
    return this.task(id, (signal) => this.sync.loadMore(id, signal))
  }

  public loadRelated(id: string): Promise<void> {
    return this.sync.loadRelated(id, this.lifetime.signal)
  }

  private task<T>(key: string, work: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const previous = this.requests.get(key)
    const controller = new AbortController()
    const signal = AbortSignal.any([controller.signal, this.lifetime.signal])
    const result = Promise.resolve(previous?.result)
      .catch(() => {})
      .then(() => {
        signal.throwIfAborted()

        return work(signal)
      })
      .finally(() => this.finishTask(key, controller))
    this.requests.set(key, { controller, result })

    return result
  }

  private finishTask(key: string, controller: AbortController): void {
    if (this.requests.get(key)?.controller === controller) this.requests.delete(key)
  }

  public dispose(): void {
    this.lifetime.abort()
    this.lifetime = new AbortController()
    this.summaryFeed?.stop()
    this.feeds.forEach(({ feed }) => feed.stop())
    this.feeds.clear()
    this.requests.forEach(({ controller }) => controller.abort())
    this.requests.clear()
    this.listRequest.abort()
  }
}
