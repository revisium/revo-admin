import { createForm, field, type FormControl, type FormsCoreForm } from '@revisium/forms-core'
import { makeAutoObservable, runInAction } from 'mobx'
import { type ProjectCreateInput, ProjectService } from 'src/entities/project'
import { errorMessageOf, container, ObservableRequest } from 'src/shared/lib'

type ProjectCreateValues = {
  readonly name: string
  readonly description: string
}

const nameErrorOf = (value: string): string | undefined => (value.trim() === '' ? 'Name is required.' : undefined)
const creationErrorOf = (error: unknown): string => errorMessageOf(error, 'Project could not be created. Try again')

export class ProjectCreateViewModel {
  private disposed = false
  private validating = false
  private readonly form: FormsCoreForm<
    ProjectCreateValues,
    { name: ReturnType<typeof field<string>>; description: ReturnType<typeof field<string>> }
  >
  private readonly creationRequest: ObservableRequest<string, [ProjectCreateInput], Error>

  public constructor(projectService: ProjectService) {
    this.creationRequest = ObservableRequest.of(async (values: ProjectCreateInput) => {
      try {
        return await projectService.create(values)
      } catch (error) {
        throw new Error(creationErrorOf(error), { cause: error })
      }
    })
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

  public get isCreating(): boolean {
    return this.creationRequest.isLoading
  }

  public get creationError(): string | null {
    return this.creationRequest.error?.message ?? null
  }

  public get isBusy(): boolean {
    return this.form.isSubmitting || this.isCreating
  }

  public async submit(onInvalid?: () => void): Promise<string | undefined> {
    if (this.disposed || this.isBusy || this.validating) return undefined

    this.validating = true
    await this.form.submit()
    if (this.disposed) return undefined
    if (!this.form.isValid) {
      runInAction(() => {
        this.validating = false
      })
      onInvalid?.()
      return undefined
    }

    const values = this.form.getRawValue()
    runInAction(() => {
      this.validating = false
    })
    const result = await this.creationRequest.fetch({
      name: values.name,
      description: values.description || undefined,
    })
    if (this.disposed) return undefined

    return result.isRight ? result.data : undefined
  }

  public unmount(): void {
    if (this.disposed) return
    this.disposed = true
    this.validating = false
    this.creationRequest.abort()
    this.form.dispose()
  }
}

container.register(
  ProjectCreateViewModel,
  () => {
    const projectService = container.get(ProjectService)
    return new ProjectCreateViewModel(projectService)
  },
  { scope: 'transient' },
)
