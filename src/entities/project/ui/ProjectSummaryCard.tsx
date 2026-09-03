import { Box, Flex, Text } from '@chakra-ui/react'
import { type ReactNode } from 'react'
import { Card, InlineLink, Skeleton, SkeletonText } from 'src/shared/ui/kit'
import { InlineError } from 'src/shared/ui/components'

type ProjectSummaryContent =
  | { readonly status: 'ready'; readonly value: string; readonly description: ReactNode }
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string; readonly retryLabel: string; readonly onRetry: () => void }

interface ProjectSummaryCardProps {
  readonly title: string
  readonly linkLabel: string
  readonly linkHref: string
  readonly content: ProjectSummaryContent
}

// The card is a <div>, not an anchor: its error state must contain a Retry button, and a
// <button> inside an <a> is invalid.
// The union type is what makes an error without a retry impossible to construct.
export const ProjectSummaryCard = ({ title, linkLabel, linkHref, content }: ProjectSummaryCardProps) => {
  return (
    <Card padding="default">
      {/* The flex column lives on an inner Flex, not on Card: the kit Card accepts only its
          recipe variants, because it owns its own surface. No minHeight either — the exported
          overview sets none, and the design contract says a summary card may grow with content
          rather than be forced to a fixed height. Equal heights across the Overview grid come
          from the grid stretching its items. */}
      <Flex flexDirection="column" gap="3" height="full">
        <Text as="h3" textStyle="componentTitle" color="fg.default">
          {title}
        </Text>

        {content.status === 'ready' && (
          <>
            <Text as="p" textStyle="pageTitle" color="fg.default">
              {content.value}
            </Text>
            <Text textStyle="body" color="fg.secondary">
              {content.description}
            </Text>
          </>
        )}

        {content.status === 'loading' && (
          <>
            <Skeleton shape="title" width="40%" />
            <SkeletonText lines={2} />
          </>
        )}

        {content.status === 'error' && (
          <InlineError
            title={content.message}
            onRetry={content.onRetry}
            retryLabel={content.retryLabel}
            headingLevel="h4"
          />
        )}

        <Box marginTop="auto">
          <InlineLink href={linkHref}>{linkLabel}</InlineLink>
        </Box>
      </Flex>
    </Card>
  )
}

ProjectSummaryCard.displayName = 'ProjectSummaryCard'

export type { ProjectSummaryCardProps, ProjectSummaryContent }
