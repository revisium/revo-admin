import { makeAutoObservable } from 'mobx'
import type { DialogueEntry } from 'src/modules/dialogue-engine'
import { ClipboardService, ObservableRequest } from 'src/shared/lib'

export class MessageActionsViewModel {
  private readonly copyRequest

  public constructor(
    private readonly item: DialogueEntry,
    private readonly clipboard: ClipboardService,
  ) {
    this.copyRequest = ObservableRequest.of(async () => {
      await this.clipboard.write(this.item.text)

      return true
    })
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get visible(): boolean {
    return (
      this.item.kind === 'MESSAGE' &&
      this.item.source === 'AGENT' &&
      Boolean(this.item.text) &&
      this.item.status !== 'STREAMING'
    )
  }

  public get copying(): boolean {
    return this.copyRequest.isLoading
  }

  public get copyLabel(): string {
    return this.copyRequest.data === true ? 'Copied' : 'Copy message'
  }

  public get error(): string {
    return this.copyRequest.errorMessage ?? ''
  }

  public copy(): void {
    if (!this.visible || this.copying) {
      return
    }

    this.copyRequest.fetch()
  }

  public dispose(): void {
    this.copyRequest.abort()
  }
}
