import { describe, expect, it, vi } from 'vitest'
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
  it('keeps an untouched empty name error hidden and blocks whitespace-only submission without IO', async () => {
    const create = vi.fn()
    const model = new ProjectCreateViewModel({ create } as unknown as ProjectService)

    expect(model.name.visibleError).toBeUndefined()
    expect(model.isBusy).toBe(false)

    model.name.setValue('   ')
    const outcome = await model.submit()

    expect(outcome).toEqual({ kind: 'invalid' })
    expect(model.name.visibleError).toBe('Name is required.')
    expect(create).not.toHaveBeenCalled()
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
    await expect(second).resolves.toEqual({ kind: 'ignored' })

    request.resolve('prj_created')

    await expect(first).resolves.toEqual({ kind: 'created', projectId: 'prj_created' })
    expect(model.isBusy).toBe(false)
  })

  it('preserves values and exposes a safe creation error that can be retried', async () => {
    const create = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce('prj_retry')
    const model = new ProjectCreateViewModel({ create } as unknown as ProjectService)
    model.name.setValue('Retry me')
    model.description.setValue('Preserve me')

    await expect(model.submit()).resolves.toEqual({ kind: 'failed' })
    expect(model.creationError).toBe('offline')
    expect(model.name.value).toBe('Retry me')
    expect(model.description.value).toBe('Preserve me')

    await expect(model.submit()).resolves.toEqual({ kind: 'created', projectId: 'prj_retry' })
    expect(create).toHaveBeenLastCalledWith({ name: 'Retry me', description: 'Preserve me' })
  })

  it('suppresses a late completion after unmount without cancelling the request', async () => {
    const request = deferred<string>()
    const create = vi.fn().mockReturnValue(request.promise)
    const model = new ProjectCreateViewModel({ create } as unknown as ProjectService)
    model.name.setValue('Late project')

    const submission = model.submit()
    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce())
    model.unmount()
    request.resolve('prj_late')

    await expect(submission).resolves.toEqual({ kind: 'ignored' })
    expect(create).toHaveBeenCalledOnce()
    expect(model.isCreating).toBe(true)
  })
})
