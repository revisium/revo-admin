import { makeAutoObservable } from 'mobx'
import type { AgentSelectionModel } from 'src/modules/agent-configurations'

export class AgentConfigurationFieldViewModel {
  public constructor(
    public readonly id: string,
    private readonly selection: AgentSelectionModel,
    private readonly locked: () => boolean,
  ) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  private get field() {
    return this.selection.options.find((field) => field.id === this.id)
  }

  public get label(): string {
    return this.field?.name ?? ''
  }

  public get value(): string {
    return String(this.field?.currentValue ?? '')
  }

  public get disabled(): boolean {
    return this.locked() || this.selection.loading
  }

  public get options(): readonly { value: string; name: string }[] {
    if (this.field?.kind === 'boolean') {
      return [
        { value: 'true', name: 'Enabled' },
        { value: 'false', name: 'Disabled' },
      ]
    }

    return this.field?.kind === 'select'
      ? this.field.values.map((choice) => ({ value: choice.value, name: choice.name }))
      : []
  }

  public select(value: string): void {
    if (this.disabled) return

    this.selection.selectOption(this.id, this.field?.kind === 'boolean' ? value === 'true' : value)
  }
}
