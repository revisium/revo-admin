import { Box, Flex, Text } from '@chakra-ui/react'
import { Button, ConfirmDialog, SectionDivider } from 'src/shared/ui/kit'
import { EmptyState, InlineError, InlineNotice, NoResultsState } from 'src/shared/ui/components'
import { ProjectSearchToolbar } from 'src/features/ProjectSearchToolbar'
import { PreviewSectionHeading, PreviewSubsectionHeading } from './PreviewHeading'
import { noOp } from './previewHelpers'
import {
  CONFIRM_DIALOG_CANCEL_LABEL,
  CONFIRM_DIALOG_CONFIRM_LABEL,
  CONFIRM_DIALOG_BLOCKER_TEXT,
  CONFIRM_DIALOG_DESCRIPTION,
  CONFIRM_DIALOG_TITLE,
  CONFIRM_DIALOG_TRIGGER_LABEL,
  EMPTY_STATE_ACTION_LABEL,
  EMPTY_STATE_DESCRIPTION,
  EMPTY_STATE_TITLE,
  INLINE_ERROR_DESCRIPTION,
  INLINE_ERROR_RETRY_LABEL,
  INLINE_ERROR_TITLE,
  INLINE_NOTICE_ACTION_LABEL,
  INLINE_NOTICE_CHILDREN,
  NO_RESULTS_CLEAR_SEARCH_LABEL,
  NO_RESULTS_DESCRIPTION,
  NO_RESULTS_FILTER_SUMMARY,
  NO_RESULTS_QUERY,
  NO_RESULTS_TITLE,
  SEARCH_TOOLBAR_INCLUDE_ARCHIVED_LABEL,
  SEARCH_TOOLBAR_PLACEHOLDER,
} from './sampleContent'

interface FeedbackSectionProps {
  readonly confirmOpen: boolean
  readonly confirming: boolean
  readonly onOpenConfirm: () => void
  readonly onCloseConfirm: () => void
  readonly onConfirm: () => void
  readonly searchQuery: string
  readonly onSearchQueryChange: (value: string) => void
  readonly includeArchived: boolean
  readonly onIncludeArchivedChange: (value: boolean) => void
}

export const FeedbackSection = ({
  confirmOpen,
  confirming,
  onOpenConfirm,
  onCloseConfirm,
  onConfirm,
  searchQuery,
  onSearchQueryChange,
  includeArchived,
  onIncludeArchivedChange,
}: FeedbackSectionProps) => {
  return (
    <Box as="section">
      <PreviewSectionHeading>Feedback</PreviewSectionHeading>

      <Flex flexDirection="column" gap="8">
        <Box>
          <PreviewSubsectionHeading>InlineNotice</PreviewSubsectionHeading>
          <Flex flexDirection="column" gap="4">
            <InlineNotice>{INLINE_NOTICE_CHILDREN}</InlineNotice>
            <InlineNotice action={<Button variant="quiet">{INLINE_NOTICE_ACTION_LABEL}</Button>}>
              {INLINE_NOTICE_CHILDREN}
            </InlineNotice>
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>EmptyState</PreviewSubsectionHeading>
          <EmptyState
            title={EMPTY_STATE_TITLE}
            description={EMPTY_STATE_DESCRIPTION}
            action={<Button variant="primary">{EMPTY_STATE_ACTION_LABEL}</Button>}
          />
        </Box>

        <Box>
          <PreviewSubsectionHeading>NoResultsState</PreviewSubsectionHeading>
          <NoResultsState
            title={NO_RESULTS_TITLE}
            query={NO_RESULTS_QUERY}
            filterSummary={NO_RESULTS_FILTER_SUMMARY}
            description={NO_RESULTS_DESCRIPTION}
            onClearSearch={noOp}
            clearSearchLabel={NO_RESULTS_CLEAR_SEARCH_LABEL}
          />
        </Box>

        <Box>
          <PreviewSubsectionHeading>InlineError</PreviewSubsectionHeading>
          <Flex flexDirection="column" gap="4">
            <InlineError
              title={INLINE_ERROR_TITLE}
              description={INLINE_ERROR_DESCRIPTION}
              onRetry={noOp}
              retryLabel={INLINE_ERROR_RETRY_LABEL}
            />
            <InlineError
              title={INLINE_ERROR_TITLE}
              description={INLINE_ERROR_DESCRIPTION}
              onRetry={noOp}
              retryLabel={INLINE_ERROR_RETRY_LABEL}
              retrying={true}
            />
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>ConfirmDialog</PreviewSubsectionHeading>
          <Flex gap="3">
            <Button variant="primary" onClick={onOpenConfirm}>
              {CONFIRM_DIALOG_TRIGGER_LABEL}
            </Button>
          </Flex>
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={(open) => {
              if (!open) {
                onCloseConfirm()
              }
            }}
            title={CONFIRM_DIALOG_TITLE}
            blockers={<InlineNotice>{CONFIRM_DIALOG_BLOCKER_TEXT}</InlineNotice>}
            cancelAction={<Button variant="secondary">{CONFIRM_DIALOG_CANCEL_LABEL}</Button>}
            confirmAction={
              <Button variant="primary" busy={confirming} onClick={onConfirm}>
                {CONFIRM_DIALOG_CONFIRM_LABEL}
              </Button>
            }
            confirming={confirming}
            dismissLockedWhileConfirming
          >
            <Text textStyle="body" color="fg.secondary">
              {CONFIRM_DIALOG_DESCRIPTION}
            </Text>
          </ConfirmDialog>
        </Box>

        <SectionDivider />

        <Box>
          <PreviewSubsectionHeading>ProjectSearchToolbar</PreviewSubsectionHeading>
          <ProjectSearchToolbar
            query={searchQuery}
            onQueryChange={onSearchQueryChange}
            searchLabel="Search"
            searchPlaceholder={SEARCH_TOOLBAR_PLACEHOLDER}
            includeArchived={includeArchived}
            onIncludeArchivedChange={onIncludeArchivedChange}
            includeArchivedLabel={SEARCH_TOOLBAR_INCLUDE_ARCHIVED_LABEL}
          />
        </Box>
      </Flex>
    </Box>
  )
}

FeedbackSection.displayName = 'FeedbackSection'
