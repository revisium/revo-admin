import { createForm, field, type FormControl, type FormsCoreForm } from '@revisium/forms-core'
import { makeAutoObservable, runInAction } from 'mobx'
import { type Project, type ProjectUpdateInput, ProjectService } from 'src/entities/project'
import { container, ObservableRequest } from 'src/shared/lib'

type ProjectSettingsValues = {
  readonly name: string
  readonly description: string
}

type ProjectStateOperation = 'archive' | 'restore'
type ProjectChangeHandler = (project: Project) => void
type ProjectSettingsLifecycle = {
  disposed: boolean
  validating: boolean
}
type ProjectSettingsContext = {
  projectId: string
  onProjectChange: ProjectChangeHandler | undefined
}
const committedRefreshError = 'Changes were saved, but the project could not be refreshed. Retry.'
const updateError = 'Changes could not be saved. Try again.'

class ProjectUpdateRequestError extends Error {}
class ProjectRefreshRequiredError extends ProjectUpdateRequestError {}

const nameErrorOf = (value: string): string | undefined => (value.trim() === '' ? 'Name is required.' : undefined)

const valuesOf = (project: Project): ProjectSettingsValues => ({
  name: project.name,
  description: project.description,
})

const matchesUpdate = (project: Project, input: ProjectUpdateInput): boolean =>
  project.name === input.name.trim() && project.description === input.description

export class ProjectSettingsViewModel {
  private readonly lifecycle: ProjectSettingsLifecycle = { disposed: false, validating: false }
  private context: ProjectSettingsContext = {
    projectId: '',
    onProjectChange: undefined,
  }
  private projectReadModel: Project | null = null
  private stateDialogOperation: ProjectStateOperation | null = null
  private readonly form: FormsCoreForm<
    ProjectSettingsValues,
    { name: ReturnType<typeof field<string>>; description: ReturnType<typeof field<string>> }
  >
  private readonly updateReconciliationReadRequest: ObservableRequest<Project | null, [string], never>
  private readonly projectUpdateRequest: ObservableRequest<Project, [ProjectUpdateInput], ProjectUpdateRequestError>
  private readonly projectStateChangeRequest: ObservableRequest<Project, [ProjectStateOperation], Error>
  private readonly stopWatchingForm: () => void

  public constructor(private readonly projectService: ProjectService) {
    this.form = createForm({
      defaultValues: { name: '', description: '' },
      fields: {
        name: field<string, ProjectSettingsValues>({
          validators: {
            onBlur: ({ value }) => nameErrorOf(value),
            onSubmit: ({ value }) => nameErrorOf(value),
          },
        }),
        description: field<string, ProjectSettingsValues>(),
      },
    })
    this.updateReconciliationReadRequest = ObservableRequest.of(async (projectId: string) => {
      try {
        return await projectService.get(projectId)
      } catch {
        return null
      }
    })
    this.projectUpdateRequest = ObservableRequest.of((input: ProjectUpdateInput) =>
      this.updateProjectAndReadBack(input),
    )
    this.projectStateChangeRequest = ObservableRequest.of((operation: ProjectStateOperation) =>
      this.changeProjectStateAndReadBack(operation),
    )
    this.stopWatchingForm = this.form.onPatch(() => {
      if (this.form.isDirty) this.clearUpdateRequestResult()
    })
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get name(): FormControl<string> {
    return this.form.controls.name
  }

  public get description(): FormControl<string> {
    return this.form.controls.description
  }

  public get project(): Project | null {
    return this.projectReadModel
  }

  public get isDirty(): boolean {
    return this.form.isDirty
  }

  public get isArchived(): boolean {
    return this.projectReadModel?.status === 'archived'
  }

  public get isSaving(): boolean {
    return this.projectUpdateRequest.isLoading
  }

  public get isRefreshing(): boolean {
    return this.updateReconciliationReadRequest.isLoading
  }

  public get isOperationPending(): boolean {
    return this.projectStateChangeRequest.isLoading
  }

  public get canSave(): boolean {
    return Boolean(
      this.projectReadModel &&
      !this.isArchived &&
      !this.hasCommittedRefreshFailure &&
      this.isDirty &&
      !this.isSaving &&
      !this.isOperationPending,
    )
  }

  public get canCancel(): boolean {
    return Boolean(this.projectReadModel && !this.isArchived && this.isDirty && !this.isSaving)
  }

  public get saveNotice(): string | null {
    return this.projectUpdateRequest.data?.status === 'active' ? 'Changes saved.' : null
  }

  public get saveError(): string | null {
    return this.projectUpdateRequest.error?.message ?? null
  }

  public get hasCommittedRefreshFailure(): boolean {
    return this.projectUpdateRequest.error instanceof ProjectRefreshRequiredError
  }

  public get stateDialog(): ProjectStateOperation | null {
    return this.stateDialogOperation
  }

  public get operationError(): string | null {
    return this.stateDialogOperation === null ? null : (this.projectStateChangeRequest.error?.message ?? null)
  }

  public get stateGuardMessage(): string | null {
    return this.isDirty ? 'Save or cancel your changes first.' : null
  }

  public setup(project: Project, onProjectChange?: ProjectChangeHandler): void {
    this.context = { projectId: project.id, onProjectChange }
    this.applyLoadedProject(project, false)
  }

  public async save(onInvalid?: () => void): Promise<boolean> {
    if (this.lifecycle.disposed || !this.canSave || this.lifecycle.validating) return false

    this.lifecycle.validating = true
    await this.form.submit()
    if (this.lifecycle.disposed) return false
    if (!this.form.isValid) {
      runInAction(() => {
        this.lifecycle.validating = false
      })
      onInvalid?.()
      return false
    }

    const input = this.form.getRawValue()
    runInAction(() => {
      this.lifecycle.validating = false
    })
    const result = await this.projectUpdateRequest.fetch(input)
    if (this.lifecycle.disposed || !result.isRight) return false

    return result.data.status === 'active'
  }

  public cancelChanges(): void {
    if (!this.projectReadModel) return
    this.form.reset(valuesOf(this.projectReadModel))
    this.clearUpdateRequestResult()
  }

  public async retryRefresh(): Promise<boolean> {
    if (this.lifecycle.disposed || this.isSaving || this.isRefreshing || !this.hasCommittedRefreshFailure) return false

    const result = await this.updateReconciliationReadRequest.fetch(this.context.projectId)
    if (this.lifecycle.disposed || !result.isRight || result.data === null) return false
    const project = result.data

    runInAction(() => {
      this.replaceProject(project)
      this.form.reset(valuesOf(project))
      this.projectUpdateRequest.setDataDirectly(null)
    })
    return true
  }

  public openArchive(): boolean {
    if (
      this.lifecycle.disposed ||
      !this.projectReadModel ||
      this.isArchived ||
      this.isDirty ||
      this.hasCommittedRefreshFailure ||
      this.isOperationPending
    )
      return false
    this.projectStateChangeRequest.setDataDirectly(null)
    this.stateDialogOperation = 'archive'
    return true
  }

  public openRestore(): boolean {
    if (
      this.lifecycle.disposed ||
      !this.projectReadModel ||
      !this.isArchived ||
      this.hasCommittedRefreshFailure ||
      this.isOperationPending
    )
      return false
    this.projectStateChangeRequest.setDataDirectly(null)
    this.stateDialogOperation = 'restore'
    return true
  }

  public closeStateDialog(): void {
    if (this.isOperationPending) return
    this.stateDialogOperation = null
  }

  public confirmArchive(): Promise<boolean> {
    return this.confirmStateChange('archive')
  }

  public confirmRestore(): Promise<boolean> {
    return this.confirmStateChange('restore')
  }

  public unmount(): void {
    if (this.lifecycle.disposed) return
    this.lifecycle.disposed = true
    this.lifecycle.validating = false
    this.updateReconciliationReadRequest.abort()
    this.projectUpdateRequest.abort()
    this.projectStateChangeRequest.abort()
    this.stopWatchingForm()
    this.form.dispose()
  }

  private async updateProjectAndReadBack(input: ProjectUpdateInput): Promise<Project> {
    let committed: boolean
    try {
      committed = await this.projectService.update(this.context.projectId, input)
    } catch {
      committed = false
    }

    const project = await this.readProjectAfterWrite()
    const archived = project?.status === 'archived'
    const saved = Boolean(committed && project && matchesUpdate(project, input))

    if (!this.lifecycle.disposed && project) {
      runInAction(() => {
        this.replaceProject(project)
        if (archived || saved) this.form.reset(valuesOf(project))
      })
    }

    if ((archived || saved) && project) return project
    if (committed && project === null) throw new ProjectRefreshRequiredError(committedRefreshError)
    throw new ProjectUpdateRequestError(updateError)
  }

  private async changeProjectStateAndReadBack(operation: ProjectStateOperation): Promise<Project> {
    try {
      await this.projectService[operation](this.context.projectId)
    } catch {
      return this.readProjectStateAfterWrite(operation)
    }

    return this.readProjectStateAfterWrite(operation)
  }

  private async readProjectStateAfterWrite(operation: ProjectStateOperation): Promise<Project> {
    const project = await this.readProjectAfterWrite()
    if (!this.lifecycle.disposed && project) {
      runInAction(() => {
        this.replaceProject(project)
        this.form.reset(valuesOf(project))
      })
    }

    const wantedStatus = operation === 'archive' ? 'archived' : 'active'
    if (project?.status === wantedStatus) return project
    throw new Error(`Project could not be ${operation === 'archive' ? 'archived' : 'restored'}. Retry or cancel.`)
  }

  private async readProjectAfterWrite(): Promise<Project | null> {
    if (this.lifecycle.disposed) return null

    try {
      return await this.projectService.get(this.context.projectId)
    } catch {
      return null
    }
  }

  private async confirmStateChange(operation: ProjectStateOperation): Promise<boolean> {
    if (this.lifecycle.disposed || this.stateDialog !== operation || this.isOperationPending) return false

    const result = await this.projectStateChangeRequest.fetch(operation)
    if (this.lifecycle.disposed || !result.isRight) return false

    const wantedStatus = operation === 'archive' ? 'archived' : 'active'
    if (result.data.status === wantedStatus) {
      runInAction(() => {
        this.stateDialogOperation = null
        this.clearUpdateRequestResult()
      })
      return true
    }

    return false
  }

  private applyLoadedProject(project: Project | null, notify = true): void {
    this.replaceProject(project, notify)
    this.stateDialogOperation = null
    this.projectUpdateRequest.setDataDirectly(null)
    this.form.reset(project ? valuesOf(project) : { name: '', description: '' })
  }

  private replaceProject(project: Project | null, notify = true): void {
    this.projectReadModel = project
    if (project && notify) this.context.onProjectChange?.(project)
  }

  private clearUpdateRequestResult(): void {
    if (
      this.hasCommittedRefreshFailure ||
      (this.projectUpdateRequest.data === null && this.projectUpdateRequest.error === null)
    )
      return
    this.projectUpdateRequest.setDataDirectly(null)
  }
}

container.register(
  ProjectSettingsViewModel,
  () => {
    const projectService = container.get(ProjectService)
    return new ProjectSettingsViewModel(projectService)
  },
  { scope: 'transient' },
)

export type { ProjectChangeHandler }
