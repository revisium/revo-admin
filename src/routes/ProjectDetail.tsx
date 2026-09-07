import { useLocation, useParams } from 'react-router'
import { projectFromNavigationState } from 'src/entities/project'
import { ProjectLayout } from 'src/widgets/ProjectLayout'

export default function ProjectDetail() {
  const { projectId } = useParams()
  const location = useLocation()

  const overviewProjectId = projectId ?? ''
  const initialProject = projectFromNavigationState(location.state, overviewProjectId)

  return <ProjectLayout key={overviewProjectId} projectId={overviewProjectId} initialProject={initialProject} />
}
