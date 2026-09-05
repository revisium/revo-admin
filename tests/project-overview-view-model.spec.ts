import { describe, expect, it, vi } from 'vitest'
import { ProjectOverviewViewModel } from 'src/pages/project-overview/model/ProjectOverviewViewModel'
import type { Project, ProjectService } from 'src/entities/project'

type Deferred<T> = {
  readonly promise: Promise<T>
  resolve: (value: T) => void
}

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
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
  it('keeps SSR setup idle, then loads the route project on mount', async () => {
    const get = vi.fn().mockResolvedValue(project('prj_1'))
    const model = new ProjectOverviewViewModel({ get } as unknown as ProjectService)

    model.setup('prj_1')
    expect(model.state).toEqual({ kind: 'idle' })
    expect(get).not.toHaveBeenCalled()

    await model.mount('prj_1')

    expect(get).toHaveBeenCalledWith('prj_1')
    expect(model.state).toEqual({ kind: 'ready', project: project('prj_1') })
  })

  it('maps null to unavailable and a rejected request to a safe retryable error', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(project('prj_1'))
    const model = new ProjectOverviewViewModel({ get } as unknown as ProjectService)

    await model.mount('prj_1')
    expect(model.state).toEqual({ kind: 'unavailable' })

    await model.retry()
    expect(model.state).toEqual({ kind: 'error', message: 'offline' })

    await model.retry()
    expect(model.state).toEqual({ kind: 'ready', project: project('prj_1') })
  })

  it('suppresses stale reads across a route change and after unmount', async () => {
    const first = deferred<Project | null>()
    const second = deferred<Project | null>()
    const get = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const model = new ProjectOverviewViewModel({ get } as unknown as ProjectService)

    const oldMount = model.mount('prj_old')
    const newMount = model.mount('prj_new')
    first.resolve(project('prj_old'))
    second.resolve(project('prj_new'))

    await Promise.all([oldMount, newMount])
    expect(model.state).toEqual({ kind: 'ready', project: project('prj_new') })

    const late = deferred<Project | null>()
    get.mockReturnValueOnce(late.promise)
    const lateMount = model.mount('prj_late')
    model.unmount()
    late.resolve(project('prj_late'))
    await lateMount

    expect(model.state).toEqual({ kind: 'loading' })
  })
})
