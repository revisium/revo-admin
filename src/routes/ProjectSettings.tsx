import { useOutletContext } from 'react-router'
import { ProjectSettingsPage } from 'src/pages/project-settings'
import { type ProjectLayoutContext } from 'src/widgets/ProjectLayout'

export default function ProjectSettings() {
  const { project, updateProject } = useOutletContext<ProjectLayoutContext>()

  return <ProjectSettingsPage key={project.id} project={project} onProjectChange={updateProject} />
}
