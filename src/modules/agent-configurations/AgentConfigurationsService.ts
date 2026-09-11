import { makeAutoObservable, runInAction } from 'mobx'
import { ObservableRequest } from 'src/modules/observable-request'
import type { AgentConfigurationsTransport } from './contracts/transport'
import type {
  AgentConfigurationCatalog,
  AgentConfigurationOption,
  AgentConfigurationsSnapshot,
  AgentDefinition,
  AgentLaunchConfiguration,
  AgentConfigurationsStatus,
} from './contracts/types'

const INITIAL_STATUS: AgentConfigurationsStatus = 'NOT_INITIALIZED'

export class AgentConfigurationsService {
  private status: AgentConfigurationsStatus = INITIAL_STATUS
  private catalogs: readonly AgentConfigurationCatalog[] = []
  private definitions: readonly AgentDefinition[] = []
  private errorMessage = ''
  private lifetime = new AbortController()
  private lease?: ReturnType<AgentConfigurationsTransport['subscribe']>
  private pendingDefinitions: readonly AgentDefinition[] | undefined
  private readonly definitionsRequest

  public constructor(private readonly transport: AgentConfigurationsTransport) {
    this.definitionsRequest = ObservableRequest.of((signal: AbortSignal) => this.loadDefinitions(signal))
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get readiness(): AgentConfigurationsStatus {
    return this.status
  }

  public get catalogsSnapshot(): readonly AgentConfigurationCatalog[] {
    return this.catalogs
  }

  public get availableAgents(): readonly AgentDefinition[] {
    return this.definitions.filter((agent) => this.catalogFor(agent.id, agent.version))
  }

  public get availableModels(): readonly { readonly provider: string; readonly model: string }[] {
    return this.catalogs.flatMap(
      (catalog) =>
        catalog.model?.providers.flatMap((provider) =>
          provider.models.map((model) => ({ provider: provider.name, model: model.value })),
        ) ?? [],
    )
  }

  public get error(): string {
    return this.errorMessage
  }

  public catalogFor(agentId: string, version: string): AgentConfigurationCatalog | undefined {
    return this.catalogs.find((catalog) => catalog.agent.id === agentId && catalog.agent.version === version)
  }

  public optionsFor(agentId: string, version: string): readonly AgentConfigurationOption[] {
    return this.catalogFor(agentId, version)?.options ?? []
  }

  public validateLaunchConfiguration(
    agentId: string,
    version: string,
    selections: Readonly<Record<string, string | boolean>>,
  ): AgentLaunchConfiguration {
    const catalog = this.catalogFor(agentId, version)

    if (this.status !== 'READY' || !catalog) throw new Error('Agent configuration is not ready.')

    const resolvedSelections = Object.fromEntries(
      catalog.options.map((option) => [option.id, selections[option.id] ?? option.currentValue]),
    )

    for (const option of catalog.options) {
      const value = resolvedSelections[option.id]

      if (option.kind === 'boolean' && typeof value !== 'boolean')
        throw new Error(`Expected a boolean value for ${option.id}.`)
      if (
        option.kind === 'select' &&
        (typeof value !== 'string' || !option.values.some((choice) => choice.value === value))
      )
        throw new Error(`Unknown value for ${option.id}.`)
    }

    return { catalogRevision: catalog.catalogRevision, selections: resolvedSelections }
  }

  public start(): void {
    if (this.lease && !this.lifetime.signal.aborted) return

    this.lifetime = new AbortController()
    this.status = 'LOADING'
    this.errorMessage = ''
    this.lease = this.transport.subscribe({
      signal: this.lifetime.signal,
      prepare: this.prepare,
      next: this.receive,
      changed: this.changeConnection,
    })
    this.lease.done.catch(this.fail)
  }

  public dispose(): void {
    this.lifetime.abort()
    this.lease?.dispose()
    this.lease = undefined
    this.definitionsRequest.abort()
    this.pendingDefinitions = undefined
    this.status = INITIAL_STATUS
    this.catalogs = []
    this.definitions = []
  }

  private async prepare(signal: AbortSignal): Promise<void> {
    this.status = 'LOADING'
    const result = await this.definitionsRequest.fetch(signal)

    if (!result.isRight) {
      signal.throwIfAborted()
      throw result.error
    }

    this.pendingDefinitions = result.data
  }

  private receive(snapshot: AgentConfigurationsSnapshot, signal: AbortSignal): void {
    signal.throwIfAborted()
    const nextDefinitions = this.pendingDefinitions

    runInAction(() => {
      this.status = snapshot.status
      this.catalogs = snapshot.catalogs
      if (nextDefinitions) this.definitions = nextDefinitions
      this.pendingDefinitions = undefined
      this.errorMessage = ''
    })
  }

  private changeConnection(state: { readonly status: string; readonly error: string }): void {
    if (state.error) this.errorMessage = state.error
    if (state.status === 'Connecting' || state.status === 'Reconnecting' || state.status === 'Offline')
      this.status = 'LOADING'
  }

  private fail(error: unknown): void {
    if (this.lifetime.signal.aborted) return
    runInAction(() => {
      this.status = 'NOT_INITIALIZED'
      this.errorMessage = error instanceof Error ? error.message : 'Agent configurations could not be loaded.'
    })
  }

  private async loadDefinitions(signal: AbortSignal): Promise<readonly AgentDefinition[]> {
    const result: AgentDefinition[] = []
    let after: string | undefined

    do {
      signal.throwIfAborted()
      const page = await this.transport.definitions(signal, after)
      result.push(...page.items)
      after = page.next
    } while (after)

    return result
  }
}
