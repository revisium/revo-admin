import { runInAction } from 'mobx'
import type { DialogueBackend } from '../contracts/backend.types'
import { DialogueStore } from '../state/DialogueStore'
import type { DialogueModel } from '../state/DialogueModel'
import type { DialogueChange } from '../contracts/dialogue.types'
import { compareSequence } from '../state/sequence'

export class DialogueProjection {
  public constructor(
    private readonly api: DialogueBackend,
    private readonly store: DialogueStore,
  ) {}

  public async apply(change: DialogueChange, signal?: AbortSignal): Promise<void> {
    signal?.throwIfAborted()

    if (change.summary) {
      this.store.include(change.summary)
    }

    const model = this.store.dialogues.get(change.dialogueId)

    if (!model) {
      return
    }

    if (change.item) {
      model.applyItem(change.item)

      return
    }

    await this.applyTextDelta(model, change, signal)
  }

  private async applyTextDelta(model: DialogueModel, change: DialogueChange, signal?: AbortSignal): Promise<void> {
    if (change.kind !== 'HISTORY_TEXT_APPENDED' || !change.itemId || !change.itemVersion) {
      return
    }

    const item = model.items.get(change.itemId)

    if (item && compareSequence(item.data.version, change.itemVersion) >= 0) {
      return
    }

    if (item && item.data.version === change.baseItemVersion && change.textDelta !== null) {
      item.append(change.textDelta ?? '', change.itemVersion)

      return
    }

    await this.repairItem(model, change.itemId, signal)
  }

  private async repairItem(model: DialogueModel, itemId: string, signal?: AbortSignal): Promise<void> {
    const result = await this.api.item(model.id, itemId, signal)
    signal?.throwIfAborted()
    runInAction(() => model.applyItem(result))
  }
}
