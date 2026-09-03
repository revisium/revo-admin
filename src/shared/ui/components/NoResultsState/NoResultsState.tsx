import { Flex, Span, Text } from '@chakra-ui/react'
import { type ReactNode } from 'react'
import { Button } from 'src/shared/ui/kit'
import { FeedbackBlock } from '../FeedbackBlock/FeedbackBlock'

type NoResultsContext =
  | { readonly query: string; readonly filterSummary?: ReactNode }
  | { readonly query?: string; readonly filterSummary: ReactNode }

type NoResultsStateProps = {
  readonly title: string
  readonly description: ReactNode
  readonly onClearSearch: () => void
  readonly clearSearchLabel: string
  readonly action?: ReactNode
  readonly headingLevel?: 'h2' | 'h3'
} & NoResultsContext

// Shown when a search or filter matched nothing. The recovery path is clear: users see
// the applied query and filters (at least one is required), then clear the search to try again.
// The description explains why nothing matched. An optional action provides additional recovery.
export const NoResultsState = ({
  title,
  query,
  filterSummary,
  description,
  onClearSearch,
  clearSearchLabel,
  action,
  headingLevel,
}: NoResultsStateProps) => {
  const context = (
    <Flex gap="2" alignItems="baseline" flexWrap="wrap">
      {query !== undefined && (
        <Text textStyle="bodyStrong" color="fg.default">
          {query}
        </Text>
      )}
      {filterSummary !== undefined && (
        <Span textStyle="small" color="fg.secondary">
          {filterSummary}
        </Span>
      )}
    </Flex>
  )

  const actionNode = (
    <>
      <Button variant="secondary" onClick={onClearSearch}>
        {clearSearchLabel}
      </Button>
      {action}
    </>
  )

  return (
    <FeedbackBlock
      title={title}
      description={description}
      context={context}
      action={actionNode}
      headingLevel={headingLevel}
    />
  )
}

NoResultsState.displayName = 'NoResultsState'

export type { NoResultsStateProps }
