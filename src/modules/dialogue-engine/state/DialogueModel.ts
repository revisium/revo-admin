import { makeAutoObservable, observable } from 'mobx'
import type {
  DialogueInteraction,
  DialogueItem,
  DialogueSummary,
  DialogueTurn,
  PendingMessage,
} from '../contracts/dialogue.types'
import { DialogueItemModel } from './DialogueItemModel'
import { compareSequence } from '../state/sequence'

const ACTIVE_STATUSES = new Set(['QUEUED', 'RUNNING', 'WAITING'])

export class DialogueModel {
  public readonly items = observable.map<string, DialogueItemModel>()
  public turns: DialogueTurn[] = []
  public interactions: DialogueInteraction[] = []
  public historyAfter?: string
  public hasMoreHistory = false
  public historyLoaded = false
  public observedSequence = '0'
  public pendingMessage?: PendingMessage

  public constructor(public summary: DialogueSummary) {
    makeAutoObservable(this, { summary: observable.ref, items: false }, { autoBind: true })
  }

  public get id() {
    return this.summary.id
  }

  public get busy() {
    return ACTIVE_STATUSES.has(this.summary.status)
  }

  public get canSend() {
    return this.summary.status === 'READY'
  }

  public get canReopen() {
    return this.summary.status === 'UNCERTAIN' || this.summary.status === 'CLOSED'
  }

  public get unread() {
    return this.summary.unreadCount > 0
  }

  public get orderedItems() {
    return [...this.items.values()].sort((a, b) => compareSequence(a.sequence, b.sequence))
  }

  public get pendingInteractions() {
    return this.interactions.filter(
      (interaction) => interaction.status === 'PENDING' || interaction.status === 'RESPONDING',
    )
  }

  public get completedTurns() {
    return this.turns.filter((turn) => turn.status === 'COMPLETED' && turn.endItemSequence)
  }

  public get cancelRequested() {
    return this.turns.some((turn) => turn.id === this.summary.activeTurnId && turn.cancelRequested)
  }

  public applySummary(summary: DialogueSummary): void {
    if (compareSequence(summary.version, this.summary.version) > 0) {
      this.summary = summary
    }
  }

  public applyItem(item: DialogueItem): void {
    const current = this.items.get(item.id)

    if (current) {
      current.upsert(item)
    } else {
      this.items.set(item.id, new DialogueItemModel(item))
    }
  }
}
