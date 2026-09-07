import { makeAutoObservable } from 'mobx'
import { type Project, ProjectService } from 'src/entities/project'
import { container, errorMessageOf, ObservableRequest } from 'src/shared/lib'

const loadErrorOf = (error: unknown): string => errorMessageOf(error, 'Failed to load project.')

export class ProjectLayoutViewModel {
  private projectId = ''
  private readonly projectRequest: ObservableRequest<Project | null, [string], Error>

  public constructor(projectService: ProjectService) {
    this.projectRequest = ObservableRequest.of(async (projectId: string) => {
      try {
        return await projectService.get(projectId)
      } catch (error) {
        throw new Error(loadErrorOf(error), { cause: error })
      }
    })
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get isLoading(): boolean {
    return this.projectRequest.isLoading || !this.projectRequest.isLoaded
  }

  public get project(): Project | null {
    return this.projectRequest.data
  }

  public get error(): string | null {
    return this.projectRequest.error?.message ?? null
  }

  public get isUnavailable(): boolean {
    return !this.isLoading && !this.error && this.project === null
  }

  public setup(projectId: string): void {
    this.projectId = projectId
  }

  public async mount(projectId: string): Promise<void> {
    this.projectId = projectId
    await this.projectRequest.fetch(projectId)
  }

  public retry(): Promise<void> {
    return this.mount(this.projectId)
  }

  public updateProject(project: Project): void {
    if (project.id !== this.projectId) return
    this.projectRequest.setDataDirectly(project)
  }

  public unmount(): void {
    this.projectRequest.abort()
  }
}

container.register(
  ProjectLayoutViewModel,
  () => {
    const projectService = container.get(ProjectService)
    return new ProjectLayoutViewModel(projectService)
  },
  { scope: 'transient' },
)
