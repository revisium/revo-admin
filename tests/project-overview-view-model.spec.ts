import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectOverviewViewModel } from 'src/pages/project-overview/model/ProjectOverviewViewModel'
import type { Project, ProjectService } from 'src/entities/project'

type Deferred<T> = {
  readonly promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason: unknown) => void
}

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    reject = rejectPromise
    resolve = resolvePromise
  })

  return { promise, resolve, reject }
}

const project = (id: string): Project => ({
  id,
  name: `Project ${id}`,
  description: '',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

describe('ProjectOverviewViewModel', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading during SSR setup without IO, then loads the route project on mount', async () => {
    const get = vi.fn().mockResolvedValue(project('prj_1'))
    const model = new ProjectOverviewViewModel({ get } as unknown as ProjectService)

    model.setup('prj_1')
    expect(model.isLoading).toBe(true)
    expect(model.project).toBeNull()
    expect(model.error).toBeNull()
    expect(model.isUnavailable).toBe(false)
    expect(get).not.toHaveBeenCalled()

    await model.mount('prj_1')

    expect(get).toHaveBeenCalledWith('prj_1')
    expect(model.project).toEqual(project('prj_1'))
    expect(model.isLoading).toBe(false)
    expect(model.error).toBeNull()
    expect(model.isUnavailable).toBe(false)
  })

  it('maps null to unavailable and a rejected request to a safe retryable error', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(project('prj_1'))
    const model = new ProjectOverviewViewModel({ get } as unknown as ProjectService)

    await model.mount('prj_1')
    expect(model.isUnavailable).toBe(true)
    expect(model.isLoading).toBe(false)
    expect(model.project).toBeNull()
    expect(model.error).toBeNull()

    await model.retry()
    expect(model.error).toBe('offline')
    expect(model.isLoading).toBe(false)
    expect(model.project).toBeNull()
    expect(model.isUnavailable).toBe(false)

    await model.retry()
    expect(model.project).toEqual(project('prj_1'))
    expect(model.isLoading).toBe(false)
    expect(model.error).toBeNull()
    expect(model.isUnavailable).toBe(false)
  })

  it.each([null, undefined, 'unknown failure'])(
    'keeps a rejection of %s distinct from an unavailable project',
    async (failure) => {
      const get = vi.fn().mockRejectedValueOnce(failure)
      const model = new ProjectOverviewViewModel({ get } as unknown as ProjectService)

      await model.mount('prj_1')

      expect(model.error).toBe('Failed to load project.')
      expect(model.isLoading).toBe(false)
      expect(model.project).toBeNull()
      expect(model.isUnavailable).toBe(false)
    },
  )

  it('suppresses stale reads across a route change and after unmount', async () => {
    const first = deferred<Project | null>()
    const second = deferred<Project | null>()
    const get = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const model = new ProjectOverviewViewModel({ get } as unknown as ProjectService)

    const oldMount = model.mount('prj_old')
    const newMount = model.mount('prj_new')
    expect(model.isLoading).toBe(true)
    expect(model.isUnavailable).toBe(false)
    first.resolve(project('prj_old'))
    await oldMount
    expect(model.isLoading).toBe(true)
    expect(model.isUnavailable).toBe(false)
    second.resolve(project('prj_new'))

    await Promise.all([oldMount, newMount])
    expect(model.project).toEqual(project('prj_new'))
    expect(model.isLoading).toBe(false)
    expect(model.error).toBeNull()
    expect(model.isUnavailable).toBe(false)

    const late = deferred<Project | null>()
    get.mockReturnValueOnce(late.promise)
    const lateMount = model.mount('prj_late')
    const abort = vi.spyOn(AbortController.prototype, 'abort')
    model.unmount()
    expect(abort).toHaveBeenCalledOnce()
    const unmountedState = {
      project: model.project,
      error: model.error,
      isLoading: model.isLoading,
      isUnavailable: model.isUnavailable,
    }
    late.resolve(project('prj_late'))
    await lateMount

    expect({
      project: model.project,
      error: model.error,
      isLoading: model.isLoading,
      isUnavailable: model.isUnavailable,
    }).toEqual(unmountedState)
  })
})

describe('ProjectOverviewViewModel request lifecycle', () => {
  it.each(['resolve', 'reject'] as const)(
    'ignores an old %s after remount while the new request is loading',
    async (settle) => {
      const old = deferred<Project | null>()
      const current = deferred<Project | null>()
      const get = vi.fn().mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
      const model = new ProjectOverviewViewModel({ get } as unknown as ProjectService)

      const oldMount = model.mount('prj_old')
      model.unmount()
      const currentMount = model.mount('prj_current')
      if (settle === 'resolve') old.resolve(project('prj_old'))
      else old.reject(new Error('stale failure'))
      await oldMount

      expect(model.isLoading).toBe(true)
      expect(model.isUnavailable).toBe(false)
      current.resolve(project('prj_current'))
      await currentMount
      expect(model.project).toEqual(project('prj_current'))
      expect(model.isLoading).toBe(false)
      expect(model.error).toBeNull()
      expect(model.isUnavailable).toBe(false)
    },
  )

  it('ignores a stale failure after the latest request succeeds', async () => {
    const old = deferred<Project | null>()
    const get = vi.fn().mockReturnValueOnce(old.promise).mockResolvedValueOnce(project('prj_current'))
    const model = new ProjectOverviewViewModel({ get } as unknown as ProjectService)

    const oldMount = model.mount('prj_old')
    await model.mount('prj_current')
    old.reject(new Error('stale failure'))
    await oldMount

    expect(model.project).toEqual(project('prj_current'))
    expect(model.isLoading).toBe(false)
    expect(model.error).toBeNull()
    expect(model.isUnavailable).toBe(false)
  })
})
