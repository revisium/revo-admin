import { makeAutoObservable } from 'mobx'
import type { DialogueView } from 'src/modules/dialogue-engine'
import { routes } from 'src/shared/config'

export class DialogueSidebarItemViewModel {
  public constructor(
    private readonly dialogue: DialogueView,
    private readonly currentPath: () => string,
  ) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get id(): string {
    return this.dialogue.id
  }

  public get title(): string {
    return this.dialogue.title || 'Untitled chat'
  }

  public get to(): string {
    return routes.chat(this.id)
  }

  public get active(): boolean {
    return this.currentPath() === this.to
  }

  public get busy(): boolean {
    return this.dialogue.busy
  }

  public get unread(): boolean {
    return this.dialogue.unread
  }

  public get hasIndicator(): boolean {
    return this.busy || this.unread
  }
}
