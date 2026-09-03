import { Box, HStack } from '@chakra-ui/react'
import { labelForStatus, type StatusTone, toneForStatus } from './statusTone'

interface StatusBadgeProps {
  readonly status: string
  readonly tone?: StatusTone
  readonly dot?: boolean
  readonly size?: 'sm' | 'md'
}

// Token-driven status chip (.chip in the prototype): tinted fg/bg/border from
// `status.*`, a leading solid tone dot from `dot.*`, chip radius, capitalized.
export const StatusBadge = ({ status, tone, dot = true, size = 'md' }: StatusBadgeProps) => {
  const resolved = tone ?? toneForStatus(status)
  const sm = size === 'sm'

  return (
    <HStack
      as="span"
      display="inline-flex"
      gap="1.5"
      h={sm ? '5' : '6'}
      px={sm ? '2' : '2.5'}
      borderRadius="chip"
      borderWidth="1px"
      textStyle="caption"
      textTransform="capitalize"
      whiteSpace="nowrap"
      color={`status.${resolved}.fg`}
      bg={`status.${resolved}.bg`}
      borderColor={`status.${resolved}.border`}
    >
      {dot ? <Box w="1.5" h="1.5" borderRadius="full" flexShrink="0" bg={`dot.${resolved}`} /> : null}
      {labelForStatus(status)}
    </HStack>
  )
}
