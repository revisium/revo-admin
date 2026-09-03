import { Box, HStack, Text } from '@chakra-ui/react'

type Priority = 'low' | 'normal' | 'high'

// Priority bar + label (.prio). Tone: high=failed, normal=neutral, low=muted.
const TONE: Record<Priority, string> = { high: 'failed', normal: 'neutral', low: 'muted' }

export const PriorityTag = ({ priority }: { readonly priority: Priority }) => (
  <HStack as="span" display="inline-flex" gap="2" align="center">
    <Box w="4px" h="14px" borderRadius="2px" flexShrink="0" bg={`dot.${TONE[priority]}`} />
    <Text textStyle="small" color="fg.secondary" textTransform="capitalize">
      {priority}
    </Text>
  </HStack>
)
