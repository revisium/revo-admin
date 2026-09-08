import { Box } from '@chakra-ui/react'
import { useHydrated } from 'src/shared/lib'
import { DialogueTimelineClient } from './DialogueTimeline.client'

interface DialogueTimelineProps {
  readonly id: string
}

export const DialogueTimeline = ({ id }: DialogueTimelineProps) => {
  const hydrated = useHydrated()
  return hydrated ? <DialogueTimelineClient key={id} id={id} /> : <Box h="full" />
}
