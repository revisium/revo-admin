import { Box, Text } from '@chakra-ui/react'
import { type ReactNode } from 'react'
import { Button } from 'src/shared/ui/kit'

interface InlineErrorProps {
  readonly title: string
  readonly description?: ReactNode
  readonly onRetry: () => void
  readonly retryLabel: string
  readonly retrying?: boolean
  readonly headingLevel?: 'h3' | 'h4'
}

// onRetry and retryLabel are required, not optional and not a slot. A local error must
// carry a path to recovery, and the type system should enforce that rather than trusting
// the caller.
// border.control rather than border.structural is deliberate — this box holds an interactive
// control, and boundary strength is how severity is expressed. There is no red and no
// colour-coded severity anywhere in this design system.
// role="status", never role="alert" — an inline card or continuation failure does not prevent
// the current task, and assertive announcement is reserved for errors that do.
export const InlineError = ({
  title,
  description,
  onRetry,
  retryLabel,
  retrying = false,
  headingLevel = 'h3',
}: InlineErrorProps) => {
  return (
    <Box
      role="status"
      padding="4"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="border.control"
      borderRadius="card"
      bg="bg.surface"
    >
      <Text as={headingLevel} textStyle="componentTitle" color="fg.default">
        {title}
      </Text>
      {description && (
        <Text marginTop="1" textStyle="body" color="fg.secondary">
          {description}
        </Text>
      )}
      <Box marginTop="3">
        <Button variant="secondary" busy={retrying} onClick={onRetry}>
          {retryLabel}
        </Button>
      </Box>
    </Box>
  )
}

InlineError.displayName = 'InlineError'

export type { InlineErrorProps }
