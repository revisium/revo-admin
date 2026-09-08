import type { DialogueSummary, DialogueItem, DialogueTurn, DialogueInteraction, DialogueChange } from './dialogue.types'
import type { CreateDialogueInput, SendDialogueInput, RespondDialogueInput } from './command.types'
import type { Page, SnapshotPage } from './page.types'
import type { AgentDefinition, AgentConfiguration } from './agent.types'

export type HistoryPage = SnapshotPage<DialogueItem> & { readonly observed: string }
export type WatchChanges = (
  scope: string | undefined,
  options: {
    readonly signal: AbortSignal
    readonly prepare: (signal: AbortSignal) => Promise<string>
    readonly receive: (change: DialogueChange, signal: AbortSignal) => Promise<void>
    readonly changed: (state: { status: string; error: string }) => void
    readonly recover: (error: unknown, signal: AbortSignal) => boolean
  },
) => Promise<void>

export interface DialogueBackend {
  watch: WatchChanges
  list(after?: string, signal?: AbortSignal): Promise<SnapshotPage<DialogueSummary>>
  details(id: string, signal?: AbortSignal): Promise<DialogueSummary>
  history(id: string, after?: string, signal?: AbortSignal): Promise<HistoryPage>
  item(id: string, itemId: string, signal?: AbortSignal): Promise<DialogueItem>
  turns(id: string, after?: string, signal?: AbortSignal): Promise<Page<DialogueTurn>>
  interactions(id: string, after?: string, signal?: AbortSignal): Promise<Page<DialogueInteraction>>
  agents(after?: string, signal?: AbortSignal): Promise<Page<AgentDefinition>>
  configuration(id: string, version: string, signal?: AbortSignal): Promise<AgentConfiguration>
  create(input: CreateDialogueInput): Promise<DialogueSummary>
  send(input: SendDialogueInput): Promise<DialogueTurn>
  respond(input: RespondDialogueInput): Promise<DialogueInteraction>
  cancel(id: string, turnId: string): Promise<DialogueTurn>
  read(id: string, through: string): Promise<DialogueSummary>
  reopen(id: string): Promise<DialogueSummary>
  fork(id: string, turnId: string, title: string): Promise<DialogueSummary>
}
