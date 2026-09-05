import { makeAutoObservable, runInAction } from 'mobx'
import { type Project, ProjectService } from 'src/entities/project'
import { errorMessageOf, container } from 'src/shared/lib'

type ProjectOverviewState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly project: Project }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'error'; readonly message: string }

const loadErrorOf = (error: unknown): string => errorMessageOf(error, 'Failed to load project.')

export class ProjectOverviewViewModel {
  private projectId = ''
  private requestGeneration = 0
  private disposed = false
  public state: ProjectOverviewState = { kind: 'idle' }

  public constructor(private readonly projectService: ProjectService) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public setup(projectId: string): void {
    this.projectId = projectId
  }

  public async mount(projectId: string): Promise<void> {
    this.disposed = false
    this.projectId = projectId
    const requestGeneration = ++this.requestGeneration
    this.state = { kind: 'loading' }

    try {
      const project = await this.projectService.get(projectId)
      if (!this.accepts(requestGeneration)) return

      runInAction(() => {
        this.state = project ? { kind: 'ready', project } : { kind: 'unavailable' }
      })
    } catch (error) {
      if (!this.accepts(requestGeneration)) return

      runInAction(() => {
        this.state = { kind: 'error', message: loadErrorOf(error) }
      })
    }
  }

  public retry(): Promise<void> {
    return this.mount(this.projectId)
  }

  public unmount(): void {
    this.disposed = true
    this.requestGeneration += 1
  }

  private accepts(requestGeneration: number): boolean {
    return !this.disposed && requestGeneration === this.requestGeneration
  }
}

container.register(ProjectOverviewViewModel, () => new ProjectOverviewViewModel(container.get(ProjectService)), {
  scope: 'transient',
})

export type { ProjectOverviewState }
