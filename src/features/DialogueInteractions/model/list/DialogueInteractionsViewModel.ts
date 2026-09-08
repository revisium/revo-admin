import { InteractionViewModel } from '../item/InteractionViewModel'
import { makeAutoObservable } from 'mobx'
import { DialogueEngine } from 'src/modules/dialogue-engine'
import { container } from 'src/shared/lib'

export class DialogueInteractionsViewModel {
  private dialogueId = ''
  private readonly rows = new Map<string, InteractionViewModel>()
  public constructor(private readonly engine: DialogueEngine) {
    makeAutoObservable<this, 'rows'>(this, { rows: false }, { autoBind: true })
  }

  public setup(dialogueId: string): void {
    this.dialogueId = dialogueId
  }

  public mount(dialogueId: string): void {
    this.setup(dialogueId)
  }

  public get items(): readonly InteractionViewModel[] {
    return this.engine.get(this.dialogueId).pendingInteractions.map((interaction) => {
      let row = this.rows.get(interaction.id)

      if (!row) {
        row = new InteractionViewModel(interaction)
        this.rows.set(interaction.id, row)
      }

      return row
    })
  }

  public unmount(): void {
    this.rows.forEach((row) => row.dispose())
    this.rows.clear()
  }
}
container.register(
  DialogueInteractionsViewModel,
  () => {
    const engine = container.get(DialogueEngine)

    return new DialogueInteractionsViewModel(engine)
  },
  { scope: 'transient' },
)
