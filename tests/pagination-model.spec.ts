import { autorun } from 'mobx'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_PAGE_SIZE, type CursorPage } from 'src/shared/api'
import { Pagination } from 'src/shared/lib'

type Item = { readonly id: string }
type Request = { readonly after?: string | null; readonly first?: number; readonly filter?: string }

const page = (
  items: readonly Item[],
  endCursor: string | null,
  hasNextPage: boolean,
  totalCount = items.length,
  hasPreviousPage = endCursor !== null,
): CursorPage<Item> => ({
  items,
  pageInfo: { endCursor, hasNextPage, hasPreviousPage, startCursor: items[0]?.id ?? null },
  totalCount,
})

const deferred = <T>(): { promise: Promise<T>; resolve: (value: T) => void } => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

const sourceOf = (fetchPage: (request: Request) => Promise<CursorPage<Item>>) =>
  new Pagination<Item, Request>(fetchPage, (pagination) => ({ ...pagination, filter: 'all' }))

describe('Pagination', () => {
  it('returns the same rows after moving forward and back', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page([{ id: 'one' }], 'cursor-1', true, 3))
      .mockResolvedValueOnce(page([{ id: 'two' }], 'cursor-2', true, 3))
      .mockResolvedValueOnce(page([{ id: 'one' }], 'cursor-1', true, 3))
    const source = sourceOf(fetchPage)

    await source.loadFirstPage()
    await source.toNextPage()
    await source.toPreviousPage()

    expect(source.items.map(({ id }) => id)).toEqual(['one'])
    expect(source.currentPage).toBe(1)
    expect(fetchPage).toHaveBeenNthCalledWith(3, { after: undefined, first: DEFAULT_PAGE_SIZE, filter: 'all' })
  })

  it('clears the cursor stack when loading the first page with a new filter', async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([{ id: 'one' }], 'cursor-1', true, 2, false))
    const source = sourceOf(fetchPage)

    await source.loadFirstPage()
    await source.toNextPage()
    await source.loadFirstPage()

    expect(source.currentPage).toBe(1)
    expect(source.hasPreviousPage).toBe(false)
    await expect(source.toPreviousPage()).resolves.toBeUndefined()
  })

  it('tracks the current page through next, next, previous', async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([{ id: 'row' }], 'cursor', true, 30))
    const source = sourceOf(fetchPage)

    await source.loadFirstPage()
    await source.toNextPage()
    await source.toNextPage()
    await source.toPreviousPage()

    expect(source.currentPage).toBe(2)
  })

  it('publishes current page changes through MobX reactivity', async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([{ id: 'row' }], 'cursor', true, 30))
    const source = sourceOf(fetchPage)
    const pages: number[] = []
    const dispose = autorun(() => pages.push(source.currentPage))

    await source.loadFirstPage()
    await source.toNextPage()
    await source.toPreviousPage()
    dispose()

    expect(pages).toEqual([1, 2, 1])
  })

  it('ignores stale page responses', async () => {
    const first = deferred<CursorPage<Item>>()
    const second = deferred<CursorPage<Item>>()
    const source = sourceOf(
      vi
        .fn()
        .mockImplementationOnce(() => first.promise)
        .mockImplementationOnce(() => second.promise),
    )

    const firstLoad = source.loadFirstPage()
    const secondLoad = source.loadFirstPage()
    second.resolve(page([{ id: 'new' }], null, false))
    await secondLoad
    first.resolve(page([{ id: 'old' }], null, false))
    await firstLoad

    expect(source.items.map(({ id }) => id)).toEqual(['new'])
  })

  it('preserves the visible page when navigation fails', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page([{ id: 'one' }], 'cursor-1', true))
      .mockRejectedValueOnce(new Error('offline'))
    const source = sourceOf(fetchPage)

    await source.loadFirstPage()
    await source.toNextPage()

    expect(source.items.map(({ id }) => id)).toEqual(['one'])
    expect(source.state).toBe('error')
  })

  it('aborts an in-flight page request on dispose', async () => {
    const pending = deferred<CursorPage<Item>>()
    const source = sourceOf(vi.fn().mockReturnValue(pending.promise))
    const load = source.loadFirstPage()

    source.dispose()
    pending.resolve(page([{ id: 'late' }], null, false))
    await load

    expect(source.items).toEqual([])
  })
})
