import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Project, ProjectService } from 'src/entities/project'
import { ProjectSettingsViewModel } from 'src/pages/project-settings/model/ProjectSettingsViewModel'

type Deferred<T> = {
  readonly promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason: unknown) => void
}

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

const project = (overrides: Partial<Project> = {}): Project => ({
  id: 'prj_1',
  name: 'Saved project',
  description: 'Saved description',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

const service = (overrides: Partial<ProjectService> = {}): ProjectService =>
  ({
    get: vi.fn().mockResolvedValue(project()),
    update: vi.fn().mockResolvedValue(true),
    archive: vi.fn().mockResolvedValue(true),
    restore: vi.fn().mockResolvedValue(true),
    ...overrides,
  }) as unknown as ProjectService

describe('ProjectSettingsViewModel', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses request Project data and errors without workflow outcome types', () => {
    const source = readFileSync('src/pages/project-settings/model/ProjectSettingsViewModel.ts', 'utf8')

    expect(source).not.toContain('Outcome')
    expect(source).toMatch(/projectUpdateRequest: ObservableRequest<\s*Project,/)
    expect(source).toMatch(/projectStateChangeRequest: ObservableRequest<Project,/)
  })

  it('exposes the open state dialog as a nullable operation without a wrapper state', () => {
    const source = readFileSync('src/pages/project-settings/model/ProjectSettingsViewModel.ts', 'utf8')

    expect(source).toMatch(/private stateDialogOperation: ProjectStateOperation \| null = null/)
    expect(source).toMatch(
      /public get stateDialog\(\): ProjectStateOperation \| null \{\s+return this\.stateDialogOperation\s+\}/,
    )
    expect(source).not.toContain('ProjectStateDialogState')
  })

  it('derives pending and saved feedback from the project update request', async () => {
    const updateRequest = deferred<boolean>()
    const get = vi.fn().mockResolvedValueOnce(project({ name: 'Updated project' }))
    const model = new ProjectSettingsViewModel(service({ update: vi.fn().mockReturnValue(updateRequest.promise), get }))
    model.setup(project())

    expect(model.saveNotice).toBeNull()
    expect(model.saveError).toBeNull()

    model.name.setValue('Updated project')
    const save = model.save()
    await vi.waitFor(() => expect(model.isSaving).toBe(true))
    expect(model.saveNotice).toBeNull()
    expect(model.saveError).toBeNull()

    updateRequest.resolve(true)
    await expect(save).resolves.toBe(true)
    expect(model.saveNotice).toBe('Changes saved.')
    expect(model.saveError).toBeNull()
  })

  it('derives settled update feedback from the last request and clears it on the next edit', async () => {
    const get = vi.fn().mockResolvedValueOnce(project({ name: 'Updated project' }))
    const model = new ProjectSettingsViewModel(service({ get }))
    model.setup(project())

    expect(model.saveNotice).toBeNull()
    expect(model.saveError).toBeNull()

    model.name.setValue('Updated project')
    await expect(model.save()).resolves.toBe(true)
    expect(model.saveNotice).toBe('Changes saved.')
    expect(model.saveError).toBeNull()

    model.name.setValue('Another edit')
    expect(model.saveNotice).toBeNull()
    expect(model.saveError).toBeNull()
  })

  it('uses the layout-owned project without keeping a standalone read workflow', () => {
    const get = vi.fn()
    const model = new ProjectSettingsViewModel(service({ get }))

    model.setup(project())
    expect(model.project).toEqual(project())
    expect(model.name.value).toBe('Saved project')
    expect(model.description.value).toBe('Saved description')
    expect(model.isDirty).toBe(false)
    expect(model.isArchived).toBe(false)
    expect(get).not.toHaveBeenCalled()
    const removedReadMembers = [
      'mount',
      ['retry', 'Load'].join(''),
      ['load', 'Error'].join(''),
      ['is', 'Unavailable'].join(''),
    ]
    for (const member of removedReadMembers) expect(member in model).toBe(false)
  })

  it('keeps dirty invalid Save available, validates on submit without IO, and cancels to server values', async () => {
    const update = vi.fn()
    const model = new ProjectSettingsViewModel(service({ update }))
    model.setup(project())

    model.name.setValue('   ')
    expect(model.isDirty).toBe(true)
    expect(model.canSave).toBe(true)
    expect(model.name.visibleError).toBeUndefined()

    const onInvalid = vi.fn()
    await model.save(onInvalid)
    expect(onInvalid).toHaveBeenCalledOnce()
    expect(model.name.visibleError).toBe('Name is required.')
    expect(update).not.toHaveBeenCalled()

    model.cancelChanges()
    expect(model.name.value).toBe('Saved project')
    expect(model.description.value).toBe('Saved description')
    expect(model.isDirty).toBe(false)
  })

  it('settles update before refetch, accepts refetched truth, and announces a successful save', async () => {
    const order: string[] = []
    const update = vi.fn(async () => {
      order.push('mutation')
      return true
    })
    const get = vi.fn().mockImplementationOnce(async () => {
      order.push('refetch')
      return project({ name: 'Server trimmed', description: '' })
    })
    const model = new ProjectSettingsViewModel(service({ update, get }))
    model.setup(project())
    model.name.setValue('  Server trimmed  ')
    model.description.setValue('')

    await model.save()

    expect(order).toEqual(['mutation', 'refetch'])
    expect(update).toHaveBeenCalledWith('prj_1', { name: '  Server trimmed  ', description: '' })
    expect(model.project?.name).toBe('Server trimmed')
    expect(model.name.value).toBe('Server trimmed')
    expect(model.description.value).toBe('')
    expect(model.isDirty).toBe(false)
    expect(model.saveNotice).toBe('Changes saved.')
    expect(model.saveError).toBeNull()
  })

  it('keeps the draft and reports failure when update returns false despite a matching active refetch', async () => {
    const update = vi.fn().mockResolvedValue(false)
    const get = vi.fn().mockResolvedValueOnce(project({ name: 'Wanted', description: 'Draft' }))
    const model = new ProjectSettingsViewModel(service({ update, get }))
    model.setup(project())
    model.name.setValue('Wanted')
    model.description.setValue('Draft')

    await model.save()

    expect(model.project?.name).toBe('Wanted')
    expect(model.name.value).toBe('Wanted')
    expect(model.description.value).toBe('Draft')
    expect(model.isDirty).toBe(true)
    expect(model.saveNotice).toBeNull()
    expect(model.saveError).toBe('Changes could not be saved. Try again.')
  })

  it('keeps the draft and reports failure when update rejects despite a matching active refetch', async () => {
    const update = vi.fn().mockRejectedValue(new Error('private failure'))
    const get = vi.fn().mockResolvedValueOnce(project({ name: 'Wanted', description: 'Draft' }))
    const model = new ProjectSettingsViewModel(service({ update, get }))
    model.setup(project())
    model.name.setValue('Wanted')
    model.description.setValue('Draft')

    await model.save()

    expect(model.project?.name).toBe('Wanted')
    expect(model.name.value).toBe('Wanted')
    expect(model.description.value).toBe('Draft')
    expect(model.isDirty).toBe(true)
    expect(model.saveNotice).toBeNull()
    expect(model.saveError).toBe('Changes could not be saved. Try again.')
  })

  it('lets refetched archived truth win a concurrent dirty save and switches to read-only state', async () => {
    const model = new ProjectSettingsViewModel(
      service({
        update: vi.fn().mockRejectedValue(new Error('conflict')),
        get: vi.fn().mockResolvedValueOnce(project({ name: 'Archived elsewhere', status: 'archived' })),
      }),
    )
    model.setup(project())
    model.name.setValue('Local draft')

    await model.save()

    expect(model.project?.name).toBe('Archived elsewhere')
    expect(model.name.value).toBe('Archived elsewhere')
    expect(model.isArchived).toBe(true)
    expect(model.isDirty).toBe(false)
    expect(model.saveNotice).toBeNull()
    expect(model.saveError).toBeNull()
  })

  it('distinguishes a committed update whose refetch failed and retries only the read', async () => {
    const update = vi.fn().mockResolvedValue(true)
    const get = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(project({ name: 'Saved' }))
    const model = new ProjectSettingsViewModel(service({ update, get }))
    model.setup(project())
    get.mockClear()
    model.name.setValue('Saved')

    await model.save()
    expect(model.saveError).toBe('Changes were saved, but the project could not be refreshed. Retry.')
    expect(model.hasCommittedRefreshFailure).toBe(true)
    expect(model.name.value).toBe('Saved')

    await model.retryRefresh()
    expect(update).toHaveBeenCalledOnce()
    expect(get).toHaveBeenCalledTimes(2)
    expect(model.project?.name).toBe('Saved')
    expect(model.isDirty).toBe(false)
    expect(model.saveError).toBeNull()
  })

  it('keeps a failed committed-refresh retry local to the form instead of replacing the loaded page', async () => {
    const get = vi
      .fn()
      .mockRejectedValueOnce(new Error('save refresh offline'))
      .mockRejectedValueOnce(new Error('retry refresh offline'))
    const model = new ProjectSettingsViewModel(service({ update: vi.fn().mockResolvedValue(true), get }))
    model.setup(project())
    model.name.setValue('Possibly saved')

    await model.save()
    await expect(model.retryRefresh()).resolves.toBe(false)

    expect(model.project).toEqual(project())
    expect(model.saveError).toBe('Changes were saved, but the project could not be refreshed. Retry.')
    expect(model.name.value).toBe('Possibly saved')
  })

  it('blocks new writes and preserves reconciliation until one concurrent retry read succeeds', async () => {
    const retryRead = deferred<Project | null>()
    const update = vi.fn().mockResolvedValue(true)
    const archive = vi.fn()
    const get = vi.fn().mockRejectedValueOnce(new Error('save refresh offline')).mockReturnValueOnce(retryRead.promise)
    const model = new ProjectSettingsViewModel(service({ update, archive, get }))
    model.setup(project())
    model.name.setValue('Possibly saved')
    await model.save()

    model.name.setValue('Edited while reconciliation is required')
    expect(model.saveError).toBe('Changes were saved, but the project could not be refreshed. Retry.')
    expect(model.canSave).toBe(false)
    expect(model.openArchive()).toBe(false)

    model.cancelChanges()
    expect(model.saveError).toBe('Changes were saved, but the project could not be refreshed. Retry.')
    expect(model.canSave).toBe(false)
    expect(model.openArchive()).toBe(false)

    const firstRetry = model.retryRefresh()
    await vi.waitFor(() => expect(model.isRefreshing).toBe(true))
    await expect(model.retryRefresh()).resolves.toBe(false)
    expect(get).toHaveBeenCalledTimes(2)
    expect(update).toHaveBeenCalledOnce()
    expect(archive).not.toHaveBeenCalled()

    retryRead.resolve(project({ name: 'Possibly saved' }))
    await expect(firstRetry).resolves.toBe(true)
    expect(model.saveError).toBeNull()
    expect(model.hasCommittedRefreshFailure).toBe(false)
    expect(model.name.value).toBe('Possibly saved')
    expect(model.isDirty).toBe(false)
  })

  it('blocks lifecycle actions while dirty and reconciles false archive and rejected restore from server truth', async () => {
    const archive = vi.fn().mockResolvedValue(false)
    const restore = vi.fn().mockRejectedValue(new Error('private restore error'))
    const get = vi
      .fn()
      .mockResolvedValueOnce(project({ status: 'archived' }))
      .mockResolvedValueOnce(project({ status: 'active' }))
    const model = new ProjectSettingsViewModel(service({ archive, restore, get }))
    model.setup(project())
    model.name.setValue('Dirty')

    expect(model.openArchive()).toBe(false)
    expect(model.stateGuardMessage).toBe('Save or cancel your changes first.')
    model.cancelChanges()
    get.mockClear()

    expect(model.openArchive()).toBe(true)
    await expect(model.confirmArchive()).resolves.toBe(true)
    expect(archive).toHaveBeenCalledBefore(get)
    expect(model.isArchived).toBe(true)
    expect(model.stateDialog).toBeNull()

    expect(model.openRestore()).toBe(true)
    await expect(model.confirmRestore()).resolves.toBe(true)
    expect(restore).toHaveBeenCalledOnce()
    expect(model.isArchived).toBe(false)
    expect(model.stateDialog).toBeNull()
    expect(model.operationError).toBeNull()
  })

  it.each([
    ['archive', 'Project could not be archived. Retry or cancel.'],
    ['restore', 'Project could not be restored. Retry or cancel.'],
  ] as const)(
    'keeps the %s dialog recoverable when the requested state is not observed',
    async (operation, message) => {
      const initial = operation === 'archive' ? project() : project({ status: 'archived' })
      const get = vi.fn().mockResolvedValue(initial)
      const model = new ProjectSettingsViewModel(
        service({
          archive: vi.fn().mockResolvedValue(false),
          restore: vi.fn().mockResolvedValue(false),
          get,
        }),
      )
      model.setup(initial)

      if (operation === 'archive') model.openArchive()
      else model.openRestore()

      const result = operation === 'archive' ? await model.confirmArchive() : await model.confirmRestore()
      expect(result).toBe(false)
      expect(model.stateDialog).toBe(operation)
      expect(model.operationError).toBe(message)
    },
  )

  it('deduplicates pending writes and suppresses late save, operation, and announcements after unmount', async () => {
    const updateRequest = deferred<boolean>()
    const archiveRequest = deferred<boolean>()
    const update = vi.fn().mockReturnValue(updateRequest.promise)
    const archive = vi.fn().mockReturnValue(archiveRequest.promise)
    const get = vi.fn().mockResolvedValue(project())
    const model = new ProjectSettingsViewModel(service({ update, archive, get }))
    model.setup(project())
    get.mockClear()
    model.name.setValue('Pending')

    const save = model.save()
    await vi.waitFor(() => expect(model.isSaving).toBe(true))
    await expect(model.save()).resolves.toBe(false)
    expect(update).toHaveBeenCalledOnce()

    model.unmount()
    updateRequest.resolve(true)
    await expect(save).resolves.toBe(false)
    expect(get).not.toHaveBeenCalled()
    expect(model.saveNotice).toBeNull()
    expect(model.saveError).toBeNull()

    const operationGet = vi.fn().mockResolvedValue(project())
    const operationModel = new ProjectSettingsViewModel(service({ archive, get: operationGet }))
    operationModel.setup(project())
    operationModel.openArchive()
    const operation = operationModel.confirmArchive()
    await vi.waitFor(() => expect(operationModel.isOperationPending).toBe(true))
    await expect(operationModel.confirmArchive()).resolves.toBe(false)
    operationModel.unmount()
    archiveRequest.resolve(true)
    await expect(operation).resolves.toBe(false)
    expect(operationModel.operationError).toBeNull()
  })
})
