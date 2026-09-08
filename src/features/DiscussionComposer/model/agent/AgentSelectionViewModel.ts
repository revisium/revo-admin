import { makeAutoObservable } from 'mobx'
import type { AgentSelectionModel } from 'src/modules/dialogue-engine'
import { AgentConfigurationFieldViewModel } from './AgentConfigurationFieldViewModel'

export class AgentSelectionViewModel {
  private readonly rows = new Map<string, AgentConfigurationFieldViewModel>()

  public constructor(
    private readonly selection: AgentSelectionModel,
    private readonly locked: () => boolean,
  ) {
    makeAutoObservable<this, 'rows'>(this, { rows: false }, { autoBind: true })
  }

  public get value(): string {
    return this.selection.agentKey
  }

  public get agents(): readonly { key: string; displayName: string }[] {
    return this.selection.agents.map((agent) => ({ key: agent.key, displayName: agent.name }))
  }

  public get fields(): readonly AgentConfigurationFieldViewModel[] {
    return this.selection.options.map((field) => {
      const key = `${this.selection.agentKey}:${field.id}`
      let row = this.rows.get(key)

      if (!row) {
        row = new AgentConfigurationFieldViewModel(field.id, this.selection, this.locked)
        this.rows.set(key, row)
      }

      return row
    })
  }

  public get disabled(): boolean {
    return this.locked() || this.selection.loadingAgents
  }

  public get loading(): boolean {
    return this.selection.loadingConfiguration
  }

  public get error(): string {
    return this.selection.error
  }

  public select(key: string): void {
    if (this.disabled) return

    this.selection.selectAgent(key)
  }
}
