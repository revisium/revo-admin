import { Box, Flex, HStack, Spinner, Text } from '@chakra-ui/react'
import { ProjectCard, ProjectCardSkeleton, ProjectStatusBadge, ProjectSummaryCard } from 'src/entities/project'
import { InlineError } from 'src/shared/ui/components'
import { Card, Skeleton, SkeletonText } from 'src/shared/ui/kit'
import { PreviewSectionHeading, PreviewSubsectionHeading } from './PreviewHeading'
import { noOp } from './previewHelpers'
import {
  CARD_ARCHIVED_DESCRIPTION,
  CARD_COMPACT_CONTENT,
  CARD_COMPACT_TITLE,
  CARD_DEFAULT_CONTENT,
  CARD_DEFAULT_DESCRIPTION,
  CARD_DEFAULT_TITLE,
  CARD_INTERACTIVE_CONTENT,
  CARD_INTERACTIVE_TITLE,
  CARD_SUMMARY_CONTENT,
  CARD_SUMMARY_TITLE,
  CONTINUATION_ERROR_RETRY_LABEL,
  CONTINUATION_ERROR_TITLE,
  CONTINUATION_PROGRESS_LABEL,
  PREVIEW_PROJECT_ID,
  PREVIEW_PROJECT_NAME,
  PROJECT_CARD_COUNTER_ENTRIES,
  PROJECT_CARD_COUNTER_RUNS,
  PROJECT_CARD_COUNTER_WORKSPACES,
  PROJECT_CARD_ACTIVE_UPDATED,
  PROJECT_CARD_ARCHIVED_UPDATED,
  PROJECT_STATUS_BADGE_ACTIVE_LABEL,
  PROJECT_STATUS_BADGE_ARCHIVED_LABEL,
  PROJECT_SUMMARY_LINK_LABEL_RECORDS,
  PROJECT_SUMMARY_LINK_LABEL_WORKSPACES,
  PROJECT_SUMMARY_READY_TEXT,
  PROJECT_SUMMARY_ERROR_TEXT,
  PROJECT_SUMMARY_TITLE_RECORDS,
  PROJECT_SUMMARY_TITLE_WORKSPACES,
  SUMMARY_LOADING_LINES,
} from './sampleContent'

const previewContinuationRow = {
  paddingBlock: '5',
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'border.structural',
}

const PreviewContinuationProgress = ({ label }: { readonly label: string }) => (
  <Box role="status" {...previewContinuationRow}>
    <HStack gap="2">
      <Spinner size="sm" color="action.primary.bg" />
      <Text textStyle="small" color="fg.secondary">
        {label}
      </Text>
    </HStack>
  </Box>
)

const PreviewContinuationError = ({
  title,
  retryLabel,
  onRetry,
}: {
  readonly title: string
  readonly retryLabel: string
  readonly onRetry: () => void
}) => (
  <Box {...previewContinuationRow}>
    <InlineError title={title} onRetry={onRetry} retryLabel={retryLabel} headingLevel="h3" />
  </Box>
)
export const ContentSection = () => {
  return (
    <Box as="section">
      <PreviewSectionHeading>Content</PreviewSectionHeading>

      <Flex flexDirection="column" gap="8">
        <Box>
          <PreviewSubsectionHeading>Card</PreviewSubsectionHeading>
          <Flex flexDirection="column" gap="4">
            <Card padding="default">
              <Text textStyle="bodyStrong" color="fg.default">
                {CARD_DEFAULT_TITLE}
              </Text>
              <Text marginTop="2" textStyle="body" color="fg.secondary">
                {CARD_DEFAULT_CONTENT}
              </Text>
            </Card>
            <Card padding="compact">
              <Text textStyle="bodyStrong" color="fg.default">
                {CARD_COMPACT_TITLE}
              </Text>
              <Text marginTop="2" textStyle="body" color="fg.secondary">
                {CARD_COMPACT_CONTENT}
              </Text>
            </Card>
            <Card padding="summary">
              <Text textStyle="bodyStrong" color="fg.default">
                {CARD_SUMMARY_TITLE}
              </Text>
              <Text marginTop="2" textStyle="body" color="fg.secondary">
                {CARD_SUMMARY_CONTENT}
              </Text>
            </Card>
            <Card padding="default" interactive>
              <Text textStyle="bodyStrong" color="fg.default">
                {CARD_INTERACTIVE_TITLE}
              </Text>
              <Text marginTop="2" textStyle="body" color="fg.secondary">
                {CARD_INTERACTIVE_CONTENT}
              </Text>
            </Card>
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>Skeleton</PreviewSubsectionHeading>
          <Flex flexDirection="column" gap="4">
            <Box>
              <Text textStyle="small" marginBottom="2" color="fg.secondary">
                Text shape
              </Text>
              <Skeleton shape="text" width="60%" />
            </Box>
            <Box>
              <Text textStyle="small" marginBottom="2" color="fg.secondary">
                Title shape
              </Text>
              <Skeleton shape="title" width="40%" />
            </Box>
            <Box>
              <Text textStyle="small" marginBottom="2" color="fg.secondary">
                Block shape
              </Text>
              <Skeleton shape="block" width="100%" />
            </Box>
            <Box>
              <Text textStyle="small" marginBottom="2" color="fg.secondary">
                SkeletonText (2 lines)
              </Text>
              <SkeletonText lines={SUMMARY_LOADING_LINES} />
            </Box>
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>ProjectCard</PreviewSubsectionHeading>
          <Flex flexDirection="column" gap="0">
            <ProjectCard
              href="#project-active"
              name={PREVIEW_PROJECT_NAME}
              projectId={PREVIEW_PROJECT_ID}
              status={<ProjectStatusBadge status="active" label={PROJECT_STATUS_BADGE_ACTIVE_LABEL} />}
              description={CARD_DEFAULT_DESCRIPTION}
              updatedLabel={PROJECT_CARD_ACTIVE_UPDATED}
              counters={[
                { id: 'runs', label: PROJECT_CARD_COUNTER_RUNS },
                { id: 'entries', label: PROJECT_CARD_COUNTER_ENTRIES },
                { id: 'workspaces', label: PROJECT_CARD_COUNTER_WORKSPACES },
              ]}
              workspaces={
                <Text textStyle="small" color="fg.secondary">
                  production, staging
                </Text>
              }
            />
            <ProjectCard
              href="#project-archived"
              name={PREVIEW_PROJECT_NAME}
              projectId={PREVIEW_PROJECT_ID}
              status={<ProjectStatusBadge status="archived" label={PROJECT_STATUS_BADGE_ARCHIVED_LABEL} />}
              description={CARD_ARCHIVED_DESCRIPTION}
              updatedLabel={PROJECT_CARD_ARCHIVED_UPDATED}
              counters={[
                { id: 'runs', label: PROJECT_CARD_COUNTER_RUNS },
                { id: 'entries', label: PROJECT_CARD_COUNTER_ENTRIES },
              ]}
            />
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>ProjectCardSkeleton</PreviewSubsectionHeading>
          <Flex flexDirection="column" gap="0">
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>ProjectSummaryCard</PreviewSubsectionHeading>
          <Flex gap="4" flexDirection={{ base: 'column', lg: 'row' }} flexWrap="wrap">
            <Box flex={{ base: '1 1 100%', lg: '1 1 calc((100% - 16px) / 3)' }}>
              <ProjectSummaryCard
                title={PROJECT_SUMMARY_TITLE_RECORDS}
                linkLabel={PROJECT_SUMMARY_LINK_LABEL_RECORDS}
                linkHref="#records"
                content={{
                  status: 'ready',
                  value: '42',
                  description: PROJECT_SUMMARY_READY_TEXT,
                }}
              />
            </Box>
            <Box flex={{ base: '1 1 100%', lg: '1 1 calc((100% - 16px) / 3)' }}>
              <ProjectSummaryCard
                title={PROJECT_SUMMARY_TITLE_WORKSPACES}
                linkLabel={PROJECT_SUMMARY_LINK_LABEL_WORKSPACES}
                linkHref="#workspaces"
                content={{
                  status: 'loading',
                }}
              />
            </Box>
            <Box flex={{ base: '1 1 100%', lg: '1 1 calc((100% - 16px) / 3)' }}>
              <ProjectSummaryCard
                title={PROJECT_SUMMARY_TITLE_RECORDS}
                linkLabel={PROJECT_SUMMARY_LINK_LABEL_RECORDS}
                linkHref="#records-error"
                content={{
                  status: 'error',
                  message: PROJECT_SUMMARY_ERROR_TEXT,
                  retryLabel: 'Retry',
                  onRetry: noOp,
                }}
              />
            </Box>
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>ProjectListContinuation</PreviewSubsectionHeading>
          <Flex flexDirection="column" gap="0">
            <Box
              paddingBlock="5"
              borderBottomWidth="1px"
              borderBottomStyle="solid"
              borderBottomColor="border.structural"
            >
              <Text textStyle="caption" color="fg.default">
                Project row
              </Text>
            </Box>
            <PreviewContinuationProgress label={CONTINUATION_PROGRESS_LABEL} />
            <PreviewContinuationError
              title={CONTINUATION_ERROR_TITLE}
              retryLabel={CONTINUATION_ERROR_RETRY_LABEL}
              onRetry={noOp}
            />
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}

ContentSection.displayName = 'ContentSection'
