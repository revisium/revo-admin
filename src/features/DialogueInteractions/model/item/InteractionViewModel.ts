import { makeAutoObservable } from 'mobx'
import type { DialogueInteractionSession } from 'src/modules/dialogue-engine'
import { ObservableRequest } from 'src/shared/lib'
import { QuestionViewModel } from './QuestionViewModel'

export class InteractionViewModel {
  public readonly questions: readonly QuestionViewModel[]
  private readonly request
  public constructor(private readonly interaction: DialogueInteractionSession) {
    this.questions = interaction.questions.map((question) => new QuestionViewModel(question))
    this.request = ObservableRequest.of((action: () => Promise<void>) => action())
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get id(): string {
    return this.interaction.id
  }

  private get kind() {
    return this.interaction.kind
  }

  public get title() {
    return this.interaction.title || (this.isInput ? 'Input requested' : 'Permission requested')
  }

  public get options() {
    return this.interaction.options.map((option) => ({ value: option.value, label: option.label }))
  }

  public get isInput() {
    return this.kind === 'input'
  }

  public get supported() {
    return this.isInput ? this.questions.every((question) => question.supported) : this.kind === 'permission'
  }

  public get busy() {
    return this.request.isLoading || this.interaction.busy
  }

  public get canRespond() {
    return this.interaction.canRespond && !this.request.isLoading && this.supported
  }

  public get canRetry() {
    return this.interaction.canRetry && !this.request.isLoading
  }

  public get error() {
    return this.request.errorMessage ?? ''
  }

  public choose(optionId: string): void {
    if (this.canRespond) this.request.fetch(() => this.interaction.choose(optionId))
  }

  public decline(): void {
    if (this.canRespond) this.request.fetch(() => this.interaction.decline())
  }

  public submit(): void {
    if (this.canRespond) this.request.fetch(() => this.interaction.submit(this.inputResponse()))
  }

  public retry(): void {
    if (this.canRetry) this.request.fetch(() => this.interaction.retry())
  }

  private inputResponse(): Record<string, unknown> {
    const values: Record<string, unknown> = {}
    this.questions.forEach((question) => {
      const value = question.answer()

      if (value !== undefined) values[question.id] = value
    })

    return values
  }

  public dispose(): void {
    this.request.abort()
  }
}
