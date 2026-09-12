import { makeAutoObservable, reaction } from 'mobx'
import type { AgentConfigurationsService } from './AgentConfigurationsService'
import type { AgentConfigurationOption, AgentLaunchConfiguration } from './contracts/types'

export class AgentSelectionModel {
  private key = ''
  private selections: Record<string, string | boolean> = {}
  private revision = ''
  private stopCatalogReaction?: () => void

  public constructor(private readonly service: AgentConfigurationsService) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public start(): void {
    if (this.stopCatalogReaction) return

    this.stopCatalogReaction = reaction(
      () => [this.service.readiness, this.service.catalogsSnapshot] as const,
      () => this.synchronizeCatalog(),
    )
    this.synchronizeCatalog()
  }

  public get agentKey(): string {
    return this.key
  }

  public get agents(): readonly {
    readonly id: string
    readonly version: string
    readonly installationId: string
    readonly name: string
    readonly description: string
    readonly key: string
  }[] {
    return this.service.availableAgents.map((agent) => {
      const catalog = this.service.catalogFor(agent.id, agent.version, agent.installationId)
      return {
        ...agent,
        key: `${agent.id}@${agent.version}@${agent.installationId}`,
        name: `${agent.name} — ${catalog?.launch.reportedVersion ?? 'unknown'} — ${agent.installationId}`,
      }
    })
  }

  public get selectedAgent() {
    return this.agents.find((agent) => agent.key === this.key)
  }

  public get options(): readonly AgentConfigurationOption[] {
    const agent = this.selectedAgent
    return agent
      ? this.service
          .optionsFor(agent.id, agent.version, agent.installationId)
          .map((option) => this.withSelection(option))
      : []
  }

  public get ready(): boolean {
    return (
      this.service.readiness === 'READY' &&
      Boolean(
        this.selectedAgent &&
        this.service.catalogFor(this.selectedAgent.id, this.selectedAgent.version, this.selectedAgent.installationId),
      )
    )
  }

  public get loading(): boolean {
    return this.service.readiness === 'LOADING'
  }

  public get error(): string {
    return this.service.error
  }

  public get configuration(): AgentLaunchConfiguration {
    const agent = this.selectedAgent
    if (!agent) throw new Error('Choose an agent first.')

    const selections = Object.fromEntries(this.options.map((option) => [option.id, option.currentValue]))

    return this.service.validateLaunchConfiguration(agent.id, agent.version, agent.installationId, {
      ...selections,
      ...this.selections,
    })
  }

  public selectAgent(key: string): void {
    const agent = this.agents.find((candidate) => candidate.key === key)
    if (!agent) return

    const catalog = this.service.catalogFor(agent.id, agent.version, agent.installationId)
    const nextRevision = catalog?.catalogRevision ?? ''
    this.key = key

    this.synchronizeCatalog(nextRevision)
  }

  public selectOption(id: string, value: string | boolean): void {
    this.synchronizeCatalog()
    this.selections[id] = value
  }

  private withSelection(option: AgentConfigurationOption): AgentConfigurationOption {
    const value = this.selections[option.id]
    if (option.kind === 'boolean')
      return { ...option, currentValue: typeof value === 'boolean' ? value : option.currentValue }
    return { ...option, currentValue: typeof value === 'string' ? value : option.currentValue }
  }

  public dispose(): void {
    this.stopCatalogReaction?.()
    this.stopCatalogReaction = undefined
  }

  private synchronizeCatalog(nextRevision?: string): void {
    if (this.service.readiness !== 'READY') return
    const availableAgent = this.agents.find((agent) => agent.key === this.key) ?? this.agents[0]
    if (!availableAgent) {
      this.key = ''
      this.revision = ''
      this.selections = {}
      return
    }

    if (this.key !== availableAgent.key) {
      this.key = availableAgent.key
      this.revision = ''
      this.selections = {}
    }

    const catalog = this.service.catalogFor(availableAgent.id, availableAgent.version, availableAgent.installationId)
    const revision = nextRevision ?? catalog?.catalogRevision ?? ''
    if (this.revision === revision) return

    this.selections = {}
    this.revision = revision
  }
}
