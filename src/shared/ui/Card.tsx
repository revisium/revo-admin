import { Box } from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'

// Surface container (.card in the prototype): plain surface, hairline border, card radius.
export const Card = (props: BoxProps) => (
  <Box
    bg="bg.surface"
    borderWidth="1px"
    borderColor="border.structural"
    borderRadius="card"
    boxShadow="popover"
    p="5"
    {...props}
  />
)
