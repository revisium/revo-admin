import type { DialogueBackend } from '../contracts/backend.types'
import type { DisplayReceipt } from '../contracts/public.types'
import type { DialogueStore } from '../state/DialogueStore'
import { compareSequence } from '../state/sequence'

export class DialogueReadReceipts {
  private readonly receipts = new WeakMap<DisplayReceipt, string>()

  public constructor(
    private readonly backend: DialogueBackend,
    private readonly store: DialogueStore,
  ) {}

  public async markRead(id: string): Promise<void> {
    const model = this.store.dialogues.get(id)

    if (!model?.historyLoaded) {
      throw new Error('Load the dialogue before marking it read.')
    }

    await this.readThrough(id, model.observedSequence)
  }

  public displayReceipt(id: string): DisplayReceipt | undefined {
    const model = this.store.dialogues.get(id)

    if (!model?.historyLoaded || model.hasMoreHistory) {
      return undefined
    }

    const receipt = Object.freeze({ dialogueId: id })
    this.receipts.set(receipt, model.observedSequence)

    return receipt
  }

  public canAcknowledge(receipt: DisplayReceipt): boolean {
    const through = this.receipts.get(receipt)
    const model = this.store.dialogues.get(receipt.dialogueId)

    return Boolean(through && model && compareSequence(through, model.summary.readSignificantSequence) > 0)
  }

  public async acknowledge(receipt: DisplayReceipt): Promise<void> {
    const through = this.receipts.get(receipt)

    if (through === undefined) {
      throw new Error('Unknown display receipt.')
    }

    await this.readThrough(receipt.dialogueId, through)
  }

  private async readThrough(id: string, through: string): Promise<void> {
    const result = await this.backend.read(id, through)
    this.store.upsert(result)
  }
}
