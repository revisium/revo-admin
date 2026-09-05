import {
  clampPageSize,
  DEFAULT_PAGE_SIZE,
  type CursorPage,
  type CursorPageRequest,
  type PageInfo,
} from 'src/shared/api'
import { makeAutoObservable, runInAction } from 'mobx'
import { CursorPageLoader, type ListLoadState } from './CursorPageLoader'

export type PaginationOptions = {
  readonly pageSize?: number
}

export class Pagination<T, Request extends CursorPageRequest, E = unknown> {
  private readonly core: CursorPageLoader<T, Request, E>
  private readonly pageSize: number
  private cursorStack: readonly string[] = []
  private _currentPage = 1

  public constructor(
    fetchPage: (request: Request) => Promise<CursorPage<T>>,
    createRequest: (pagination: CursorPageRequest) => Request,
    options: PaginationOptions = {},
  ) {
    this.pageSize = clampPageSize(options.pageSize ?? DEFAULT_PAGE_SIZE)
    this.core = new CursorPageLoader(fetchPage, createRequest)
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get items(): readonly T[] {
    return this.core.items
  }
  public get totalCount(): number {
    return this.core.totalCount
  }
  public get cursor(): PageInfo | null {
    return this.core.cursor
  }
  public get hasNextPage(): boolean {
    return this.core.hasNextPage
  }
  public get hasPreviousPage(): boolean {
    return this.core.hasPreviousPage
  }
  public get isLoading(): boolean {
    return this.core.isLoading
  }
  public get state(): ListLoadState {
    return this.core.state
  }
  public get error(): E | null {
    return this.core.error
  }
  public get currentPage(): number {
    return this._currentPage
  }
  public get totalPage(): number {
    return Math.ceil(this.totalCount / this.pageSize)
  }
  public async loadFirstPage(): Promise<void> {
    this.cursorStack = []
    this._currentPage = 1
    await this.core.loadFirstPage({ first: this.pageSize }, (_current, page) => page)
  }
  public async toNextPage(): Promise<void> {
    const cursor = this.cursor
    if (!this.hasNextPage || !cursor || this.isLoading) return
    const previousCursor = cursor.endCursor
    if (previousCursor === null) return
    const loaded = await this.core.loadPage({ after: previousCursor, first: this.pageSize }, (_current, page) => page)
    if (loaded) {
      runInAction(() => {
        this.cursorStack = [...this.cursorStack, previousCursor]
        this._currentPage += 1
      })
    }
  }
  public async toPreviousPage(): Promise<void> {
    if (!this.hasPreviousPage || this.isLoading) return
    const stack = this.cursorStack.slice(0, -1)
    const after = stack.at(-1) ?? null
    const loaded = await this.core.loadPage(
      { after: after ?? undefined, first: this.pageSize },
      (_current, page) => page,
    )
    if (loaded) {
      runInAction(() => {
        this.cursorStack = stack
        this._currentPage = Math.max(1, this._currentPage - 1)
      })
    }
  }
  public dispose(): void {
    this.core.dispose()
  }
}
