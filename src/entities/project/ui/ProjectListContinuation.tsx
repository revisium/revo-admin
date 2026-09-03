import { Box, Text } from '@chakra-ui/react'
import { InlineError } from 'src/shared/ui/components'

const rowGeometry = {
  paddingBlock: '5',
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'border.structural',
}

interface ProjectListContinuationProgressProps {
  readonly label: string
}

// An initial-load error replaces the whole collection region, while a continuation error
// appends to it and keeps every loaded row usable. These two must also stay visually
// distinguishable from the true-empty and no-results states, because their recovery differs.

// ProjectListContinuationProgress deliberately contains nothing focusable, so appending it
// during automatic loading cannot steal focus. Its Retry counterpart puts recovery at the
// failed boundary rather than at the top of the page.

export const ProjectListContinuationProgress = ({ label }: ProjectListContinuationProgressProps) => {
  return (
    <Box role="status" {...rowGeometry}>
      <Text textStyle="small" color="fg.secondary">
        {label}
      </Text>
    </Box>
  )
}

ProjectListContinuationProgress.displayName = 'ProjectListContinuationProgress'

interface ProjectListContinuationErrorProps {
  readonly title: string
  readonly retryLabel: string
  readonly onRetry: () => void
}

export const ProjectListContinuationError = ({ title, retryLabel, onRetry }: ProjectListContinuationErrorProps) => {
  return (
    <Box {...rowGeometry}>
      <InlineError title={title} onRetry={onRetry} retryLabel={retryLabel} headingLevel="h3" />
    </Box>
  )
}

ProjectListContinuationError.displayName = 'ProjectListContinuationError'

export type { ProjectListContinuationProgressProps, ProjectListContinuationErrorProps }
