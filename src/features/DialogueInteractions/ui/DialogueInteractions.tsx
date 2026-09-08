import { Stack } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { useViewModel } from 'src/shared/lib'
import { DialogueInteractionsViewModel } from '../model/list/DialogueInteractionsViewModel'
import { DialogueInteractionCard } from './DialogueInteractionCard'

interface DialogueInteractionsProps {
  readonly dialogueId: string
}

export const DialogueInteractions = observer(({ dialogueId }: DialogueInteractionsProps) => {
  const model = useViewModel(DialogueInteractionsViewModel, dialogueId)
  return (
    <Stack maxH="40dvh" overflowY="auto" flexShrink="0">
      {model.items.map((item) => (
        <DialogueInteractionCard key={item.id} model={item} />
      ))}
    </Stack>
  )
})
