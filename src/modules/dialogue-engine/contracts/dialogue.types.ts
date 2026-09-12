export interface DialogueSummary {
  id: string
  title: string
  agentId: string
  agentVersion: string
  agentInstallationId: string
  agentConfiguration: unknown
  status: string
  progress: string
  pendingCount: number
  lastOutcome?: string | null
  activeTurnId?: string | null
  createdAt: string
  updatedAt: string
  version: string
  significantSequence: string
  readSignificantSequence: string
  unreadCount: number
  contextMode: string
  originDialogueId?: string | null
  originTurnId?: string | null
}

export interface DialogueItem {
  id: string
  dialogueId: string
  sequence: string
  turnId?: string | null
  kind: string
  source: string
  text: string
  payload?: unknown
  status: string
  version: string
  createdAt: string
  historical: boolean
}

export interface DialogueTurn {
  id: string
  dialogueId: string
  commandId: string
  userItemId: string
  status: string
  dispatchState: string
  cancelRequested: boolean
  completedAt?: string | null
  endItemSequence?: string | null
  outcome?: unknown
}

export interface DialogueChange {
  cursor: string
  dialogueId: string
  kind: string
  itemId?: string | null
  itemVersion?: string | null
  baseItemVersion?: string | null
  itemSequence?: string | null
  turnId?: string | null
  itemKind?: string | null
  itemSource?: string | null
  textDelta?: string | null
  item?: DialogueItem | null
  summary?: DialogueSummary | null
}

export interface DialogueInteraction {
  id: string
  dialogueId: string
  turnId?: string | null
  status: string
  request: unknown
  response?: unknown
  responseCommandId?: string | null
}

export interface PendingMessage {
  readonly commandId: string
  readonly prompt: string
}
