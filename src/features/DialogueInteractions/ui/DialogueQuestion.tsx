import { Box, Input, NativeSelect, Text, Textarea } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import type { QuestionViewModel } from '../model/item/QuestionViewModel'

interface DialogueQuestionProps {
  readonly model: QuestionViewModel
  readonly disabled: boolean
}

export const DialogueQuestion = observer(({ model, disabled }: DialogueQuestionProps) => (
  <Box>
    <Text textStyle="small">{model.title}</Text>
    {model.isChoice && (
      <NativeSelect.Root disabled={disabled}>
        <NativeSelect.Field
          aria-label={model.title}
          multiple={model.multiple}
          value={model.choiceValue}
          onChange={(event) => {
            model.selectAnswers(Array.from(event.target.selectedOptions, (option) => option.value))
          }}
        >
          {!model.multiple && <option value="">Choose…</option>}
          {model.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    )}
    {!model.isChoice && model.multiline && (
      <Textarea
        aria-label={model.title}
        value={model.value}
        disabled={disabled}
        onChange={(event) => model.setValue(event.target.value)}
      />
    )}
    {!model.isChoice && !model.multiline && (
      <Input
        aria-label={model.title}
        type={model.inputType}
        value={model.value}
        disabled={disabled}
        onChange={(event) => model.setValue(event.target.value)}
      />
    )}
    {model.allowOther && (
      <Input
        aria-label={model.otherLabel}
        placeholder="Other answer"
        value={model.other}
        disabled={disabled}
        onChange={(event) => model.setOther(event.target.value)}
      />
    )}
  </Box>
))
