import { pageOf, snapshotOf } from './page-mapping'
import { transportError } from './graphql-error'
import type { AgentOption } from '../../contracts/agent.types'
import {
  getSdk,
  type CreateDialogueInput,
  type RespondDialogueInput,
  type SendDialogueInput,
  DialogueEventsDocument,
  DialogueSummariesDocument,
  type DialogueEventsSubscription,
  type DialogueSummariesSubscription,
} from './__generated__/graphql-request'
import type { DialogueBackend, WatchChanges } from '../../contracts/backend.types'
import { GraphQLClient } from 'graphql-request'
import type { GraphqlDialogueOptions } from './transport.types'
import { GraphqlSseService } from './GraphqlSseService'

export const DIALOGUE_PAGE_SIZE = 50

export class GraphqlDialogueBackend implements DialogueBackend {
  private readonly sse: GraphqlSseService

  public constructor(private readonly options: GraphqlDialogueOptions) {
    this.sse = new GraphqlSseService(options)
  }

  private client(signal?: AbortSignal) {
    return getSdk(
      new GraphQLClient(this.options.endpoint, {
        credentials: this.options.credentials ?? 'include',
        headers: this.options.headers,
        fetch: (input, init) =>
          (this.options.fetch ?? globalThis.fetch)(input, { ...init, signal: signal ?? init?.signal }),
      }),
    )
  }

  private async request<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      throw transportError(error)
    }
  }

  public watch: WatchChanges = async (scope, after, signal, receive, connected) => {
    if (scope)
      await this.sse.consume<DialogueEventsSubscription>(
        DialogueEventsDocument,
        { ids: [scope], after },
        signal,
        (data) => receive(data.dialogueChanges),
        connected,
      )
    else
      await this.sse.consume<DialogueSummariesSubscription>(
        DialogueSummariesDocument,
        { after },
        signal,
        (data) => receive(data.dialogueSummaryChanges),
        connected,
      )
  }

  public list(after?: string, signal?: AbortSignal) {
    return this.request(async () =>
      snapshotOf((await this.client(signal).DialogueList({ first: DIALOGUE_PAGE_SIZE, after })).dialogues),
    )
  }

  public details(id: string, signal?: AbortSignal) {
    return this.request(async () => (await this.client(signal).DialogueDetails({ id })).dialogue)
  }

  public history(id: string, after?: string, signal?: AbortSignal) {
    return this.request(async () => {
      const { dialogueHistory } = await this.client(signal).DialogueHistory({ id, first: DIALOGUE_PAGE_SIZE, after })

      return { ...snapshotOf(dialogueHistory), observed: dialogueHistory.observedSignificantSequence ?? '0' }
    })
  }

  public item(id: string, itemId: string, signal?: AbortSignal) {
    return this.request(async () => (await this.client(signal).DialogueItem({ id, itemId })).dialogueHistoryItem)
  }

  public turns(id: string, after?: string, signal?: AbortSignal) {
    return this.request(async () =>
      pageOf((await this.client(signal).DialogueTurns({ id, first: DIALOGUE_PAGE_SIZE, after })).dialogueTurns),
    )
  }

  public interactions(id: string, after?: string, signal?: AbortSignal) {
    return this.request(async () =>
      pageOf(
        (await this.client(signal).DialogueInteractions({ id, first: DIALOGUE_PAGE_SIZE, after })).dialogueInteractions,
      ),
    )
  }

  public agents(after?: string, signal?: AbortSignal) {
    return this.request(async () => {
      const page = pageOf(
        (await this.client(signal).DialogueAgents({ first: DIALOGUE_PAGE_SIZE, after })).agentDefinitions,
      )

      return {
        ...page,
        items: page.items.map((agent) => ({
          id: agent.agent.id,
          version: agent.agent.version,
          name: agent.displayName,
          description: agent.description ?? '',
        })),
      }
    })
  }

  public configuration(id: string, version: string, signal?: AbortSignal) {
    return this.request(async () => {
      const { inspectAgentConfiguration } = await this.client(signal).DialogueAgentConfiguration({ id, version })
      const options: AgentOption[] = inspectAgentConfiguration.options.map((option) => {
        if (option.__typename === 'AgentConfigurationBooleanModel') {
          return { kind: 'boolean', id: option.id, name: option.name, value: option.enabled }
        }

        return { kind: 'select', id: option.id, name: option.name, value: option.selected, choices: option.values }
      })

      return { revision: inspectAgentConfiguration.catalogRevision, options }
    })
  }

  public create(input: CreateDialogueInput) {
    return this.request(async () => (await this.client().CreateDialogue({ input })).createDialogue)
  }

  public send(input: SendDialogueInput) {
    return this.request(async () => (await this.client().SendDialogue({ input })).sendDialogueMessage)
  }

  public respond(input: RespondDialogueInput) {
    return this.request(async () => (await this.client().RespondToDialogue({ input })).respondDialogue)
  }

  public cancel(id: string, turnId: string) {
    return this.request(async () => (await this.client().CancelDialogue({ id, turnId })).cancelDialogueTurn)
  }

  public read(id: string, through: string) {
    return this.request(async () => (await this.client().ReadDialogue({ id, through })).markDialogueRead)
  }

  public reopen(id: string) {
    return this.request(async () => (await this.client().ReopenDialogue({ id })).reopenDialogue)
  }

  public fork(id: string, turnId: string, title: string) {
    return this.request(
      async () => (await this.client().ForkDialogue({ input: { dialogueId: id, turnId, title } })).forkDialogue,
    )
  }
}
