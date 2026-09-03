import { Box, Flex } from '@chakra-ui/react'
import { Archive } from 'lucide-react'
import { Badge, Button, Card, NavLink } from 'src/shared/ui/kit'
import { Breadcrumb } from 'src/shared/ui/components'
import { ProjectIdentityBlock, ProjectSectionNavigation, ProjectStatusBadge } from 'src/entities/project'
import { PreviewSectionHeading, PreviewSubsectionHeading } from './PreviewHeading'
import { noOp } from './previewHelpers'
import {
  BADGE_DEFAULT_TONE_LABEL,
  BADGE_QUIET_TONE_LABEL,
  BREADCRUMB_CURRENT_LABEL,
  BREADCRUMB_HOME_LABEL,
  PREVIEW_PROJECT_DESCRIPTION,
  PREVIEW_PROJECT_ID,
  PREVIEW_PROJECT_NAME,
  PREVIEW_SECTION_NAV_SECTIONS,
  PROJECT_IDENTITY_COPY_BUTTON_LABEL,
  PROJECT_IDENTITY_COPY_FAILED,
  PROJECT_IDENTITY_COPY_SUCCESS,
  PROJECT_IDENTITY_PRIMARY_ACTION_LABEL,
  PROJECT_STATUS_BADGE_ACTIVE_LABEL,
  PROJECT_STATUS_BADGE_ARCHIVED_LABEL,
} from './sampleContent'

const navigationSectionLabel = 'Navigation components'

const ICON_SIZE = 12

export const NavigationSection = () => {
  return (
    <Box as="section">
      <PreviewSectionHeading>Navigation</PreviewSectionHeading>

      <Flex flexDirection="column" gap="8">
        <Box>
          <PreviewSubsectionHeading>Breadcrumb</PreviewSubsectionHeading>
          <Breadcrumb items={[{ label: BREADCRUMB_HOME_LABEL, href: '/' }, { label: BREADCRUMB_CURRENT_LABEL }]} />
        </Box>

        <Box>
          <PreviewSubsectionHeading>NavLink</PreviewSubsectionHeading>
          <Flex flexDirection="column" gap="3">
            <NavLink href="#nav-example">Navigation link</NavLink>
            <NavLink href="#nav-current" aria-current="page">
              Current page
            </NavLink>
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>ProjectSectionNavigation</PreviewSubsectionHeading>
          <ProjectSectionNavigation
            sections={PREVIEW_SECTION_NAV_SECTIONS}
            currentKey="overview"
            label={navigationSectionLabel}
          />
        </Box>

        <Box>
          <PreviewSubsectionHeading>Badge</PreviewSubsectionHeading>
          {/* The base Badge has no domain vocabulary — only the two surface tones. Anything that
              looks like a status here comes from ProjectStatusBadge below, which owns the Project
              lifecycle mapping. A preview must not invent a third status to fill the row: the
              design contract states no other status label or state mapping is normative in this
              version. */}
          <Flex gap="3" flexWrap="wrap">
            <Badge tone="default" icon={<Box boxSize="6px" borderRadius="pill" bg="currentColor" />}>
              {BADGE_DEFAULT_TONE_LABEL}
            </Badge>
            <Badge tone="quiet" icon={<Archive size={ICON_SIZE} />}>
              {BADGE_QUIET_TONE_LABEL}
            </Badge>
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>ProjectStatusBadge</PreviewSubsectionHeading>
          <Flex gap="3">
            <ProjectStatusBadge status="active" label={PROJECT_STATUS_BADGE_ACTIVE_LABEL} />
            <ProjectStatusBadge status="archived" label={PROJECT_STATUS_BADGE_ARCHIVED_LABEL} />
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>ProjectIdentityBlock</PreviewSubsectionHeading>
          <Card padding="default">
            <ProjectIdentityBlock
              name={PREVIEW_PROJECT_NAME}
              description={PREVIEW_PROJECT_DESCRIPTION}
              breadcrumb={
                <Breadcrumb items={[{ label: BREADCRUMB_HOME_LABEL, href: '/' }, { label: PREVIEW_PROJECT_NAME }]} />
              }
              status={<ProjectStatusBadge status="active" label={PROJECT_STATUS_BADGE_ACTIVE_LABEL} />}
              projectId={PREVIEW_PROJECT_ID}
              copyLabel={PROJECT_IDENTITY_COPY_BUTTON_LABEL}
              copiedMessage={PROJECT_IDENTITY_COPY_SUCCESS}
              copyFailedMessage={PROJECT_IDENTITY_COPY_FAILED}
              primaryAction={
                <Button variant="primary" onClick={noOp}>
                  {PROJECT_IDENTITY_PRIMARY_ACTION_LABEL}
                </Button>
              }
            />
          </Card>
        </Box>
      </Flex>
    </Box>
  )
}

NavigationSection.displayName = 'NavigationSection'
