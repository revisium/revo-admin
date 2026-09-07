import { useParams } from 'react-router'
import { ProjectLayout } from 'src/widgets/ProjectLayout'

export default function ProjectDetail() {
  const { projectId } = useParams()
  const overviewProjectId = projectId ?? ''

  return <ProjectLayout key={overviewProjectId} projectId={overviewProjectId} />
}
