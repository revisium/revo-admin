import { Box, Center, HStack, Spinner, Text } from '@chakra-ui/react'
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

const ProgressIndicator = ({ label }: ProjectListContinuationProgressProps) => (
  <HStack gap="2">
    <Spinner size="sm" color="action.primary.bg" />
    <Text textStyle="small" color="fg.secondary">
      {label}
    </Text>
  </HStack>
)

export const ProjectListInitialProgress = ({ label }: ProjectListContinuationProgressProps) => (
  <Center role="status" minHeight="12rem">
    <ProgressIndicator label={label} />
  </Center>
)

ProjectListInitialProgress.displayName = 'ProjectListInitialProgress'

export const ProjectListContinuationProgress = ({ label }: ProjectListContinuationProgressProps) => {
  return (
    <Box role="status" {...rowGeometry}>
      <ProgressIndicator label={label} />
    </Box>
  )
}

ProjectListContinuationProgress.displayName = 'ProjectListContinuationProgress'

interface ProjectListContinuationErrorProps {
  readonly title: string
  readonly description?: string | null
  readonly retryLabel: string
  readonly onRetry: () => void
}

export const ProjectListContinuationError = ({
  title,
  description,
  retryLabel,
  onRetry,
}: ProjectListContinuationErrorProps) => {
  return (
    <Box {...rowGeometry}>
      <InlineError
        title={title}
        description={description}
        onRetry={onRetry}
        retryLabel={retryLabel}
        headingLevel="h3"
      />
    </Box>
  )
}

ProjectListContinuationError.displayName = 'ProjectListContinuationError'

export type { ProjectListContinuationProgressProps, ProjectListContinuationErrorProps }
