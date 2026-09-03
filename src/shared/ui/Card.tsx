import { Box } from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'

// Warm surface container (.card in the prototype): bg.1 surface, hairline
// border, card radius, sh-1 elevation.
export const Card = (props: BoxProps) => (
  <Box bg="bg.1" borderWidth="1px" borderColor="border" borderRadius="warmCard" boxShadow="sh-1" p="5" {...props} />
)
