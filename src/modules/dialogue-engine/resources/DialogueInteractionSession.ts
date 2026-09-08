import { recordOf, stringOf, dialogueOptions, dialogueQuestion } from './interaction-definition'
import type { DialogueStore } from '../state/DialogueStore'
import type { DialogueCommands } from '../commands/DialogueCommands'
import { readonlyValue } from './readonly-value'

export class DialogueInteractionSession {
  constructor(
    private readonly dialogueId: string,
    public readonly id: string,
    private readonly store: DialogueStore,
    private readonly commands: DialogueCommands,
  ) {
    Object.freeze(this)
  }

  private get item() {
    return this.store.dialogues.get(this.dialogueId)?.interactions.find((item) => item.id === this.id)
  }

  private get definition() {
    return recordOf(this.item?.request)
  }

  public get kind() {
    return stringOf(this.definition.kind)
  }

  public get title() {
    return stringOf(this.definition.message) || stringOf(recordOf(this.definition.action).title) || ''
  }

  public get questions() {
    return readonlyValue(
      Array.isArray(this.definition.questions) ? this.definition.questions.map(dialogueQuestion) : [],
    )
  }

  public get options() {
    return dialogueOptions(this.definition.options)
  }

  public get supported() {
    return this.kind === 'permission' || this.kind === 'input'
  }

  public get active() {
    return this.item?.status === 'PENDING' || this.item?.status === 'RESPONDING'
  }

  public get busy() {
    return this.commands.isResponding(this.id) || this.item?.status === 'RESPONDING'
  }

  public get canRetry() {
    return !this.commands.isResponding(this.id) && this.commands.pendingResponse(this.id) !== undefined
  }

  public get canRespond() {
    return this.item?.status === 'PENDING' && this.supported && !this.busy && !this.canRetry
  }

  public choose(optionId: string): Promise<void> {
    if (this.kind !== 'permission') return Promise.reject(new Error('This is not a permission request.'))

    if (!this.options.some((option) => option.value === optionId))
      return Promise.reject(new Error('Unknown permission option.'))

    return this.answer({ kind: 'permission', outcome: 'selected', optionId })
  }

  public submit(values: Record<string, unknown>): Promise<void> {
    if (this.kind !== 'input') return Promise.reject(new Error('This is not an input request.'))

    return this.answer({ kind: 'input', outcome: 'submitted', values })
  }

  public decline(): Promise<void> {
    return this.answer({ kind: this.kind, outcome: this.kind === 'input' ? 'declined' : 'denied' })
  }

  public retry(): Promise<void> {
    if (!this.canRetry) return Promise.reject(new Error('No response is available to retry.'))

    return this.commands.respond(this.dialogueId, this.id, this.commands.pendingResponse(this.id))
  }

  private answer(response: unknown): Promise<void> {
    if (!this.canRespond) return Promise.reject(new Error('This interaction cannot accept a response.'))

    return this.commands.respond(this.dialogueId, this.id, response)
  }
}
