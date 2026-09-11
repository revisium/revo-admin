import { DialogueHistory } from './DialogueHistory'
import { makeAutoObservable } from 'mobx'
import { ObservableRequest } from 'src/modules/observable-request'
import type { DisplayReceipt, DialogueView } from '../contracts/public.types'
import type { DialogueStore } from '../state/DialogueStore'
import type { DialogueLifecycle } from '../lifecycle/DialogueLifecycle'
import type { DialogueCommands } from '../commands/DialogueCommands'
import type { DialogueReadReceipts } from '../commands/DialogueReadReceipts'
import type { DialogueAutoReadCoordinator } from '../lifecycle/DialogueAutoReadCoordinator'
import { DialogueEntry } from './DialogueEntry'
import { DialogueInteractionSession } from './DialogueInteractionSession'
import { readonlyValue } from './readonly-value'

export class DialogueResource implements DialogueView {
  private readonly entries = new Map<string, DialogueEntry>()
  private readonly interactionModels = new Map<string, DialogueInteractionSession>()
  private readonly refreshRequest
  private readonly historyView

  constructor(
    public readonly id: string,
    private readonly store: DialogueStore,
    private readonly lifecycle: DialogueLifecycle,
    private readonly commands: DialogueCommands,
    private readonly receipts: DialogueReadReceipts,
    private readonly autoRead: DialogueAutoReadCoordinator,
  ) {
    this.historyView = new DialogueHistory(store, lifecycle, id, () => this.historyItems)
    this.refreshRequest = ObservableRequest.of(() => lifecycle.refresh(id))
    makeAutoObservable<
      this,
      'store' | 'lifecycle' | 'commands' | 'receipts' | 'autoRead' | 'entries' | 'interactionModels' | 'historyView'
    >(
      this,
      {
        store: false,
        lifecycle: false,
        commands: false,
        receipts: false,
        autoRead: false,
        entries: false,
        interactionModels: false,
        historyView: false,
      },
      { autoBind: true },
    )
  }

  private get model() {
    return this.store.dialogues.get(this.id)
  }

  public get title() {
    return this.model?.summary.title ?? ''
  }

  public get agentId() {
    return this.model?.summary.agentId ?? ''
  }

  public get status() {
    return this.model?.summary.status ?? 'LOADING'
  }

  public get contextMode() {
    return this.model?.summary.contextMode ?? 'NEW'
  }

  public get lastOutcome() {
    return this.model?.summary.lastOutcome ?? ''
  }

  public get progress() {
    return this.model?.summary.progress ?? ''
  }

  public get pendingCount() {
    return this.model?.summary.pendingCount ?? 0
  }

  public get unread() {
    return this.model?.unread ?? false
  }

  public get busy() {
    return this.model?.busy ?? false
  }

  public get loading() {
    return this.refreshRequest.isLoading || this.lifecycle.loading(this.id)
  }

  public get ready() {
    return this.model?.historyLoaded ?? false
  }

  public get error() {
    return this.refreshRequest.errorMessage ?? (!this.ready ? this.connection.error : '')
  }

  public get connection() {
    return Object.freeze(this.lifecycle.connection(this.id))
  }

  public get sending() {
    return this.commands.isSending(this.id)
  }

  public get canRetry() {
    return Boolean(this.model?.pendingMessage) && !this.sending
  }

  public get pendingText() {
    return this.model?.pendingMessage?.prompt ?? ''
  }

  public get canSend() {
    return Boolean(this.model?.canSend) && !this.sending && !this.model?.pendingMessage
  }

  public get canCancel() {
    return Boolean(this.model?.summary.activeTurnId && this.busy && !this.model.cancelRequested)
  }

  public get canReopen() {
    return this.model?.canReopen ?? false
  }

  public get completedTurns() {
    return readonlyValue(this.model?.completedTurns.map((turn) => ({ id: turn.id })) ?? [])
  }

  public get history() {
    return this.historyView
  }

  private get historyItems(): readonly DialogueEntry[] {
    return Object.freeze(
      (this.model?.orderedItems ?? []).map((item) => {
        let entry = this.entries.get(item.id)

        if (!entry) {
          entry = new DialogueEntry(item)
          this.entries.set(item.id, entry)
        }

        return entry
      }),
    )
  }

  public get interactions(): readonly DialogueInteractionSession[] {
    return Object.freeze((this.model?.interactions ?? []).map((item) => this.interaction(item.id)))
  }

  public get pendingInteractions() {
    return Object.freeze(this.interactions.filter((item) => item.active || item.canRetry))
  }

  public interaction(id: string): DialogueInteractionSession {
    let interaction = this.interactionModels.get(id)

    if (!interaction) {
      interaction = new DialogueInteractionSession(this.id, id, this.store, this.commands)
      this.interactionModels.set(id, interaction)
    }

    return interaction
  }

  public send(text: string): Promise<void> {
    if (this.canRetry) {
      return Promise.reject(new Error('Use retrySend() to retry the pending message.'))
    }

    return this.commands.send(this.id, text)
  }

  public retrySend(): Promise<void> {
    if (!this.canRetry) return Promise.reject(new Error('No message is available to retry.'))

    return this.commands.send(this.id, '')
  }

  public cancel(): Promise<void> {
    return this.commands.cancel(this.id)
  }

  public reopen(): Promise<void> {
    return this.commands.reopen(this.id)
  }

  public async fork(turnId: string): Promise<string> {
    return (await this.commands.fork(this.id, turnId)).id
  }

  public async refresh(): Promise<void> {
    const result = await this.refreshRequest.fetch()

    if (!result.isRight) throw result.error
  }

  public markRead(): Promise<void> {
    return this.receipts.markRead(this.id)
  }

  public setAutoRead(enabled: boolean): void {
    this.autoRead.set(this.id, enabled)
  }

  public displayReceipt(): DisplayReceipt | undefined {
    return this.receipts.displayReceipt(this.id)
  }

  public canAcknowledge(receipt: DisplayReceipt): boolean {
    return this.receipts.canAcknowledge(receipt)
  }

  public acknowledge(receipt: DisplayReceipt): Promise<void> {
    return this.receipts.acknowledge(receipt)
  }
}
