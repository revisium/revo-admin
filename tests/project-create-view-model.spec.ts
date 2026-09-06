import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectCreateViewModel } from 'src/features/ProjectCreateForm/model/ProjectCreateViewModel'
import type { ProjectService } from 'src/entities/project'

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

describe('ProjectCreateViewModel', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps an untouched empty name error hidden and blocks whitespace-only submission without IO', async () => {
    const create = vi.fn()
    const model = new ProjectCreateViewModel({ create } as unknown as ProjectService)

    expect(model.name.visibleError).toBeUndefined()
    expect(model.isBusy).toBe(false)

    model.name.setValue('   ')
    const onInvalid = vi.fn()
    const projectId = await model.submit(onInvalid)

    expect(projectId).toBeUndefined()
    expect(onInvalid).toHaveBeenCalledOnce()
    expect(model.name.visibleError).toBe('Name is required.')
    expect(create).not.toHaveBeenCalled()
  })

  it('notifies only the invalid invocation when a duplicate arrives during validation', async () => {
    const create = vi.fn()
    const model = new ProjectCreateViewModel({ create } as unknown as ProjectService)
    const firstInvalid = vi.fn()
    const ignoredInvalid = vi.fn()

    const first = model.submit(firstInvalid)
    const ignored = model.submit(ignoredInvalid)

    await expect(ignored).resolves.toBeUndefined()
    await expect(first).resolves.toBeUndefined()
    expect(firstInvalid).toHaveBeenCalledOnce()
    expect(ignoredInvalid).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it('does not notify invalid validation after disposal', async () => {
    const model = new ProjectCreateViewModel({ create: vi.fn() } as unknown as ProjectService)
    const onInvalid = vi.fn()

    const submission = model.submit(onInvalid)
    model.unmount()

    await expect(submission).resolves.toBeUndefined()
    await expect(model.submit(onInvalid)).resolves.toBeUndefined()
    expect(onInvalid).not.toHaveBeenCalled()
  })

  it('passes raw values, omits an empty description at the service boundary, and deduplicates pending submits', async () => {
    const request = deferred<string>()
    const create = vi.fn().mockReturnValue(request.promise)
    const model = new ProjectCreateViewModel({ create } as unknown as ProjectService)
    model.name.setValue('  New project  ')
    model.description.setValue(' description ')

    const first = model.submit()
    const second = model.submit()

    await vi.waitFor(() => expect(model.isCreating).toBe(true))
    expect(model.isBusy).toBe(true)
    expect(create).toHaveBeenCalledWith({ name: '  New project  ', description: ' description ' })
    await expect(second).resolves.toBeUndefined()

    request.resolve('prj_created')

    await expect(first).resolves.toBe('prj_created')
    expect(model.isBusy).toBe(false)
  })

  it.each([null, undefined, ''])('exposes the fallback for an empty failure: %s', async (error) => {
    const create = vi.fn().mockRejectedValue(error)
    const model = new ProjectCreateViewModel({ create } as unknown as ProjectService)
    model.name.setValue('Fallback project')

    await expect(model.submit()).resolves.toBeUndefined()
    expect(model.creationError).toBe('Project could not be created. Try again')
    expect(model.isBusy).toBe(false)
  })

  it('preserves values and exposes a safe creation error that can be retried', async () => {
    const create = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce('prj_retry')
    const model = new ProjectCreateViewModel({ create } as unknown as ProjectService)
    model.name.setValue('Retry me')
    model.description.setValue('Preserve me')

    const onInvalid = vi.fn()
    await expect(model.submit(onInvalid)).resolves.toBeUndefined()
    expect(onInvalid).not.toHaveBeenCalled()
    expect(model.creationError).toBe('offline')
    expect(model.name.value).toBe('Retry me')
    expect(model.description.value).toBe('Preserve me')

    await expect(model.submit()).resolves.toBe('prj_retry')
    expect(create).toHaveBeenLastCalledWith({ name: 'Retry me', description: 'Preserve me' })
    expect(model.creationError).toBeNull()
    expect(model.isCreating).toBe(false)
  })

  it('ignores submission disposed during validation before starting IO', async () => {
    const create = vi.fn()
    const model = new ProjectCreateViewModel({ create } as unknown as ProjectService)
    model.name.setValue('Disposed project')

    const submission = model.submit()
    model.unmount()

    await expect(submission).resolves.toBeUndefined()
    await expect(model.submit()).resolves.toBeUndefined()
    expect(create).not.toHaveBeenCalled()
  })

  it('suppresses a late failure after unmount', async () => {
    const request = deferred<string>()
    const create = vi.fn().mockReturnValue(request.promise)
    const model = new ProjectCreateViewModel({ create } as unknown as ProjectService)
    model.name.setValue('Late failure')

    const submission = model.submit()
    await vi.waitFor(() => expect(model.isCreating).toBe(true))
    model.unmount()
    request.reject(new Error('offline'))

    await expect(submission).resolves.toBeUndefined()
    expect(model.isCreating).toBe(false)
    expect(model.creationError).toBeNull()
  })

  it('clears pending state on unmount and suppresses a late completion without cancelling transport', async () => {
    const request = deferred<string>()
    const create = vi.fn().mockReturnValue(request.promise)
    const model = new ProjectCreateViewModel({ create } as unknown as ProjectService)
    model.name.setValue('Late project')

    const submission = model.submit()
    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce())
    model.unmount()
    expect(model.isCreating).toBe(false)
    expect(model.isBusy).toBe(false)
    request.resolve('prj_late')

    await expect(submission).resolves.toBeUndefined()
    expect(create).toHaveBeenCalledOnce()
    expect(model.isCreating).toBe(false)
  })
})
