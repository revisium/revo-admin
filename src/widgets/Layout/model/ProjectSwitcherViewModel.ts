import { makeAutoObservable } from 'mobx'
import { PROJECTS } from 'src/shared/fixtures'
import type { ProjectRow, ProjectTone } from 'src/shared/fixtures'
import { container } from 'src/shared/lib/DIContainer'

export type LayoutProjectTone = 'all' | 'failed' | 'role' | 'waiting' | 'system'

export interface LayoutProjectOption {
  readonly id: string
  readonly label: string
  readonly initials: string
  readonly tone: LayoutProjectTone
  readonly meta: string
}

const layoutTone = (tone: ProjectTone): LayoutProjectTone => {
  if (tone === 'teal') return 'role'
  if (tone === 'plum') return 'waiting'
  if (tone === 'system') return 'system'
  return 'failed'
}

const workspaceOf = (key: string): string => key.split('/')[0] ?? key

const projectOption = (project: ProjectRow): LayoutProjectOption => ({
  id: project.id,
  label: project.name,
  initials: project.initials,
  tone: layoutTone(project.tone),
  meta: workspaceOf(project.key),
})

export class ProjectSwitcherViewModel {
  public selectedProjectId = 'all'

  public constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get projects(): readonly LayoutProjectOption[] {
    return PROJECTS.map(projectOption)
  }

  public get allProjectsSelected(): boolean {
    return this.selectedProjectId === 'all'
  }

  public get selectedProject(): LayoutProjectOption | undefined {
    return this.projects.find((project) => project.id === this.selectedProjectId)
  }

  public get selectedLabel(): string {
    if (this.selectedProjectId === 'control-plane') return 'Control plane'

    return this.selectedProject?.label ?? 'All projects'
  }

  public get selectedMeta(): string {
    if (this.selectedProjectId === 'control-plane') return 'system'

    return this.selectedProject?.meta ?? 'agent-orchestration'
  }

  public get selectedInitials(): string {
    if (this.selectedProjectId === 'control-plane') return 'sys'

    return this.selectedProject?.initials ?? 'all'
  }

  public get selectedTone(): LayoutProjectTone {
    if (this.selectedProjectId === 'control-plane') return 'system'

    return this.selectedProject?.tone ?? 'all'
  }

  public selectProject(projectId: string): void {
    this.selectedProjectId = projectId
  }
}

container.register(ProjectSwitcherViewModel, () => new ProjectSwitcherViewModel(), { scope: 'transient' })
