import { Box, Text } from '@chakra-ui/react'
import { type ReactNode } from 'react'

interface InlineNoticeProps {
  readonly children: ReactNode
  readonly action?: ReactNode
}

// Carries ambient context, not a status change — no heading or role attribute.
// The design deliberately omits role="status" or role="alert" because nothing
// here triggers a state transition. Border uses border.control (not structural)
// to mark this block as attention-worthy through visual boundary strength alone.
export const InlineNotice = ({ children, action }: InlineNoticeProps) => {
  return (
    <Box
      paddingBlock="3"
      paddingInline="14px"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="border.control"
      borderRadius="card"
      bg="bg.surface"
    >
      <Text textStyle="body" color="fg.secondary">
        {children}
      </Text>
      {action && <Box marginTop="3">{action}</Box>}
    </Box>
  )
}

InlineNotice.displayName = 'InlineNotice'

export type { InlineNoticeProps }
