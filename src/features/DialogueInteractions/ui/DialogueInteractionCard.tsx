import { Button, HStack, Stack, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { InteractionViewModel } from '../model/item/InteractionViewModel'
import { DialogueQuestion } from './DialogueQuestion'

interface DialogueInteractionCardProps {
  readonly model: InteractionViewModel
}

export const DialogueInteractionCard = observer(({ model }: DialogueInteractionCardProps) => {
  return (
    <Stack borderWidth="1px" borderColor="border.strong" borderRadius="card" p="3" gap="2">
      <Text textStyle="bodyStrong">{model.title}</Text>
      {model.questions.map((question) => (
        <DialogueQuestion key={question.id} model={question} disabled={!model.canRespond} />
      ))}
      {!model.supported && <Text role="alert">This request type is not supported by this client.</Text>}
      <HStack flexWrap="wrap">
        {model.options.map((option) => (
          <Button key={option.value} size="sm" disabled={!model.canRespond} onClick={() => model.choose(option.value)}>
            {option.label}
          </Button>
        ))}
        {model.isInput && (
          <Button size="sm" disabled={!model.canRespond} onClick={model.submit}>
            Submit answer
          </Button>
        )}
        <Button size="sm" variant="outline" disabled={!model.canRespond} onClick={model.decline}>
          Decline
        </Button>
        {model.canRetry && (
          <Button size="sm" onClick={model.retry}>
            Retry response
          </Button>
        )}
        {model.busy && <Text textStyle="caption">Submitting response…</Text>}
      </HStack>
      {model.error && <Text role="alert">{model.error}</Text>}
    </Stack>
  )
})
