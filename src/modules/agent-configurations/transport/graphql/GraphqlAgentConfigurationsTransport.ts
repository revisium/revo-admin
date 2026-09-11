import { GraphQLClient } from 'graphql-request'
import type { SubscriptionOptions, SubscriptionTransport } from 'src/modules/graphql-subscriptions'
import type { AgentConfigurationsTransport } from '../../contracts/transport'
import type { AgentConfigurationsSnapshot, AgentDefinitionPage } from '../../contracts/types'
import { AgentConfigurationsDocument } from './__generated__/typed-document-nodes'
import {
  getSdk,
  type AgentConfigurationDefinitionsQuery,
  type AgentConfigurationsSubscription,
} from './__generated__/graphql-request'

const PAGE_SIZE = 50

interface GraphqlAgentConfigurationsOptions {
  readonly endpoint: string
  readonly fetch?: typeof globalThis.fetch
  readonly headers?: Record<string, string>
  readonly credentials?: RequestCredentials
}

export class GraphqlAgentConfigurationsTransport implements AgentConfigurationsTransport {
  public constructor(
    private readonly options: GraphqlAgentConfigurationsOptions,
    private readonly subscriptions: SubscriptionTransport,
  ) {}

  public async definitions(signal: AbortSignal, after?: string): Promise<AgentDefinitionPage> {
    const response: AgentConfigurationDefinitionsQuery = await getSdk(
      this.client(signal),
    ).AgentConfigurationDefinitions({
      first: PAGE_SIZE,
      after,
    })
    const page = response.agentDefinitions

    return {
      items: page.edges.map(({ node }) => ({
        id: node.agent.id,
        version: node.agent.version,
        name: node.displayName,
        description: node.description ?? '',
      })),
      next: page.pageInfo.hasNextPage ? (page.pageInfo.endCursor ?? undefined) : undefined,
    }
  }

  public subscribe(options: {
    readonly signal: AbortSignal
    readonly prepare: (signal: AbortSignal) => Promise<void>
    readonly next: (snapshot: AgentConfigurationsSnapshot, signal: AbortSignal) => void | Promise<void>
    readonly changed?: (state: { readonly status: string; readonly error: string }) => void
  }) {
    const subscriptionOptions: SubscriptionOptions<AgentConfigurationsSubscription, Record<string, never>> = {
      signal: options.signal,
      prepare: async (signal) => {
        await options.prepare(signal)
        return {}
      },
      next: (data, signal) => options.next(this.snapshotOf(data.agentConfigurations), signal),
      changed: options.changed,
    }

    return this.subscriptions.subscribe(AgentConfigurationsDocument, subscriptionOptions)
  }

  private snapshotOf(value: AgentConfigurationsSubscription['agentConfigurations']): AgentConfigurationsSnapshot {
    return {
      status: value.status,
      catalogs: value.catalogs.map((catalog) => ({
        ...catalog,
        model: catalog.model
          ? {
              ...catalog.model,
              providers: catalog.model.providers.map((provider) => ({
                ...provider,
                models: provider.models.map((model) => this.valueOf(model)),
              })),
              sessionAvailable: catalog.model.sessionAvailable.map((model) => this.valueOf(model)),
            }
          : catalog.model,
        options: catalog.options.map((option) =>
          option.__typename === 'AgentConfigurationBooleanModel'
            ? {
                kind: 'boolean' as const,
                category: option.category,
                currentValue: option.booleanValue,
                description: option.description ?? undefined,
                id: option.id,
                name: option.name,
                type: option.type,
              }
            : {
                kind: 'select' as const,
                category: option.category,
                currentValue: option.selectValue,
                description: option.description ?? undefined,
                id: option.id,
                name: option.name,
                type: option.type,
                values: option.values.map((value) => ({ ...value, description: value.description ?? undefined })),
              },
        ),
      })),
    }
  }

  private valueOf(value: {
    readonly description?: string | null
    readonly group?: { readonly id: string; readonly name: string } | null
    readonly name: string
    readonly value: string
  }) {
    return { ...value, description: value.description ?? undefined }
  }

  private client(signal: AbortSignal): GraphQLClient {
    return new GraphQLClient(this.options.endpoint, {
      credentials: this.options.credentials ?? 'include',
      headers: this.options.headers,
      fetch: (input, init) =>
        (this.options.fetch ?? globalThis.fetch)(input, { ...init, signal: signal ?? init?.signal }),
    })
  }
}
