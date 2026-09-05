import { clampPageSize, DEFAULT_PAGE_SIZE, type CursorPage, type CursorPageRequest } from 'src/shared/api'
import { CursorPageLoader, type ContinuationState, type ListLoadState } from './CursorPageLoader'

export type ListContinuationOptions = {
  readonly pageSize?: number
  readonly skipResetting?: boolean
}

export class ListContinuation<T, Request extends CursorPageRequest, E = unknown> {
  private readonly core: CursorPageLoader<T, Request, E>
  private readonly pageSize: number

  public constructor(
    fetchPage: (request: Request) => Promise<CursorPage<T>>,
    createRequest: (pagination: CursorPageRequest) => Request,
    options: ListContinuationOptions = {},
  ) {
    this.pageSize = clampPageSize(options.pageSize ?? DEFAULT_PAGE_SIZE)
    this.core = new CursorPageLoader(fetchPage, createRequest, { skipResetting: options.skipResetting })
  }

  public get items(): readonly T[] {
    return this.core.items
  }
  public get totalCount(): number {
    return this.core.totalCount
  }
  public get cursor() {
    return this.core.cursor
  }
  public get hasNextPage(): boolean {
    return this.core.hasNextPage
  }
  public get isLoading(): boolean {
    return this.core.isLoading
  }
  public get hasLoaded(): boolean {
    return this.core.hasLoaded
  }
  public get state(): ListLoadState {
    return this.core.state
  }
  public get error(): E | null {
    return this.core.error
  }
  public get isLoadingNextPage(): boolean {
    return this.core.isLoadingNextPage
  }
  public get continuationState(): ContinuationState {
    return this.core.continuationState
  }
  public get continuationError(): E | null {
    return this.core.continuationError
  }
  public async load(): Promise<void> {
    await this.core.loadFirstPage({ first: this.pageSize }, (_current, page) => page)
  }
  public async loadNextPage(): Promise<void> {
    const request =
      this.core.cursor && this.core.hasNextPage ? { after: this.core.cursor.endCursor, first: this.pageSize } : null
    if (!request || this.core.isLoadingNextPage) return
    await this.core.loadContinuation(request, (current, page) => [...current, ...page])
  }
  public dispose(): void {
    this.core.dispose()
  }
}
