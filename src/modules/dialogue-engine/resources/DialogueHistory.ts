import { ObservableRequest } from 'src/modules/observable-request'
import type { DialogueStore } from '../state/DialogueStore'
import type { DialogueLifecycle } from '../lifecycle/DialogueLifecycle'
import type { DialogueEntry } from './DialogueEntry'

export class DialogueHistory {
  private readonly request

  public constructor(
    private readonly store: DialogueStore,
    lifecycle: DialogueLifecycle,
    private readonly dialogueId: string,
    private readonly readItems: () => readonly DialogueEntry[],
  ) {
    this.request = ObservableRequest.of(() => lifecycle.loadMore(dialogueId))
    Object.freeze(this)
  }

  public get items() {
    return this.readItems()
  }

  public get hasMore() {
    return this.store.dialogues.get(this.dialogueId)?.hasMoreHistory ?? false
  }

  public get loading() {
    return this.request.isLoading
  }

  public get error() {
    return this.request.errorMessage ?? ''
  }

  public readonly loadMore = async (): Promise<void> => {
    const result = await this.request.fetch()

    if (!result.isRight) throw result.error
  }
}
