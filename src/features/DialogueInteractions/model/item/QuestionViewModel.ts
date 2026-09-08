import { makeAutoObservable } from 'mobx'
import type { DialogueQuestion } from 'src/modules/dialogue-engine'

const SUPPORTED_INPUTS = new Set(['text', 'number', 'boolean', 'select'])

export class QuestionViewModel {
  public value = ''
  public selected: string[] = []
  public other = ''

  public constructor(private readonly definition: DialogueQuestion) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get id() {
    return this.definition.id
  }

  public get title() {
    return this.definition.title
  }

  public get input() {
    return this.definition.input
  }

  public get supported() {
    return SUPPORTED_INPUTS.has(this.input) && Boolean(this.id)
  }

  public get multiline() {
    return this.definition.multiline === true
  }

  public get multiple() {
    return this.definition.multiple
  }

  public get required() {
    return this.definition.required === true
  }

  public get allowOther() {
    return this.definition.allowOther === true
  }

  public get isChoice() {
    return this.input === 'boolean' || this.input === 'select'
  }

  public get options() {
    if (this.input === 'boolean')
      return [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ]

    return this.definition.options.map((option) => ({ value: option.value, label: option.label }))
  }

  public get inputType() {
    return this.input === 'number' ? 'number' : 'text'
  }

  public get choiceValue(): string | string[] {
    return this.multiple ? this.selected : this.value
  }

  public get otherLabel(): string {
    return `${this.title} other answer`
  }

  public selectAnswers(values: string[]): void {
    this.selected = values
    this.value = values[0] ?? ''
  }

  public setValue(value: string): void {
    this.value = value
  }

  public setSelected(values: string[]): void {
    this.selected = values
  }

  public setOther(value: string): void {
    this.other = value
  }

  public answer(): unknown {
    if (!this.supported) throw new Error(`Unsupported question: ${this.title}`)

    return this.multiple ? this.multipleAnswer() : this.singleAnswer()
  }

  private singleAnswer(): unknown {
    const value = this.allowOther && this.other ? this.other : this.value
    this.validateRequired(Boolean(value))

    if (!value) return undefined

    if (this.input === 'boolean') return value === 'true'

    if (this.input === 'number') return this.numberAnswer(value)

    return this.textAnswer(value)
  }

  private validateRequired(present: boolean): void {
    if (!present && this.required) throw new Error(`${this.title} is required.`)
  }

  private textAnswer(value: string): string {
    const min = this.definition.minLength
    const max = this.definition.maxLength

    if (typeof min === 'number' && value.length < min) throw new Error(`${this.title} is too short.`)

    if (typeof max === 'number' && value.length > max) throw new Error(`${this.title} is too long.`)

    return value
  }

  private multipleAnswer(): string[] | undefined {
    const values = this.other && this.allowOther ? [...this.selected, this.other] : this.selected
    this.validateRequired(values.length > 0)

    return values.length ? values : undefined
  }

  private numberAnswer(value: string): number {
    const number = Number(value)
    const min = this.definition.minimum
    const max = this.definition.maximum
    const valid =
      Number.isFinite(number) &&
      (this.definition.integer !== true || Number.isInteger(number)) &&
      (typeof min !== 'number' || number >= min) &&
      (typeof max !== 'number' || number <= max)

    if (!valid) throw new Error(`${this.title} must be a valid number within the requested range.`)

    return number
  }
}
