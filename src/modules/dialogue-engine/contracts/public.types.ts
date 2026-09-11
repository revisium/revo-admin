import type { DialogueQuestion, DialogueOption } from './interaction.types'

export interface DisplayReceipt {
  readonly dialogueId: string
}

export interface DialogueConnection {
  readonly status: string
  readonly error: string
}

export interface DialogueEntry {
  readonly id: string
  readonly dialogueId: string
  readonly turnId: string
  readonly text: string
  readonly source: string
  readonly kind: string
  readonly status: string
  readonly historical: boolean
  readonly payload: unknown
}

export interface DialogueInteractionSession {
  readonly id: string
  readonly kind: string
  readonly title: string
  readonly questions: readonly DialogueQuestion[]
  readonly options: readonly DialogueOption[]
  readonly supported: boolean
  readonly active: boolean
  readonly busy: boolean
  readonly canRespond: boolean
  readonly canRetry: boolean
  choose(optionId: string): Promise<void>
  submit(values: Record<string, unknown>): Promise<void>
  decline(): Promise<void>
  retry(): Promise<void>
}

export interface DialogueHistoryView {
  readonly items: readonly DialogueEntry[]
  readonly hasMore: boolean
  readonly loading: boolean
  readonly error: string
  loadMore(): Promise<void>
}

export interface DialogueView {
  readonly id: string
  readonly title: string
  readonly agentId: string
  readonly status: string
  readonly contextMode: string
  readonly lastOutcome: string
  readonly progress: string
  readonly pendingCount: number
  readonly unread: boolean
  readonly busy: boolean
  readonly loading: boolean
  readonly ready: boolean
  readonly error: string
  readonly connection: DialogueConnection
  readonly sending: boolean
  readonly canRetry: boolean
  readonly pendingText: string
  readonly canSend: boolean
  readonly canCancel: boolean
  readonly canReopen: boolean
  readonly completedTurns: readonly { readonly id: string }[]
  readonly history: DialogueHistoryView
  readonly interactions: readonly DialogueInteractionSession[]
  readonly pendingInteractions: readonly DialogueInteractionSession[]
  interaction(id: string): DialogueInteractionSession
  send(text: string): Promise<void>
  retrySend(): Promise<void>
  cancel(): Promise<void>
  reopen(): Promise<void>
  fork(turnId: string): Promise<string>
  refresh(): Promise<void>
  markRead(): Promise<void>
  setAutoRead(enabled: boolean): void
  displayReceipt(): DisplayReceipt | undefined
  canAcknowledge(receipt: DisplayReceipt): boolean
  acknowledge(receipt: DisplayReceipt): Promise<void>
}

export interface DialogueLease {
  readonly dialogue: DialogueView
  readonly ready: Promise<void>
  release(): void
}

export interface DialogueListView {
  readonly items: readonly DialogueView[]
  readonly hasMore: boolean
  readonly loading: boolean
  readonly error: string
  readonly connection: DialogueConnection
  loadMore(): Promise<void>
}
