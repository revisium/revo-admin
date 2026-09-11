import { DialogueEngine } from 'src/modules/dialogue-engine'
import { AgentConfigurationsService } from 'src/modules/agent-configurations'
import { container } from 'src/shared/lib'

export class LayoutLifecycleViewModel {
  public constructor(
    private readonly engine: DialogueEngine,
    private readonly configurations: AgentConfigurationsService,
  ) {}

  public mount(): void {
    this.engine.start()
    this.configurations.start()
  }

  public unmount(): void {
    this.engine.dispose()
    this.configurations.dispose()
  }
}
container.register(
  LayoutLifecycleViewModel,
  () => {
    const engine = container.get(DialogueEngine)
    const configurations = container.get(AgentConfigurationsService)

    return new LayoutLifecycleViewModel(engine, configurations)
  },
  { scope: 'transient' },
)
