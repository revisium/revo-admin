import { DialogueError } from '../../errors/DialogueError'
import type { DialogueBackend, WatchChanges, HistoryPage } from '../../contracts/backend.types'
import type { DialogueSummary, DialogueItem, DialogueChange, DialogueInteraction } from '../../contracts/dialogue.types'

import { dialogueSummary } from './dialogue-fixtures'
import { ControlledRequest } from './ControlledRequest'
import type { AgentConfiguration, AgentDefinition } from '../../contracts/agent.types'

type ChangeReceiver = (change: DialogueChange) => Promise<void>

const VERSION_INCREMENT = 1n
const RECONNECT_DELAY_MS = 1000

export class ControlledDialogueBackend implements DialogueBackend {
  private summaries = new Map<string, DialogueSummary>()
  private questions = new Map<string, DialogueInteraction>()
  public loseNextResponseAcknowledgement = false
  public responseCommands: string[] = []
  private items = new Map<string, DialogueItem>()
  private events: DialogueChange[] = []
  private watchers = new Set<{
    scope?: string
    receive: (event: DialogueChange) => Promise<void>
    reject: (error: Error) => void
  }>()

  public nextWatchError?: Error
  public watchAttempts = 0
  public offline = false
  public skipNextLiveEvent = false
  public duplicateNextEvent = false
  public loseNextCreateAcknowledgement = false
  public loseNextSendAcknowledgement = false
  public rejectNextCursor = false
  public acceptedTurns = 0
  public createdDialogues = 0
  public historyReads = 0
  public readThrough?: string
  public deliveredCommandIds: string[] = []
  private accepted = new Set<string>()
  private readonly definitions: AgentDefinition[] = []
  private readonly configurations = new Map<string, AgentConfiguration>()
  public readonly requests = {
    details: new ControlledRequest((id: string) => this.summaries.get(id)!),
    history: new ControlledRequest((id: string) => this.historySnapshot(id)),
    interactions: new ControlledRequest((id: string) =>
      this.page([...this.questions.values()].filter((q) => q.dialogueId === id)),
    ),
    configuration: new ControlledRequest((id: string) => {
      const configuration = this.configurations.get(id)

      if (!configuration) {
        throw new Error('No configuration fixture')
      }

      return configuration
    }),
    create: new ControlledRequest((input: Parameters<DialogueBackend['create']>[0]) => this.acceptCreate(input)),
    send: new ControlledRequest((input: Parameters<DialogueBackend['send']>[0]) => this.acceptSend(input)),
    read: new ControlledRequest((id: string, through: string) => {
      this.readThrough = through

      return this.summaries.get(id)!
    }),
    item: new ControlledRequest((_id: string, itemId: string) => this.items.get(itemId)!),
  }

  public agent(id: string, configuration: AgentConfiguration = { revision: '1', options: [] }): void {
    this.definitions.push({ id, version: '1', name: id, description: '' })
    this.configurations.set(id, configuration)
  }

  public dialogue(title: string, overrides: Partial<DialogueSummary> = {}): DialogueSummary {
    const model = dialogueSummary(`dialogue-${this.summaries.size}`, title, overrides)
    this.summaries.set(model.id, model)

    return model
  }

  public async list() {
    return this.page([...this.summaries.values()])
  }

  public async details(id: string) {
    return this.requests.details.execute(id)
  }

  public async history(id: string): ReturnType<DialogueBackend['history']> {
    this.historyReads += 1

    return this.requests.history.execute(id)
  }

  public async item(_id: string, itemId: string) {
    return this.requests.item.execute(_id, itemId)
  }

  public async turns() {
    return this.page([])
  }

  public async interactions(id: string): ReturnType<DialogueBackend['interactions']> {
    return this.requests.interactions.execute(id)
  }

  public async agents(): ReturnType<DialogueBackend['agents']> {
    return this.page(this.definitions)
  }

  public async configuration(_id: string): ReturnType<DialogueBackend['configuration']> {
    return this.requests.configuration.execute(_id)
  }

  public async read(id: string, through: string) {
    return this.requests.read.execute(id, through)
  }

  public question(chat: DialogueSummary, request: DialogueInteraction['request'] = { kind: 'input' }): string {
    const id = `${chat.id}:question`
    this.questions.set(id, { id, dialogueId: chat.id, turnId: 'turn', status: 'PENDING', request })

    return id
  }

  public async respond(input: Parameters<DialogueBackend['respond']>[0]): ReturnType<DialogueBackend['respond']> {
    this.responseCommands.push(input.commandId)
    const current = this.questions.get(input.interactionId)!
    const respondDialogue = {
      ...current,
      status: 'RESOLVED',
      responseCommandId: input.commandId,
      response: input.response,
    }
    this.questions.set(current.id, respondDialogue)

    if (this.loseNextResponseAcknowledgement) {
      this.loseNextResponseAcknowledgement = false
      throw new Error('Response acknowledgement lost')
    }

    return respondDialogue
  }

  public async cancel(): ReturnType<DialogueBackend['cancel']> {
    throw new Error('No active turn fixture')
  }

  public async reopen(): ReturnType<DialogueBackend['reopen']> {
    throw new Error('No uncertain fixture')
  }

  public async fork(): ReturnType<DialogueBackend['fork']> {
    throw new Error('No fork fixture')
  }

  public watch: WatchChanges = async (scope, options) => {
    const { signal, receive, changed } = options

    while (!signal.aborted) {
      try {
        const after = await options.prepare(signal)
        await this.connectWatch(
          scope,
          after,
          signal,
          (event) => receive(event, signal),
          () => changed({ status: 'Live', error: '' }),
        )
        return
      } catch (error) {
        if (signal.aborted) return
        const recovered = options.recover(error, signal)

        if (!recovered && error instanceof DialogueError && error.recovery === 'stop') throw error
        changed({ status: 'Reconnecting', error: error instanceof Error ? error.message : 'Disconnected' })
        await new Promise<void>((resolve) => {
          const finish = () => {
            clearTimeout(timer)
            signal.removeEventListener('abort', finish)
            resolve()
          }
          const timer = setTimeout(finish, RECONNECT_DELAY_MS)
          signal.addEventListener('abort', finish, { once: true })
        })
      }
    }
  }

  public async create(input: Parameters<DialogueBackend['create']>[0]) {
    return this.requests.create.execute(input)
  }

  public async send(input: Parameters<DialogueBackend['send']>[0]) {
    return this.requests.send.execute(input)
  }

  public connections(id: string) {
    return [...this.watchers].filter((w) => w.scope === id).length
  }

  public disconnect(id: string): void {
    for (const watcher of this.watchers)
      if (watcher.scope === id) {
        this.watchers.delete(watcher)
        watcher.reject(new Error('Disconnected'))
      }
  }

  public async stream(chat: DialogueSummary, text: string): Promise<void> {
    const event = this.appendText(chat, text)
    this.events.push(event)

    await this.deliverText(event)
  }

  public async updateSummary(chat: DialogueSummary, patch: Partial<DialogueSummary>): Promise<void> {
    const summary = { ...chat, ...patch }
    this.summaries.set(chat.id, summary)
    const event = { cursor: `event-${this.events.length + 1}`, dialogueId: chat.id, kind: 'SUMMARY_UPDATED', summary }
    await this.publish(event)
  }

  private async connectWatch(
    scope: string | undefined,
    after: string,
    signal: AbortSignal,
    receive: (change: DialogueChange) => Promise<void>,
    connected: () => void,
  ) {
    this.watchAttempts += 1
    this.checkWatchAvailability()
    await this.replay(scope, after, receive)

    if (signal.aborted) {
      return
    }

    connected()
    await this.listen(scope, signal, receive)
  }

  private page<T>(nodes: T[]) {
    return {
      items: nodes,
      next: undefined,
      total: nodes.length,
      snapshot: `event-${this.events.length}`,
    }
  }

  private async acceptCreate(input: Parameters<DialogueBackend['create']>[0]) {
    this.createdDialogues += 1
    const createDialogue = this.dialogue(input.title)

    if (this.loseNextCreateAcknowledgement) {
      this.loseNextCreateAcknowledgement = false
      throw new Error('Creation acknowledgement lost')
    }

    return createDialogue
  }

  private async acceptSend(input: Parameters<DialogueBackend['send']>[0]) {
    this.deliveredCommandIds.push(input.commandId)

    if (!this.accepted.has(input.commandId)) {
      this.accepted.add(input.commandId)
      this.acceptedTurns += 1
    }

    if (this.loseNextSendAcknowledgement) {
      this.loseNextSendAcknowledgement = false
      throw new Error('Acknowledgement lost')
    }

    return {
      id: input.commandId,
      dialogueId: input.dialogueId,
      commandId: input.commandId,
      userItemId: 'user',
      status: 'RUNNING',
      dispatchState: 'ADMITTED',
      cancelRequested: false,
    }
  }

  private historySnapshot(id: string): HistoryPage {
    return {
      ...this.page([...this.items.values()].filter((item) => item.dialogueId === id)),
      observed: this.summaries.get(id)!.significantSequence,
    }
  }

  private checkWatchAvailability(): void {
    if (this.nextWatchError) {
      const error = this.nextWatchError
      this.nextWatchError = undefined
      throw error
    }

    if (this.offline) {
      throw new Error('Offline')
    }

    if (this.rejectNextCursor) {
      this.rejectNextCursor = false
      throw new DialogueError('INVALID_CURSOR', 'Replay position unavailable.', 'refresh')
    }
  }

  private async replay(scope: string | undefined, after: string, receive: ChangeReceiver): Promise<void> {
    const position = Number(after.slice('event-'.length))

    for (const event of this.events.slice(position)) {
      if (!scope || event.dialogueId === scope) {
        await receive(event)
      }
    }
  }

  private listen(scope: string | undefined, signal: AbortSignal, receive: ChangeReceiver): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const watcher = { scope, receive, reject }
      this.watchers.add(watcher)
      signal.addEventListener(
        'abort',
        () => {
          this.watchers.delete(watcher)
          resolve()
        },
        { once: true },
      )
    })
  }

  private appendText(chat: DialogueSummary, text: string): DialogueChange {
    const id = `${chat.id}:answer`
    const current = this.items.get(id)
    const item: DialogueItem = {
      id,
      dialogueId: chat.id,
      sequence: '1',
      kind: 'MESSAGE',
      source: 'AGENT',
      text: (current?.text ?? '') + text,
      status: 'STREAMING',
      version: String(BigInt(current?.version ?? '0') + VERSION_INCREMENT),
      createdAt: chat.createdAt,
      historical: false,
    }
    this.items.set(id, item)
    const event: DialogueChange = {
      cursor: `event-${this.events.length + 1}`,
      dialogueId: chat.id,
      kind: current ? 'HISTORY_TEXT_APPENDED' : 'HISTORY_ITEM_UPSERTED',
      itemId: id,
      itemVersion: item.version,
      baseItemVersion: current?.version,
      textDelta: text,
      item: current ? undefined : item,
    }

    return event
  }

  private async publish(event: DialogueChange): Promise<void> {
    this.events.push(event)

    for (const watcher of this.watchers) {
      if (!watcher.scope || watcher.scope === event.dialogueId) {
        await watcher.receive(event)
      }
    }
  }

  private async deliverText(event: DialogueChange): Promise<void> {
    if (this.skipNextLiveEvent) {
      this.skipNextLiveEvent = false

      return
    }

    for (const watcher of this.watchers)
      if (!watcher.scope || watcher.scope === event.dialogueId) {
        await watcher.receive(event)

        if (this.duplicateNextEvent) {
          await watcher.receive(event)
        }
      }

    this.duplicateNextEvent = false
  }
}
