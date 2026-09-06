import { useParams } from 'react-router'
import { ProjectOverviewPage } from 'src/pages/project-overview'

export default function ProjectDetail() {
  const { projectId } = useParams()

  const overviewProjectId = projectId ?? ''

  return <ProjectOverviewPage key={overviewProjectId} projectId={overviewProjectId} />
}
