import { Stack } from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router'
import { ProjectCreateForm, ProjectCreateViewModel } from 'src/features/ProjectCreateForm'
import { routes } from 'src/shared/config'
import { useViewModel } from 'src/shared/lib'
import { PageHeader } from 'src/shared/ui/components'

const cameFromProjects = (state: unknown): boolean =>
  typeof state === 'object' && state !== null && 'fromProjects' in state && state.fromProjects === true

export const ProjectCreatePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const viewModel = useViewModel(ProjectCreateViewModel)

  const cancel = (): void => {
    if (cameFromProjects(location.state)) {
      navigate(-1)
      return
    }

    navigate(routes.projects())
  }

  const created = (projectId: string): void => {
    navigate(routes.project(projectId), { replace: true })
  }

  return (
    <Stack gap="6" maxW="640px">
      <PageHeader title="Create project" />
      <ProjectCreateForm viewModel={viewModel} onCreated={created} onCancel={cancel} />
    </Stack>
  )
}
