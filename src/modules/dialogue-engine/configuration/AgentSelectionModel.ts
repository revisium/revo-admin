import { makeAutoObservable } from 'mobx'
import type { DialogueBackend } from '../contracts/backend.types'
import type { AgentDefinition, AgentOption } from '../contracts/agent.types'
import { ObservableRequest } from 'src/modules/observable-request'

export class AgentSelectionModel {
  private key = ''
  private selections: Record<string, string | boolean> = {}
  private readonly agentsRequest
  private readonly configurationRequest
  private controller = new AbortController()
  private configurationController = new AbortController()

  public constructor(private readonly api: DialogueBackend) {
    this.agentsRequest = ObservableRequest.of(() => this.loadDefinitions(this.controller.signal))
    this.configurationRequest = ObservableRequest.of((id: string, version: string, signal: AbortSignal) =>
      api.configuration(id, version, signal),
    )
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get agentKey() {
    return this.key
  }

  public get agents() {
    return Object.freeze(
      (this.agentsRequest.data ?? []).map((agent) => Object.freeze({ ...agent, key: `${agent.id}@${agent.version}` })),
    )
  }

  public get selectedAgent() {
    return this.agents.find((agent) => agent.key === this.key)
  }

  public get options(): readonly AgentOption[] {
    return Object.freeze((this.configurationRequest.data?.options ?? []).map(this.selectedOption))
  }

  private selectedOption(option: AgentOption): AgentOption {
    const value = this.selections[option.id]

    if (option.kind === 'boolean') {
      return Object.freeze({ ...option, value: typeof value === 'boolean' ? value : option.value })
    }

    return Object.freeze({ ...option, value: typeof value === 'string' ? value : option.value })
  }

  public get ready() {
    return Boolean(this.selectedAgent && this.configurationRequest.data) && !this.loadingConfiguration
  }

  public get loadingAgents() {
    return this.agentsRequest.isLoading
  }

  public get loadingConfiguration() {
    return this.configurationRequest.isLoading
  }

  public get error() {
    return this.agentsRequest.errorMessage ?? this.configurationRequest.errorMessage ?? ''
  }

  public get configuration() {
    return { selections: { ...this.selections }, catalogRevision: this.configurationRequest.data?.revision ?? '' }
  }

  public async load(): Promise<void> {
    this.controller = new AbortController()
    const result = await this.agentsRequest.fetch()

    if (result.isRight && !this.key && this.agents[0]) await this.selectAgent(this.agents[0].key)
  }

  public async selectAgent(key: string): Promise<void> {
    this.configurationController.abort()
    this.configurationController = new AbortController()
    this.configurationRequest.abort()
    this.key = key
    this.selections = {}
    const agent = this.selectedAgent

    if (!agent) return

    const result = await this.configurationRequest.fetch(agent.id, agent.version, this.configurationController.signal)

    if (!result.isRight || this.key !== key) return

    this.applyDefaults(result.data.options)
  }

  public selectOption(id: string, value: string | boolean): void {
    const option = this.options.find((candidate) => candidate.id === id)

    if (!option) throw new Error('Unknown agent option.')

    if (option.kind === 'boolean' && typeof value !== 'boolean') throw new Error('Expected a boolean value.')

    if (option.kind === 'select' && !option.choices.some((choice) => choice.value === value))
      throw new Error('Unknown agent option value.')

    this.selections[id] = value
  }

  private applyDefaults(options: readonly AgentOption[]): void {
    this.selections = Object.fromEntries(options.map((option) => [option.id, option.value]))
  }

  private async loadDefinitions(signal: AbortSignal): Promise<AgentDefinition[]> {
    const agents: AgentDefinition[] = []
    let after: string | undefined

    do {
      signal.throwIfAborted()
      const page = await this.api.agents(after, signal)
      agents.push(...page.items)
      after = page.next
    } while (after)

    return agents
  }

  public dispose(): void {
    this.controller.abort()
    this.configurationController.abort()
    this.agentsRequest.abort()
    this.configurationRequest.abort()
  }
}
