import { DialogueEngine } from 'src/modules/dialogue-engine'
import { container } from 'src/shared/lib'

export class LayoutLifecycleViewModel {
  public constructor(private readonly engine: DialogueEngine) {}

  public mount(): void {
    this.engine.start()
  }

  public unmount(): void {
    this.engine.dispose()
  }
}
container.register(
  LayoutLifecycleViewModel,
  () => {
    const engine = container.get(DialogueEngine)

    return new LayoutLifecycleViewModel(engine)
  },
  { scope: 'transient' },
)
