import { makeAutoObservable, observable, reaction, type IReactionDisposer } from 'mobx'
import { DialogueEngine } from 'src/modules/dialogue-engine'
import { container, ObservableRequest } from 'src/shared/lib'

type AutoReadTrigger = {
  readonly unread: boolean
  readonly revision: string
}

export class AssistantPageViewModel {
  private chatId?: string
  private readonly openRequest
  private readonly actionRequest
  private readonly pageRequest

  private lease?: ReturnType<DialogueEngine['open']>
  private autoReadDisposer?: IReactionDisposer
  private autoReadInFlight?: Promise<void>
  private autoReadPending?: AutoReadTrigger
  private autoReadEnabled = false
  private failedAutoRead?: AutoReadTrigger
  private activeGeneration = 0

  public constructor(private readonly engine: DialogueEngine) {
    this.openRequest = ObservableRequest.of((id: string) => this.openDialogue(id))
    this.actionRequest = ObservableRequest.of((action: () => Promise<void>) => action())
    this.pageRequest = ObservableRequest.of(async () => {
      if (this.chat) await this.chat.history.loadMore()
    })
    makeAutoObservable<this, 'lease' | 'autoReadDisposer' | 'autoReadInFlight'>(
      this,
      { lease: observable.ref, autoReadDisposer: false, autoReadInFlight: false },
      { autoBind: true },
    )
  }

  public setup(id?: string): void {
    this.chatId = id
  }

  public mount(id?: string): void {
    this.chatId = id
    this.activeGeneration += 1
    this.autoReadEnabled = false
    this.autoReadPending = undefined
    this.failedAutoRead = undefined
    this.autoReadDisposer?.()
    this.autoReadDisposer = reaction(
      () => {
        const chat = this.chat

        return chat ? { unread: chat.unread, revision: chat.revision } : undefined
      },
      (trigger) => {
        if (trigger?.unread) this.requestAutoRead(trigger)
      },
      {
        equals: (left, right) => left?.unread === right?.unread && left?.revision === right?.revision,
      },
    )

    if (id) this.openRequest.fetch(id)
  }

  public unmount(): void {
    this.activeGeneration += 1
    this.autoReadEnabled = false
    this.autoReadPending = undefined
    this.autoReadDisposer?.()
    this.autoReadDisposer = undefined
    this.lease?.release()
    this.lease = undefined
    this.openRequest.abort()
    this.actionRequest.abort()
    this.pageRequest.abort()
  }

  private async openDialogue(id: string): Promise<void> {
    const generation = this.activeGeneration
    this.lease?.release()
    const lease = this.engine.open(id)
    this.lease = lease
    await lease.ready

    if (!this.isCurrentLease(lease, generation, id)) return

    await lease.dialogue.markRead()

    if (!this.isCurrentLease(lease, generation, id)) return

    this.autoReadEnabled = true
    if (lease.dialogue.unread) {
      this.requestAutoRead({ unread: true, revision: lease.dialogue.revision })
    }
  }

  private isCurrentLease(lease: ReturnType<DialogueEngine['open']>, generation: number, id: string): boolean {
    return this.activeGeneration === generation && this.lease === lease && this.chatId === id
  }

  private requestAutoRead(trigger: AutoReadTrigger): void {
    if (!this.autoReadEnabled || this.sameTrigger(trigger, this.failedAutoRead)) return

    this.autoReadPending = trigger
    this.startAutoRead()
  }

  private startAutoRead(): void {
    if (this.autoReadInFlight) return

    this.autoReadInFlight = this.drainAutoRead().finally(() => {
      this.autoReadInFlight = undefined
      if (this.autoReadPending) this.startAutoRead()
    })
  }

  private async drainAutoRead(): Promise<void> {
    while (this.autoReadPending) {
      const trigger = this.autoReadPending
      this.autoReadPending = undefined
      const lease = this.lease
      const generation = this.activeGeneration
      const id = this.chatId

      if (this.sameTrigger(trigger, this.failedAutoRead) || !lease || !id || !this.autoReadEnabled) return

      try {
        await lease.dialogue.refresh()

        if (!this.isCurrentLease(lease, generation, id) || !lease.dialogue.unread) continue

        await lease.dialogue.markRead()
      } catch {
        if (!this.isCurrentLease(lease, generation, id)) return

        this.failedAutoRead = trigger
        continue
      }

      if (!this.isCurrentLease(lease, generation, id)) return
    }
  }

  private sameTrigger(left?: AutoReadTrigger, right?: AutoReadTrigger): boolean {
    return Boolean(left && right && left.unread === right.unread && left.revision === right.revision)
  }

  private get chat() {
    return this.chatId ? this.engine.get(this.chatId) : undefined
  }

  public get title() {
    return this.chat?.title ?? 'What would you like to do?'
  }

  public get description(): string {
    return this.isNew ? 'Explore an idea, prepare a project, or design your next pipeline.' : ''
  }

  private get connection() {
    return this.chatId ? this.engine.get(this.chatId).connection : undefined
  }

  public get dialogueId(): string {
    return this.chatId ?? ''
  }

  public get hasDialogue(): boolean {
    return Boolean(this.chat?.ready)
  }

  public get connectionLabel(): string {
    return this.connection?.status ?? 'Connecting'
  }

  public get showConnectionStatus() {
    return Boolean(this.connection && this.connection.status !== 'Live')
  }

  public get connectionError(): string {
    return this.connection?.error ?? ''
  }

  public get hasMoreHistory(): boolean {
    return this.chat?.history.hasMore ?? false
  }

  public get loadingHistory(): boolean {
    return this.pageRequest.isLoading
  }

  public loadMoreHistory(): void {
    this.pageRequest.fetch()
  }

  public get isNew() {
    return !this.chatId
  }

  public get loading() {
    return Boolean(this.chat?.loading)
  }

  public get error() {
    return (
      this.openRequest.errorMessage ??
      this.actionRequest.errorMessage ??
      this.pageRequest.errorMessage ??
      this.chat?.error ??
      ''
    )
  }

  public get working() {
    return this.actionRequest.isLoading
  }

  public get canCancel() {
    return Boolean(this.chat?.canCancel && !this.working)
  }

  public get canReopen() {
    return Boolean(this.chat?.canReopen && !this.working)
  }

  public get notice() {
    if (this.chat?.status === 'UNCERTAIN')
      return 'The previous execution could not be confirmed. Review the saved history, then explicitly reopen to continue. No work will be retried automatically.'

    if (this.chat?.contextMode === 'FORK')
      return 'Forked conversation. Earlier entries are copied history; the agent continues with transferred context.'

    return ''
  }

  public get showControls() {
    return !this.isNew && (this.showConnectionStatus || this.canCancel || this.canReopen)
  }

  public cancel(): void {
    const chat = this.chat

    if (!chat || !this.canCancel) return
    this.actionRequest.fetch(async () => {
      await chat.cancel()
    })
  }

  public reopen(): void {
    const chat = this.chat

    if (!chat || !this.canReopen) return
    this.actionRequest.fetch(async () => {
      await chat.reopen()
    })
  }
}

container.register(
  AssistantPageViewModel,
  () => {
    const engine = container.get(DialogueEngine)

    return new AssistantPageViewModel(engine)
  },
  { scope: 'transient' },
)
