import { Box, Link as ChakraLink, Stack, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { Link, Outlet, useMatch } from 'react-router'
import { type Project, ProjectPageHeader } from 'src/entities/project'
import { routePaths, routes } from 'src/shared/config'
import { useViewModel } from 'src/shared/lib'
import { Button } from 'src/shared/ui/kit'
import { ProjectLayoutViewModel } from '../model/ProjectLayoutViewModel'

interface ProjectLayoutProps {
  readonly projectId: string
}

interface ProjectLayoutContext {
  readonly project: Project
  readonly updateProject: (project: Project) => void
}

const BackToProjects = () => (
  <ChakraLink asChild color="fg.default" textStyle="bodyStrong">
    <Link to={routes.projects()}>Back to projects</Link>
  </ChakraLink>
)

const ProjectLoadingMessage = () => (
  <Box role="status" aria-live="polite">
    <Text textStyle="body" color="fg.secondary">
      Loading project…
    </Text>
  </Box>
)

const UnavailableProject = () => (
  <Stack gap="4">
    <Text as="h1" textStyle="pageTitle" color="fg.default">
      Project unavailable
    </Text>
    <Text textStyle="body" color="fg.secondary">
      This project is unavailable.
    </Text>
    <BackToProjects />
  </Stack>
)

const FailedProject = ({ viewModel }: { readonly viewModel: ProjectLayoutViewModel }) => (
  <Stack gap="4" role="alert" aria-live="assertive">
    <Text as="h1" textStyle="pageTitle" color="fg.default">
      Project could not be loaded
    </Text>
    <Text textStyle="body" color="fg.secondary">
      Project could not be loaded. Try again.
    </Text>
    <Stack gap="3" alignItems="flex-start">
      <Button variant="secondary" onClick={viewModel.retry}>
        Retry
      </Button>
      <BackToProjects />
    </Stack>
  </Stack>
)

export const ProjectLayout = observer(({ projectId }: ProjectLayoutProps) => {
  const viewModel = useViewModel(ProjectLayoutViewModel, projectId)
  const settingsMatch = useMatch(routePaths.projectSettings)

  if (viewModel.isLoading && !viewModel.project)
    return (
      <Stack gap="4">
        <ProjectLoadingMessage />
        <BackToProjects />
      </Stack>
    )
  if (viewModel.isUnavailable) return <UnavailableProject />
  if (viewModel.error) return <FailedProject viewModel={viewModel} />

  const { project } = viewModel
  if (!project) return null

  const currentSection = settingsMatch ? 'settings' : 'overview'
  const headingId = currentSection === 'settings' ? 'project-settings-project-heading' : 'project-overview-heading'
  const context: ProjectLayoutContext = { project, updateProject: viewModel.updateProject }

  return (
    <Stack data-testid="project-layout" gap="8">
      <ProjectPageHeader project={project} currentSection={currentSection} headingId={headingId} />
      {viewModel.isLoading ? <ProjectLoadingMessage /> : <Outlet context={context} />}
    </Stack>
  )
})

ProjectLayout.displayName = 'ProjectLayout'

export type { ProjectLayoutContext, ProjectLayoutProps }
