import { createForm, field, type FormControl, type FormsCoreForm } from '@revisium/forms-core'
import { makeAutoObservable, runInAction } from 'mobx'
import { ProjectService } from 'src/entities/project'
import { errorMessageOf, container } from 'src/shared/lib'

type ProjectCreateValues = {
  readonly name: string
  readonly description: string
}

type ProjectCreateOutcome =
  | { readonly kind: 'invalid' }
  | { readonly kind: 'failed' }
  | { readonly kind: 'created'; readonly projectId: string }
  | { readonly kind: 'ignored' }

const nameErrorOf = (value: string): string | undefined => (value.trim() === '' ? 'Name is required.' : undefined)
const creationErrorOf = (error: unknown): string => errorMessageOf(error, 'Project could not be created.')

export class ProjectCreateViewModel {
  private disposed = false
  private validating = false
  private readonly form: FormsCoreForm<
    ProjectCreateValues,
    { name: ReturnType<typeof field<string>>; description: ReturnType<typeof field<string>> }
  >
  public isCreating = false
  public creationError: string | null = null

  public constructor(private readonly projectService: ProjectService) {
    this.form = createForm({
      defaultValues: { name: '', description: '' },
      fields: {
        name: field<string, ProjectCreateValues>({
          validators: {
            onChange: ({ value }) => nameErrorOf(value),
            onBlur: ({ value }) => nameErrorOf(value),
            onSubmit: ({ value }) => nameErrorOf(value),
          },
        }),
        description: field<string, ProjectCreateValues>(),
      },
    })
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get name(): FormControl<string> {
    return this.form.controls.name
  }

  public get description(): FormControl<string> {
    return this.form.controls.description
  }

  public get isBusy(): boolean {
    return this.form.isSubmitting || this.isCreating
  }

  public async submit(): Promise<ProjectCreateOutcome> {
    if (this.disposed || this.isBusy || this.validating) return { kind: 'ignored' }

    this.validating = true
    await this.form.submit()
    if (this.disposed) return { kind: 'ignored' }
    if (!this.form.isValid) {
      runInAction(() => {
        this.validating = false
      })
      return { kind: 'invalid' }
    }

    const values = this.form.getRawValue()
    runInAction(() => {
      this.validating = false
      this.isCreating = true
      this.creationError = null
    })

    try {
      const projectId = await this.projectService.create({
        name: values.name,
        description: values.description || undefined,
      })
      if (this.disposed) return { kind: 'ignored' }

      runInAction(() => {
        this.isCreating = false
      })
      return { kind: 'created', projectId }
    } catch (error) {
      if (this.disposed) return { kind: 'ignored' }

      runInAction(() => {
        this.isCreating = false
        this.creationError = creationErrorOf(error)
      })
      return { kind: 'failed' }
    }
  }

  public unmount(): void {
    if (this.disposed) return
    this.disposed = true
    this.validating = false
    this.form.dispose()
  }
}

container.register(ProjectCreateViewModel, () => new ProjectCreateViewModel(container.get(ProjectService)), {
  scope: 'transient',
})

export type { ProjectCreateOutcome }
