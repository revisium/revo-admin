import { Box, Link as ChakraLink, Stack, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ProjectIdentityBlock, ProjectStatusBadge } from 'src/entities/project'
import { routes } from 'src/shared/config'
import { useViewModel } from 'src/shared/lib'
import { Button } from 'src/shared/ui/kit'
import { ProjectOverviewViewModel } from '../model/ProjectOverviewViewModel'

interface ProjectOverviewPageProps {
  readonly projectId: string
}

const BackToProjects = () => (
  <ChakraLink asChild color="fg.default" textStyle="bodyStrong">
    <Link to={routes.projects()}>Back to projects</Link>
  </ChakraLink>
)

const UnavailableProject = () => (
  <Stack gap="4">
    <Text as="h2" textStyle="sectionTitle" color="fg.default">
      Project unavailable
    </Text>
    <Text textStyle="body" color="fg.secondary">
      This project is unavailable.
    </Text>
    <BackToProjects />
  </Stack>
)

const FailedProject = ({ viewModel }: { readonly viewModel: ProjectOverviewViewModel }) => (
  <Stack gap="4" role="status" aria-live="polite">
    <Text as="h2" textStyle="sectionTitle" color="fg.default">
      Project could not be loaded
    </Text>
    <Text textStyle="body" color="fg.secondary">
      {viewModel.state.kind === 'error' ? viewModel.state.message : undefined}
    </Text>
    <Stack gap="3" alignItems="flex-start">
      <Button variant="secondary" onClick={viewModel.retry}>
        Retry
      </Button>
      <BackToProjects />
    </Stack>
  </Stack>
)

export const ProjectOverviewPage = observer(({ projectId }: ProjectOverviewPageProps) => {
  const viewModel = useViewModel(ProjectOverviewViewModel, projectId)
  const hasFocusedReadyPageRef = useRef(false)

  useEffect(() => {
    if (viewModel.state.kind !== 'ready' || hasFocusedReadyPageRef.current) return
    document.getElementById('project-overview-heading')?.focus()
    hasFocusedReadyPageRef.current = true
  }, [viewModel.state])

  if (viewModel.state.kind === 'idle' || viewModel.state.kind === 'loading') {
    return (
      <Stack gap="6">
        <Box role="status" aria-live="polite">
          <Text textStyle="body" color="fg.secondary">
            Loading project…
          </Text>
        </Box>
        <BackToProjects />
      </Stack>
    )
  }

  if (viewModel.state.kind === 'unavailable') return <UnavailableProject />
  if (viewModel.state.kind === 'error') return <FailedProject viewModel={viewModel} />

  const { project } = viewModel.state
  return (
    <Stack gap="8">
      <ProjectIdentityBlock
        name={project.name}
        description={project.description || undefined}
        status={
          <ProjectStatusBadge status={project.status} label={project.status === 'active' ? 'Active' : 'Archived'} />
        }
        projectId={project.id}
        copyLabel="Copy ID"
        copiedMessage="Copied to clipboard"
        copyFailedMessage="Could not copy the project id"
        headingId="project-overview-heading"
      />
      <Text as="h2" textStyle="sectionTitle" color="fg.default">
        Overview
      </Text>
    </Stack>
  )
})

ProjectOverviewPage.displayName = 'ProjectOverviewPage'

export type { ProjectOverviewPageProps }
