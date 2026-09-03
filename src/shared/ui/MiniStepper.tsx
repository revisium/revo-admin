import { Box, HStack, Text } from '@chakra-ui/react'
import { toneForStatus } from './statusTone'

interface MiniStepperProps {
  readonly done: number
  readonly total: number
  readonly status: string
}

// Compact per-step progress bar (.ministep): `total` segments, `done` filled
// with the run's status tone, the next segment highlighted while running, and a
// mono done/total label. Token-driven.
export const MiniStepper = ({ done, total, status }: MiniStepperProps) => {
  const tone = toneForStatus(status)
  const segments = Array.from({ length: total }, (_, index) => index)

  return (
    <HStack as="span" display="inline-flex" gap="1" align="center" title={`${done}/${total} steps`}>
      {segments.map((index) => {
        const isDone = index < done
        const isCurrent = index === done && status === 'running'
        const filled = isDone || isCurrent
        const segTone = isCurrent ? 'running' : tone
        return (
          <Box
            key={index}
            w="14px"
            h="5px"
            borderRadius="2px"
            bg={filled ? `dot.${segTone}` : 'bg.subtle'}
            borderWidth={filled ? '0' : '1px'}
            borderColor="border.structural"
          />
        )
      })}
      <Text as="span" className="mono" ml="1" textStyle="caption" color="fg.muted">
        {done}/{total}
      </Text>
    </HStack>
  )
}
