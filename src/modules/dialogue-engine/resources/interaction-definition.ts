import type { DialogueOption, DialogueQuestion } from '../contracts/interaction.types'
import { readonlyValue } from './readonly-value'

export const recordOf = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

export const stringOf = (value: unknown): string => (typeof value === 'string' ? value : '')
const numberOf = (value: unknown): number | undefined => (typeof value === 'number' ? value : undefined)

export const dialogueOptions = (value: unknown): readonly DialogueOption[] => {
  if (!Array.isArray(value)) return []

  return readonlyValue(
    value
      .map((entry) => {
        const option = recordOf(entry)

        return { value: stringOf(option.optionId), label: stringOf(option.label) }
      })
      .filter((option) => option.value && option.label),
  )
}

export const dialogueQuestion = (value: unknown): DialogueQuestion => {
  const definition = recordOf(value)

  return Object.freeze({
    id: stringOf(definition.questionId),
    title: stringOf(definition.title),
    input: stringOf(definition.input),
    multiline: definition.multiline === true,
    multiple: definition.selection === 'multiple',
    required: definition.required === true,
    allowOther: definition.allowOther === true,
    integer: definition.integer === true,
    options: dialogueOptions(definition.options),
    minLength: numberOf(definition.minLength),
    maxLength: numberOf(definition.maxLength),
    minimum: numberOf(definition.minimum),
    maximum: numberOf(definition.maximum),
  })
}
