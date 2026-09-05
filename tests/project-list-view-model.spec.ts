import { describe, expect, it, vi } from 'vitest'
import { ProjectListViewModel } from 'src/pages/projects/model/ProjectListViewModel'
import { PROJECT_LIST_STATES } from 'src/pages/projects/model/types'
import type { ProjectPage, ProjectService } from 'src/entities/project'
import { DEFAULT_PAGE_SIZE } from 'src/shared/api'
import { container } from 'src/shared/lib/DIContainer'

const page = (overrides: Partial<ProjectPage> = {}): ProjectPage => ({
  items: [
    {
      id: 'prj_orch',
      name: 'Orchestrator',
      description: 'Host',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    },
  ],
  pageInfo: { endCursor: 'cursor-1', hasNextPage: false, hasPreviousPage: false, startCursor: 'cursor-1' },
  totalCount: 1,
  ...overrides,
})

const deferred = <T>(): { promise: Promise<T>; resolve: (value: T) => void } => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

describe('ProjectListViewModel', () => {
  it('resolves from the container with an injected project service', () => {
    expect(container.get(ProjectListViewModel)).toBeInstanceOf(ProjectListViewModel)
  })

  it('loads a page and exposes render-ready rows', async () => {
    const list = vi.fn().mockResolvedValue(page())
    const model = new ProjectListViewModel({ list } as unknown as ProjectService)
    await model.mount()
    expect(list).toHaveBeenCalledWith({
      after: undefined,
      first: DEFAULT_PAGE_SIZE,
      query: undefined,
      includeArchived: false,
    })
    expect(model.rows[0]).toEqual({
      id: 'prj_orch',
      name: 'Orchestrator',
      description: 'Host',
      href: '/projects/prj_orch',
      status: 'active',
      statusLabel: 'Active',
      updatedLabel: 'Updated Feb 1, 2026',
    })
    expect(model.resultCountLabel).toBe('1 project')
    expect(model.cursor?.endCursor).toBe('cursor-1')
  })

  it('distinguishes idle and loading from a ready empty result', async () => {
    const pending = deferred<ProjectPage>()
    const model = new ProjectListViewModel({
      list: vi.fn().mockReturnValue(pending.promise),
    } as unknown as ProjectService)

    expect(model.state).toBe(PROJECT_LIST_STATES.idle)
    expect(model.isEmpty).toBe(false)
    expect(model.resultCountLabel).toBeNull()

    const load = model.mount()
    expect(model.state).toBe(PROJECT_LIST_STATES.loading)
    expect(model.isEmpty).toBe(false)
    expect(model.resultCountLabel).toBeNull()

    pending.resolve(
      page({
        items: [],
        pageInfo: { endCursor: null, hasNextPage: false, hasPreviousPage: false, startCursor: null },
        totalCount: 0,
      }),
    )
    await load

    expect(model.state).toBe(PROJECT_LIST_STATES.ready)
    expect(model.isEmpty).toBe(true)
    expect(model.resultCountLabel).toBe('0 projects')
  })

  it('passes query and archive filter, and retries failures', async () => {
    const list = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(page())
    const model = new ProjectListViewModel({ list } as unknown as ProjectService)
    model.setQuery('schema')
    await vi.waitFor(() => expect(model.state).toBe(PROJECT_LIST_STATES.error))
    expect(model.error).toBe('offline')
    model.setIncludeArchived(true)
    await vi.waitFor(() => expect(model.state).toBe(PROJECT_LIST_STATES.ready))
    expect(list).toHaveBeenLastCalledWith({
      after: undefined,
      first: DEFAULT_PAGE_SIZE,
      query: 'schema',
      includeArchived: true,
    })
  })

  it('debounces query changes', async () => {
    vi.useFakeTimers()
    const list = vi.fn().mockResolvedValue(page())
    const model = new ProjectListViewModel({ list } as unknown as ProjectService)

    model.setQuery('sch')
    model.setQuery('schema')
    expect(list).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(300)
    await vi.waitFor(() => expect(list).toHaveBeenCalledTimes(1))
    expect(list).toHaveBeenCalledWith({
      after: undefined,
      first: DEFAULT_PAGE_SIZE,
      query: 'schema',
      includeArchived: false,
    })
    vi.useRealTimers()
  })

  it('keeps loaded results visible through pending and active search refresh states', async () => {
    vi.useFakeTimers()
    const refresh = deferred<ProjectPage>()
    const list = vi.fn().mockResolvedValueOnce(page()).mockReturnValueOnce(refresh.promise)
    const model = new ProjectListViewModel({ list } as unknown as ProjectService)

    await model.mount()
    model.setQuery('updated')

    expect(model.isRefreshing).toBe(true)
    expect(model.rows[0]?.id).toBe('prj_orch')
    expect(model.resultCountLabel).toBe('1 project')

    await vi.advanceTimersByTimeAsync(300)

    expect(model.isRefreshing).toBe(true)
    expect(model.rows[0]?.id).toBe('prj_orch')

    refresh.resolve(page({ items: [{ ...page().items[0], id: 'updated' }] }))
    await vi.waitFor(() => expect(model.isRefreshing).toBe(false))

    expect(model.rows[0]?.id).toBe('updated')
    vi.useRealTimers()
  })

  it('does not present a previous empty search as the result of a pending query', async () => {
    vi.useFakeTimers()
    const refresh = deferred<ProjectPage>()
    const emptyPage = page({
      items: [],
      pageInfo: { endCursor: null, hasNextPage: false, hasPreviousPage: false, startCursor: null },
      totalCount: 0,
    })
    const list = vi.fn().mockResolvedValueOnce(emptyPage).mockReturnValueOnce(refresh.promise)
    const model = new ProjectListViewModel({ list } as unknown as ProjectService)
    model.setup('missing')
    await model.mount()

    expect(model.isNoResults).toBe(true)

    model.setQuery('new query')

    expect(model.isRefreshing).toBe(true)
    expect(model.isNoResults).toBe(false)
    expect(model.resultCountLabel).toBe('0 projects')

    await vi.advanceTimersByTimeAsync(300)
    expect(model.isNoResults).toBe(false)

    refresh.resolve(emptyPage)
    await vi.waitFor(() => expect(model.isRefreshing).toBe(false))

    expect(model.isNoResults).toBe(true)
    vi.useRealTimers()
  })

  it('masks a stale initial error while a debounced query is pending', async () => {
    vi.useFakeTimers()
    const model = new ProjectListViewModel({
      list: vi.fn().mockRejectedValue(new Error('stale initial error')),
    } as unknown as ProjectService)

    await model.mount()
    expect(model.state).toBe(PROJECT_LIST_STATES.error)
    expect(model.error).toBe('stale initial error')

    model.setQuery('retry')

    expect(model.state).toBe(PROJECT_LIST_STATES.loading)
    expect(model.error).toBeNull()

    model.unmount()
    vi.useRealTimers()
  })

  it('masks a stale continuation error while a new query is pending', async () => {
    vi.useFakeTimers()
    const list = vi
      .fn()
      .mockResolvedValueOnce(
        page({
          pageInfo: { endCursor: 'old-cursor', hasNextPage: true, hasPreviousPage: false, startCursor: 'old-cursor' },
        }),
      )
      .mockRejectedValueOnce(new Error('stale continuation error'))
    const model = new ProjectListViewModel({ list } as unknown as ProjectService)

    await model.mount()
    await model.loadNextPage()
    expect(model.continuationState).toBe(PROJECT_LIST_STATES.error)

    model.setQuery('new result')

    expect(model.continuationState).toBe(PROJECT_LIST_STATES.idle)
    expect(model.continuationError).toBeNull()

    model.unmount()
    vi.useRealTimers()
  })

  it('does not load an old-cursor continuation while a debounced refresh is pending', async () => {
    vi.useFakeTimers()
    const list = vi.fn().mockResolvedValue(
      page({
        pageInfo: { endCursor: 'old-cursor', hasNextPage: true, hasPreviousPage: false, startCursor: 'old-cursor' },
      }),
    )
    const model = new ProjectListViewModel({ list } as unknown as ProjectService)

    await model.mount()
    model.setQuery('new result')
    await model.loadNextPage()

    expect(list).toHaveBeenCalledTimes(1)

    model.unmount()
    vi.useRealTimers()
  })

  it('cancels a pending query debounce when the archive filter changes', async () => {
    vi.useFakeTimers()
    const list = vi.fn().mockResolvedValue(page())
    const model = new ProjectListViewModel({ list } as unknown as ProjectService)

    model.setQuery('schema')
    model.setIncludeArchived(true)
    await vi.waitFor(() => expect(list).toHaveBeenCalledTimes(1))
    await vi.advanceTimersByTimeAsync(300)

    expect(list).toHaveBeenCalledTimes(1)
    expect(list).toHaveBeenCalledWith({
      after: undefined,
      first: DEFAULT_PAGE_SIZE,
      query: 'schema',
      includeArchived: true,
    })
    vi.useRealTimers()
  })

  it('keeps loaded results visible while the archive filter refresh is pending', async () => {
    const refresh = deferred<ProjectPage>()
    const list = vi.fn().mockResolvedValueOnce(page()).mockReturnValueOnce(refresh.promise)
    const model = new ProjectListViewModel({ list } as unknown as ProjectService)

    await model.mount()
    model.setIncludeArchived(true)

    expect(model.isRefreshing).toBe(true)
    expect(model.rows[0]?.id).toBe('prj_orch')
    expect(model.resultCountLabel).toBe('1 project')

    refresh.resolve(page())
    await vi.waitFor(() => expect(model.isRefreshing).toBe(false))
  })

  it('loads the next cursor page and appends rows', async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce(
        page({
          pageInfo: { endCursor: 'cursor-1', hasNextPage: true, hasPreviousPage: false, startCursor: 'cursor-1' },
        }),
      )
      .mockResolvedValueOnce(
        page({
          items: [
            {
              id: 'prj_two',
              name: 'Two',
              description: '',
              status: 'active',
              createdAt: '2026-01-02T00:00:00.000Z',
              updatedAt: '2026-02-02T00:00:00.000Z',
            },
          ],
          pageInfo: { endCursor: 'cursor-2', hasNextPage: false, hasPreviousPage: true, startCursor: 'cursor-1' },
          totalCount: 2,
        }),
      )
    const model = new ProjectListViewModel({ list } as unknown as ProjectService)
    await model.mount()
    await model.loadNextPage()
    expect(list).toHaveBeenLastCalledWith({
      after: 'cursor-1',
      first: DEFAULT_PAGE_SIZE,
      query: undefined,
      includeArchived: false,
    })
    expect(model.rows.map((row) => row.id)).toEqual(['prj_orch', 'prj_two'])
    expect(model.hasNextPage).toBe(false)
  })

  it('keeps loaded rows while a continuation request fails and retries it', async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce(
        page({
          pageInfo: { endCursor: 'cursor-1', hasNextPage: true, hasPreviousPage: false, startCursor: 'cursor-1' },
        }),
      )
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(
        page({
          items: [],
          pageInfo: { endCursor: 'cursor-2', hasNextPage: false, hasPreviousPage: true, startCursor: 'cursor-1' },
          totalCount: 1,
        }),
      )
    const model = new ProjectListViewModel({ list } as unknown as ProjectService)

    await model.mount()
    await model.loadNextPage()

    expect(model.rows).toHaveLength(1)
    expect(model.continuationState).toBe(PROJECT_LIST_STATES.error)
    expect(model.continuationError).toBe('offline')

    await model.retryNextPage()

    expect(model.continuationState).toBe(PROJECT_LIST_STATES.idle)
    expect(model.rows).toHaveLength(1)
    expect(list).toHaveBeenLastCalledWith({
      after: 'cursor-1',
      first: DEFAULT_PAGE_SIZE,
      query: undefined,
      includeArchived: false,
    })
  })

  it('does not let an older load replace a newer filter result', async () => {
    vi.useFakeTimers()
    const first = deferred<ProjectPage>()
    const second = deferred<ProjectPage>()
    const list = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)
    const model = new ProjectListViewModel({ list } as unknown as ProjectService)

    const firstLoad = model.load()
    model.setQuery('newer')
    await vi.advanceTimersByTimeAsync(300)
    expect(model.totalCount).toBe(0)
    expect(model.cursor).toBeNull()
    first.resolve(page({ items: [{ ...page().items[0], id: 'older' }] }))
    await firstLoad

    expect(model.isLoading).toBe(true)
    expect(model.state).toBe(PROJECT_LIST_STATES.loading)
    second.resolve(page({ items: [{ ...page().items[0], id: 'newer' }] }))
    await vi.waitFor(() => expect(model.rows[0]?.id).toBe('newer'))
    expect(model.rows[0]?.id).toBe('newer')
    vi.useRealTimers()
  })

  it('aborts the request when unmounted', async () => {
    const pending = deferred<ProjectPage>()
    const model = new ProjectListViewModel({
      list: vi.fn().mockReturnValue(pending.promise),
    } as unknown as ProjectService)
    const load = model.mount()

    model.unmount()
    pending.resolve(page({ items: [{ ...page().items[0], id: 'late' }] }))
    await load

    expect(model.rows).toEqual([])
  })
})
