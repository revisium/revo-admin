import { makeAutoObservable } from 'mobx'
import { DialogueEngine } from 'src/modules/dialogue-engine'
import { DialogueSidebarItemViewModel } from './DialogueSidebarItemViewModel'
import { container } from 'src/shared/lib'

export class DialogueSidebarViewModel {
  private pathname = ''
  private readonly rows = new Map<string, DialogueSidebarItemViewModel>()
  public constructor(private readonly engine: DialogueEngine) {
    makeAutoObservable<this, 'rows'>(this, { rows: false }, { autoBind: true })
  }

  public setup(pathname: string): void {
    this.pathname = pathname
  }

  public mount(pathname: string): void {
    this.setup(pathname)
  }

  public get items(): readonly DialogueSidebarItemViewModel[] {
    return this.engine.list.items.map((dialogue) => {
      let row = this.rows.get(dialogue.id)

      if (!row) {
        row = new DialogueSidebarItemViewModel(dialogue, () => this.pathname)
        this.rows.set(dialogue.id, row)
      }

      return row
    })
  }

  public get connectionError() {
    return this.engine.list.connection.error
  }

  public get hasMore() {
    return this.engine.list.hasMore
  }

  public get loading() {
    return this.engine.list.loading
  }

  public get error() {
    return this.engine.list.error
  }

  public loadMore(): void {
    this.engine.list.loadMore().catch(() => {
      // The list exposes the request error to the view.
    })
  }
}
container.register(
  DialogueSidebarViewModel,
  () => {
    const engine = container.get(DialogueEngine)

    return new DialogueSidebarViewModel(engine)
  },
  { scope: 'transient' },
)
