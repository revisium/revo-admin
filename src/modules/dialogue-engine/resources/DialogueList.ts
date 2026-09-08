import type { DialogueStore } from '../state/DialogueStore'
import type { DialogueLifecycle } from '../lifecycle/DialogueLifecycle'
import type { DialogueView } from '../contracts/public.types'

export class DialogueList {
  public constructor(
    private readonly store: DialogueStore,
    private readonly lifecycle: DialogueLifecycle,
    private readonly resolve: (id: string) => DialogueView,
  ) {
    Object.freeze(this)
  }

  public get items(): readonly DialogueView[] {
    return Object.freeze(this.store.listed.map((item) => this.resolve(item.id)))
  }

  public get hasMore() {
    return this.store.hasMore
  }

  public get loading() {
    return this.lifecycle.listRequest.isLoading || this.lifecycle.summaryFeed?.status === 'Connecting'
  }

  public get error() {
    return this.lifecycle.listRequest.errorMessage ?? ''
  }

  public get connection() {
    return Object.freeze(this.lifecycle.summaryFeed?.state ?? { status: 'Stopped', error: '' })
  }

  public readonly loadMore = async (): Promise<void> => {
    const result = await this.lifecycle.listRequest.fetch()

    if (!result.isRight) throw result.error
  }
}
