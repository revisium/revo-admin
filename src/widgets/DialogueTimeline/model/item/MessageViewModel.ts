import { makeAutoObservable } from 'mobx'
import type { DialogueEntry } from 'src/modules/dialogue-engine'
import { ClipboardService } from 'src/shared/lib'
import { MessageActionsViewModel } from './MessageActionsViewModel'
import { entryNotice } from './entry-presentation'

export class MessageViewModel {
  public readonly blockType = 'message' as const
  public readonly actions: MessageActionsViewModel

  public constructor(
    private readonly item: DialogueEntry,
    clipboard: ClipboardService,
  ) {
    this.actions = new MessageActionsViewModel(item, clipboard)
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get id(): string {
    return this.item.id
  }

  public get source(): string {
    return this.item.source
  }

  public get kind(): string {
    return this.item.kind
  }

  public get status(): string {
    return this.item.status
  }

  public get text(): string {
    return this.item.text
  }

  public get fromUser(): boolean {
    return this.item.source === 'USER'
  }

  public get showText(): boolean {
    return Boolean(this.text)
  }

  public get notice(): string {
    return entryNotice(this.item)
  }

  public dispose(): void {
    this.actions.dispose()
  }
}
