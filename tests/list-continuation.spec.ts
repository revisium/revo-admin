import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_PAGE_SIZE, type CursorPage } from 'src/shared/api'
import { ListContinuation } from 'src/shared/lib'
import { CursorPageLoader } from 'src/shared/lib/pagination/CursorPageLoader'

type Item = { readonly id: string }
type Request = { readonly after?: string | null; readonly first?: number }

const page = (
  items: readonly Item[],
  endCursor: string | null,
  hasNextPage: boolean,
  totalCount = items.length,
): CursorPage<Item> => ({
  items,
  pageInfo: { endCursor, hasNextPage, hasPreviousPage: endCursor !== null, startCursor: items[0]?.id ?? null },
  totalCount,
})

const deferred = <T>(): { promise: Promise<T>; resolve: (value: T) => void } => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

describe('ListContinuation', () => {
  it('uses one clamped page size for initial and continuation requests', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page([{ id: 'one' }], 'cursor-1', true, 2))
      .mockResolvedValueOnce(page([{ id: 'two' }], null, false, 2))
    const source = new ListContinuation<Item, Request>(fetchPage, (request) => request, { pageSize: 200 })

    await source.load()
    await source.loadNextPage()

    expect(fetchPage).toHaveBeenNthCalledWith(1, { first: 100 })
    expect(fetchPage).toHaveBeenNthCalledWith(2, { after: 'cursor-1', first: 100 })
  })

  it('does not invalidate an initial request when continuation is started directly', async () => {
    const first = deferred<CursorPage<Item>>()
    const second = deferred<CursorPage<Item>>()
    const loader = new CursorPageLoader<Item, Request>(
      vi
        .fn()
        .mockImplementationOnce(() => first.promise)
        .mockImplementationOnce(() => second.promise),
      (request) => request,
    )

    const initial = loader.loadFirstPage({ first: 50 }, (_current, rows) => rows)
    const continuation = loader.loadContinuation({ after: 'cursor-1', first: 50 }, (current, rows) => [
      ...current,
      ...rows,
    ])
    second.resolve(page([{ id: 'next' }], null, false))
    await continuation
    first.resolve(page([{ id: 'first' }], 'cursor-1', true))
    await initial

    expect(loader.items.map(({ id }) => id)).toEqual(['first'])
  })

  it('loads the first page and appends the next page', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page([{ id: 'one' }], 'cursor-1', true, 2))
      .mockResolvedValueOnce(page([{ id: 'two' }], null, false, 2))
    const source = new ListContinuation<Item, Request>(fetchPage, (request) => request)

    await source.load()
    await source.loadNextPage()

    expect(fetchPage).toHaveBeenNthCalledWith(1, { first: DEFAULT_PAGE_SIZE })
    expect(fetchPage).toHaveBeenNthCalledWith(2, { after: 'cursor-1', first: DEFAULT_PAGE_SIZE })
    expect(source.items.map(({ id }) => id)).toEqual(['one', 'two'])
    expect(source.totalCount).toBe(2)
    expect(source.hasNextPage).toBe(false)
  })

  it('keeps the current first page visible while a preserving reload is pending', async () => {
    const refresh = deferred<CursorPage<Item>>()
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page([{ id: 'current' }], null, false))
      .mockReturnValueOnce(refresh.promise)
    const source = new ListContinuation<Item, Request>(fetchPage, (request) => request, {
      skipResetting: true,
    })

    await source.load()
    const refreshing = source.load()

    expect(source.hasLoaded).toBe(true)
    expect(source.isLoading).toBe(true)
    expect(source.items).toEqual([{ id: 'current' }])

    refresh.resolve(page([{ id: 'updated' }], null, false))
    await refreshing

    expect(source.items).toEqual([{ id: 'updated' }])
  })

  it('does not mix an old-cursor continuation into a newer first-page refresh', async () => {
    const refresh = deferred<CursorPage<Item>>()
    const oldContinuation = deferred<CursorPage<Item>>()
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page([{ id: 'old-first' }], 'old-cursor', true, 2))
      .mockReturnValueOnce(refresh.promise)
      .mockReturnValueOnce(oldContinuation.promise)
    const source = new ListContinuation<Item, Request>(fetchPage, (request) => request, {
      skipResetting: true,
    })

    await source.load()
    const refreshing = source.load()
    const loadingOldContinuation = source.loadNextPage()

    refresh.resolve(page([{ id: 'new-first' }], 'new-cursor', true, 2))
    await refreshing
    oldContinuation.resolve(page([{ id: 'old-second' }], null, false, 2))
    await loadingOldContinuation

    expect(fetchPage).toHaveBeenCalledTimes(2)
    expect(source.items).toEqual([{ id: 'new-first' }])
    expect(source.cursor?.endCursor).toBe('new-cursor')
  })

  it('does not report a next page when the end cursor is null', async () => {
    const source = new ListContinuation<Item, Request>(
      vi.fn().mockResolvedValue(page([{ id: 'one' }], null, true)),
      (request) => request,
    )

    await source.load()
    await source.loadNextPage()

    expect(source.hasNextPage).toBe(false)
    expect(source.items).toHaveLength(1)
  })

  it('exposes initial load errors and continuation errors independently', async () => {
    const fetchPage = vi
      .fn()
      .mockRejectedValueOnce(new Error('initial'))
      .mockResolvedValueOnce(page([{ id: 'one' }], 'cursor-1', true))
      .mockRejectedValueOnce(new Error('next'))
    const source = new ListContinuation<Item, Request>(fetchPage, (request) => request)

    await source.load()
    expect(source.state).toBe('error')
    expect(source.error).toBeInstanceOf(Error)

    await source.load()
    await source.loadNextPage()
    expect(source.items).toHaveLength(1)
    expect(source.continuationState).toBe('error')
    expect(source.continuationError).toBeInstanceOf(Error)
  })

  it('ignores a stale response', async () => {
    const first = deferred<CursorPage<Item>>()
    const second = deferred<CursorPage<Item>>()
    const source = new ListContinuation<Item, Request>(
      vi
        .fn()
        .mockImplementationOnce(() => first.promise)
        .mockImplementationOnce(() => second.promise),
      (request) => request,
    )

    const firstLoad = source.load()
    const secondLoad = source.load()
    second.resolve(page([{ id: 'new' }], null, false))
    await secondLoad
    first.resolve(page([{ id: 'old' }], null, false))
    await firstLoad

    expect(source.items.map(({ id }) => id)).toEqual(['new'])
  })

  it('allows a new continuation before an aborted continuation promise settles', async () => {
    const staleContinuation = deferred<CursorPage<Item>>()
    const currentContinuation = deferred<CursorPage<Item>>()
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page([{ id: 'old-first' }], 'old-cursor', true, 2))
      .mockReturnValueOnce(staleContinuation.promise)
      .mockResolvedValueOnce(page([{ id: 'new-first' }], 'new-cursor', true, 2))
      .mockReturnValueOnce(currentContinuation.promise)
    const source = new ListContinuation<Item, Request>(fetchPage, (request) => request)

    await source.load()
    const staleLoad = source.loadNextPage()
    expect(source.isLoadingNextPage).toBe(true)

    await source.load()
    expect(source.isLoadingNextPage).toBe(false)
    expect(source.continuationState).toBe('idle')

    const currentLoad = source.loadNextPage()
    expect(fetchPage).toHaveBeenNthCalledWith(4, { after: 'new-cursor', first: DEFAULT_PAGE_SIZE })
    expect(source.isLoadingNextPage).toBe(true)

    currentContinuation.resolve(page([{ id: 'new-second' }], null, false, 2))
    await currentLoad
    staleContinuation.resolve(page([{ id: 'old-second' }], null, false, 2))
    await staleLoad

    expect(source.items.map(({ id }) => id)).toEqual(['new-first', 'new-second'])
  })

  it('aborts in-flight requests on dispose', async () => {
    const request = deferred<CursorPage<Item>>()
    const source = new ListContinuation<Item, Request>(vi.fn().mockReturnValue(request.promise), (value) => value)
    const load = source.load()

    source.dispose()
    request.resolve(page([{ id: 'late' }], null, false))
    await load

    expect(source.items).toEqual([])
  })
})
