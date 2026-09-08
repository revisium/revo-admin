import { AgentSelectionViewModel } from './agent/AgentSelectionViewModel'
import { makeAutoObservable, runInAction } from 'mobx'
import { DialogueEngine, type AgentSelectionModel } from 'src/modules/dialogue-engine'
import { routes } from 'src/shared/config'
import { container, ObservableRequest } from 'src/shared/lib'
import { DialoguePresentationStore } from 'src/entities/dialogue'

const SUGGESTIONS = ['Help me create a project', 'Design a new pipeline', 'Prepare a run'] as const
const TITLE_LENGTH = 64

export class DiscussionComposerViewModel {
  private chatId?: string
  private suggestionsVisible = false
  private newDraft = ''
  private generation = 0
  private readonly sessionDraft
  private readonly agentSelection: AgentSelectionModel
  private readonly submitRequest
  private navigate: (destination: string) => void = () => {}
  public readonly agent: AgentSelectionViewModel

  public constructor(
    private readonly engine: DialogueEngine,
    private readonly presentation: DialoguePresentationStore,
  ) {
    this.agentSelection = this.engine.createAgentSelection()
    this.sessionDraft = this.engine.createDraft()
    this.submitRequest = ObservableRequest.of(() => this.deliver())
    this.agent = new AgentSelectionViewModel(this.agentSelection, () => this.sending)
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public setup(chatId?: string, suggestionsVisible = false, navigate: (destination: string) => void = () => {}): void {
    this.chatId = chatId
    this.suggestionsVisible = suggestionsVisible
    this.navigate = navigate
  }

  public mount(chatId?: string, suggestionsVisible = false, navigate: (destination: string) => void = () => {}): void {
    this.setup(chatId, suggestionsVisible, navigate)
    this.generation += 1

    if (!chatId) this.agentSelection.load()
  }

  public unmount(): void {
    this.generation += 1
    this.agentSelection.dispose()
    this.submitRequest.abort()
  }

  private get chat() {
    return this.chatId ? this.engine.get(this.chatId) : undefined
  }

  public get draft() {
    return this.chatId ? this.presentation.get(this.chatId).draft || this.chat?.pendingText || '' : this.newDraft
  }

  public get showConfiguration() {
    return !this.chatId && !this.sessionDraft.dialogueId
  }

  public get sending() {
    return this.submitRequest.isLoading
  }

  public get retrying() {
    return this.chat?.canRetry ?? this.sessionDraft.canRetry
  }

  public get canSubmit() {
    if (!this.chatId && this.sessionDraft.state === 'creationUncertain') return false

    const ready = this.chatId
      ? this.chat?.canSend || this.retrying
      : this.agentSelection.ready || this.sessionDraft.dialogueId

    return Boolean(ready && (this.draft.trim() || this.retrying) && !this.sending)
  }

  public get suggestions() {
    return this.suggestionsVisible ? SUGGESTIONS : []
  }

  public get error() {
    return this.submitRequest.errorMessage ?? ''
  }

  public get inputDisabled(): boolean {
    return this.sending || this.retrying
  }

  public get sendLabel() {
    return this.retrying ? 'Retry message' : 'Send'
  }

  public get statusLabel() {
    if (this.sending) return 'Sending…'

    if (this.chat?.pendingCount) return 'Waiting for your response'

    if (this.chat?.busy) return this.chat.progress || 'Working…'

    return ''
  }

  public get placeholder() {
    return 'Discuss an idea, design a pipeline, or prepare a run…'
  }

  public setDraft(value: string): void {
    if (this.chatId) this.presentation.get(this.chatId).draft = value
    else this.newDraft = value
  }

  public selectSuggestion(value: string): void {
    this.setDraft(value)
  }

  public async submit(): Promise<void> {
    if (!this.canSubmit) {
      return
    }

    const generation = this.generation
    const creating = !this.chatId
    const result = await this.submitRequest.fetch()

    if (!result.isRight || generation !== this.generation) {
      return
    }

    if (creating) this.navigate(routes.chat(result.data))
  }

  private clearSentDraft(id: string, prompt: string): void {
    const state = this.presentation.get(id)

    if (state.draft === prompt) state.draft = ''
  }

  private deliver(): Promise<string> {
    if (this.chatId) return this.sendExisting(this.chatId)

    if (this.sessionDraft.canRetry) return this.sessionDraft.retry()

    return this.sendNew()
  }

  private async sendExisting(id: string): Promise<string> {
    const chat = this.engine.get(id)
    const prompt = this.draft
    this.presentation.get(id).followOutput = true

    if (chat.canRetry) await chat.retrySend()
    else await chat.send(prompt)

    this.clearSentDraft(id, prompt)

    return id
  }

  private async sendNew(): Promise<string> {
    const id = await this.sessionDraft.send(this.creationInput(), this.draft)
    runInAction(() => {
      this.newDraft = ''
    })

    return id
  }

  private creationInput() {
    const agent = this.agentSelection.selectedAgent

    if (!agent) throw new Error('Choose an agent first.')

    return {
      title: this.draft.slice(0, TITLE_LENGTH),
      agentId: agent.id,
      agentVersion: agent.version,
      agentConfiguration: this.agentSelection.configuration,
    }
  }
}

container.register(
  DiscussionComposerViewModel,
  () => {
    const engine = container.get(DialogueEngine)
    const presentation = container.get(DialoguePresentationStore)

    return new DiscussionComposerViewModel(engine, presentation)
  },
  { scope: 'transient' },
)
