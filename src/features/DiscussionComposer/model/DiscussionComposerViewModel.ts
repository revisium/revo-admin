import { makeAutoObservable } from 'mobx'
import { DiscussionStore } from 'src/entities/discussion'
import { container } from 'src/shared/lib'

const SUGGESTIONS = ['Help me create a project', 'Design a new pipeline', 'Prepare a run'] as const

export class DiscussionComposerViewModel {
  private chatId?: string
  private suggestionsVisible = false

  public readonly placeholder = 'Discuss an idea, design a pipeline, or prepare a run…'
  public readonly statusLabel = 'Preview · agent not connected'
  public readonly sendLabel = 'Send'

  public constructor(private readonly discussions: DiscussionStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public setup(chatId?: string, suggestionsVisible = false): void {
    this.chatId = chatId
    this.suggestionsVisible = suggestionsVisible
  }

  public get draft(): string {
    return this.discussions.draft(this.draftKey)
  }

  public get canSubmit(): boolean {
    return this.draft.trim().length > 0
  }

  public get suggestions(): readonly string[] {
    return this.suggestionsVisible ? SUGGESTIONS : []
  }

  public setDraft(value: string): void {
    this.discussions.setDraft(this.draftKey, value)
  }

  public selectSuggestion(suggestion: string): void {
    this.setDraft(suggestion)
  }

  public submit(): string | undefined {
    return this.discussions.send(this.draftKey, this.chatId)
  }

  private get draftKey(): string {
    return this.chatId ?? 'new'
  }
}

container.register(
  DiscussionComposerViewModel,
  () => {
    const discussions = container.get(DiscussionStore)

    return new DiscussionComposerViewModel(discussions)
  },
  { scope: 'transient' },
)
