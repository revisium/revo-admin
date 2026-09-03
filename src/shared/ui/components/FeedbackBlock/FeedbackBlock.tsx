import { Box, Text } from '@chakra-ui/react'
import { type ReactNode } from 'react'

interface FeedbackBlockProps {
  readonly title: string
  readonly headingLevel?: 'h2' | 'h3'
  readonly context?: ReactNode
  readonly description: ReactNode
  readonly action?: ReactNode
}

// headingLevel is a prop rather than hardcoded because feedback blocks nest at different
// depths — inside a page region they are h2, inside a card they are h3. The render semantics
// adjust accordingly.
// There is deliberately no illustration slot. Useful copy is the contract; a decorative
// illustration is explicitly not a substitute for it.
export const FeedbackBlock = ({ title, headingLevel = 'h2', context, description, action }: FeedbackBlockProps) => {
  return (
    <Box paddingBlock="8" borderTopWidth="1px" borderTopStyle="solid" borderTopColor="border.structural">
      <Text
        as={headingLevel}
        color="fg.default"
        marginBottom="2"
        textStyle={headingLevel === 'h2' ? 'sectionTitle' : 'componentTitle'}
      >
        {title}
      </Text>
      {context !== undefined && <Box marginBottom="2">{context}</Box>}
      <Text textStyle="body" color="fg.secondary" maxWidth="60ch" marginBottom="4">
        {description}
      </Text>
      {action}
    </Box>
  )
}

FeedbackBlock.displayName = 'FeedbackBlock'

export type { FeedbackBlockProps }
