import { Box, Stack } from '@chakra-ui/react'
import { Link } from 'react-router'
import { routes } from 'src/shared/config'
import { InlineLink } from 'src/shared/ui/kit'
import { type Project } from '../model/types'
import { ProjectIdentityBlock } from './ProjectIdentityBlock'
import { ProjectSectionNavigation } from './ProjectSectionNavigation'
import { ProjectStatusBadge } from './ProjectStatusBadge'

type ProjectSection = 'overview' | 'settings'

interface ProjectPageHeaderProps {
  readonly project: Project
  readonly currentSection: ProjectSection
  readonly headingId: string
}

export const ProjectPageHeader = ({ project, currentSection, headingId }: ProjectPageHeaderProps) => (
  <Stack as="section" aria-label="Project header" gap="8">
    <InlineLink as={Link} to={routes.projects()}>
      Back to projects
    </InlineLink>
    <ProjectIdentityBlock
      name={project.name}
      description={project.description || undefined}
      status={
        <Box id="project-page-status">
          <ProjectStatusBadge status={project.status} label={project.status === 'active' ? 'Active' : 'Archived'} />
        </Box>
      }
      projectId={project.id}
      copyLabel="Copy ID"
      copiedMessage="Copied to clipboard"
      copyFailedMessage="Could not copy the project id"
      headingId={headingId}
    />
    <ProjectSectionNavigation
      sections={[
        { key: 'overview', label: 'Overview', href: routes.project(project.id) },
        {
          key: 'settings',
          label: 'Settings',
          href: routes.projectSettings(project.id),
        },
      ]}
      currentKey={currentSection}
    />
  </Stack>
)

ProjectPageHeader.displayName = 'ProjectPageHeader'

export type { ProjectPageHeaderProps, ProjectSection }
