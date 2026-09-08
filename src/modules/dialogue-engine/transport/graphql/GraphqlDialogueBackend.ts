import { pageOf, snapshotOf } from './page-mapping'
import { transportError } from './graphql-error'
import type { AgentOption } from '../../contracts/agent.types'
import {
  getSdk,
  type CreateDialogueInput,
  type RespondDialogueInput,
  type SendDialogueInput,
} from './__generated__/graphql-request'
import { DialogueEventsDocument, DialogueSummariesDocument } from './__generated__/typed-document-nodes'
import type { DialogueBackend, WatchChanges } from '../../contracts/backend.types'
import { GraphQLClient } from 'graphql-request'
import type { GraphqlDialogueOptions } from './transport.types'
import { SubscriptionExecutionError, type SubscriptionTransport } from 'src/modules/graphql-subscriptions'
import { executionError } from './graphql-error'

export const DIALOGUE_PAGE_SIZE = 50

export class GraphqlDialogueBackend implements DialogueBackend {
  public constructor(
    private readonly options: GraphqlDialogueOptions,
    private readonly subscriptions: SubscriptionTransport,
  ) {}

  public watch: WatchChanges = async (scope, options) => {
    const callbacks = {
      signal: options.signal,
      changed: options.changed,
      recover: (error: unknown, signal: AbortSignal) =>
        options.recover(
          error instanceof SubscriptionExecutionError ? executionError(error.errors) : transportError(error),
          signal,
        ),
    }
    const lease = scope
      ? this.subscriptions.subscribe(DialogueEventsDocument, {
          ...callbacks,
          prepare: async (signal) => ({ ids: [scope], after: await options.prepare(signal) }),
          next: (data, signal) => options.receive(data.dialogueChanges, signal),
        })
      : this.subscriptions.subscribe(DialogueSummariesDocument, {
          ...callbacks,
          prepare: async (signal) => ({ after: await options.prepare(signal) }),
          next: (data, signal) => options.receive(data.dialogueSummaryChanges, signal),
        })

    await this.request(() => lease.done)
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
      throw error instanceof SubscriptionExecutionError ? executionError(error.errors) : transportError(error)
    }
  }
}
