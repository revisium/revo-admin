import { makeAutoObservable } from 'mobx'
import type { DialogueBackend } from '../contracts/backend.types'
import type { DialogueCommands } from './DialogueCommands'
import type { DialogueStore } from '../state/DialogueStore'

export class DialogueDraft {
  private id?: string

  public get dialogueId() {
    return this.id
  }

  private pending?: Promise<string>
  private creationUncertain = false
  private creating = false
  private sending = false

  public get state() {
    if (this.creating) return 'creating'

    if (this.sending) return 'sending'

    if (this.creationUncertain) return 'creationUncertain'

    if (this.dialogueId && this.store.dialogues.get(this.dialogueId)?.pendingMessage) return 'retryable'

    return 'ready'
  }

  public get canRetry() {
    return this.state === 'retryable'
  }

  public retry(): Promise<string> {
    const id = this.dialogueId

    if (this.pending) return this.pending

    if (!id || !this.canRetry) return Promise.reject(new Error('No message is available to retry.'))

    this.markSending()
    this.pending = this.engine
      .send(id, '')
      .then(() => id)
      .finally(this.clearPending)

    return this.pending
  }

  public constructor(
    private readonly backend: DialogueBackend,
    private readonly store: DialogueStore,
    private readonly engine: DialogueCommands,
  ) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public send(input: Parameters<DialogueBackend['create']>[0], prompt: string): Promise<string> {
    if (this.pending) {
      return this.pending
    }

    if (this.canRetry) {
      return Promise.reject(new Error('Use retry() to retry the first message.'))
    }

    this.pending = this.deliver(input, prompt).finally(this.clearPending)

    return this.pending
  }

  private async deliver(input: Parameters<DialogueBackend['create']>[0], prompt: string): Promise<string> {
    const id = await this.ensureDialogue(input)
    this.markSending()
    await this.engine.send(id, prompt)

    return id
  }

  private async ensureDialogue(input: Parameters<DialogueBackend['create']>[0]): Promise<string> {
    if (this.dialogueId) {
      return this.dialogueId
    }

    this.beginCreation()
    const result = await this.backend.create(input)
    this.acceptDialogue(result)

    if (!this.dialogueId) {
      throw new Error('Dialogue creation did not return an identifier.')
    }

    return this.dialogueId
  }

  private beginCreation(): void {
    if (this.creationUncertain) {
      throw new Error('Creation could not be confirmed. Check Chats before creating another dialogue.')
    }

    this.creationUncertain = true
    this.creating = true
  }

  private acceptDialogue(dialogue: Awaited<ReturnType<DialogueBackend['create']>>): void {
    this.id = dialogue.id
    this.creationUncertain = false
    this.creating = false
    this.store.include(dialogue)
  }

  private markSending(): void {
    this.sending = true
  }

  private clearPending(): void {
    this.creating = false
    this.sending = false
    this.pending = undefined
  }
}
