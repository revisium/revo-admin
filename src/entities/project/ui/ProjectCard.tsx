import { Box, Flex, Span, Text, chakra, type SystemStyleObject } from '@chakra-ui/react'
import { type ReactNode } from 'react'

interface ProjectCardProps {
  readonly href: string
  readonly name: string
  readonly projectId: string
  readonly status: ReactNode
  readonly description?: ReactNode
  readonly updatedLabel: string
  readonly counters: ReadonlyArray<{ readonly id: string; readonly label: string }>
  readonly workspaces?: ReactNode
}

// This is a list row, not a bordered card — the exported list separates rows with hairlines,
// so the kit Card is deliberately not used here.
//
// The whole row is one anchor, so nothing focusable may go into the `description` or `workspaces`
// slots: an interactive element inside an anchor is invalid markup. The types deliberately do not
// express that — narrowing `workspaces` to a data shape would mean inventing the Workspace
// vocabulary, which the design document places out of scope for this version. It is why the
// project id carries no copy action here even though the identity block's does.
//
// Archived rows stay fully readable: no opacity, no dimming, no pointerEvents anywhere.
const rowStyles: SystemStyleObject = {
  display: 'block',
  textDecoration: 'none',
  paddingBlock: 5,
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'border.structural',
  transitionProperty: 'background-color, border-color',
  transitionDuration: 'moderate',
  _hover: {
    // The hover bleed (paddingInline plus negative marginInline) extends the row's fill outward into the
    // gutter without moving any of its content, which is why it does not violate the rule that hover must not
    // move the layout. This technique requires all text inside _hover to have sufficient contrast on
    // bg.subtle — fg.muted cannot be used here, and must be replaced with fg.secondary.
    bg: 'bg.subtle',
    borderBottomColor: 'border.strong',
    paddingInline: { base: '2', lg: '4' },
    marginInline: { base: '-2', lg: '-4' },
  },
}

export const ProjectCard = ({
  href,
  name,
  projectId,
  status,
  description,
  updatedLabel,
  counters,
  workspaces,
}: ProjectCardProps) => {
  return (
    <chakra.a href={href} css={rowStyles}>
      <Flex
        justifyContent="space-between"
        alignItems="flex-start"
        gap={{ base: 2, lg: 4 }}
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        <Box minWidth="0">
          <Text as="span" textStyle="componentTitle" color="fg.default">
            {name}
          </Text>
        </Box>
        {status}
      </Flex>

      {description !== undefined && (
        <Text marginTop="6px" textStyle="body" color="fg.secondary" maxWidth="72ch">
          {description}
        </Text>
      )}

      {workspaces !== undefined && <Box marginTop="3">{workspaces}</Box>}

      <Flex alignItems="center" gap="3" flexWrap="wrap" marginTop="3">
        <Text as="code" textStyle="mono" color="fg.secondary" overflowWrap="anywhere" minWidth="0">
          {projectId}
        </Text>
        <Text as="span" textStyle="caption" color="fg.secondary">
          {updatedLabel}
        </Text>
        {counters.flatMap((counter, index) => {
          const items: ReactNode[] = []
          if (index > 0) {
            items.push(
              <Span key={`${counter.id}-sep`} aria-hidden="true">
                ·
              </Span>,
            )
          }
          items.push(
            <Text key={counter.id} as="span" textStyle="caption" color="fg.secondary">
              {counter.label}
            </Text>,
          )
          return items
        })}
      </Flex>
    </chakra.a>
  )
}

ProjectCard.displayName = 'ProjectCard'

export type { ProjectCardProps }
