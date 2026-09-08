import { makeAutoObservable, runInAction } from 'mobx'
import { type CursorPage, type CursorPageRequest, type PageInfo } from 'src/shared/api'
import { AbortError, ObservableRequest } from 'src/modules/observable-request'

export type ListLoadState = 'idle' | 'loading' | 'ready' | 'error'
export type ContinuationState = 'idle' | 'loading' | 'error'

type PageMerger<T> = (current: readonly T[], page: readonly T[]) => readonly T[]
type CursorPageLoaderOptions = { readonly skipResetting?: boolean }

export class CursorPageLoader<T, Request extends CursorPageRequest, E = unknown> {
  private _items: readonly T[] = []
  private _totalCount = 0
  private _cursor: PageInfo | null = null
  private _requestVersion = 0
  private _continuationVersion = 0
  private _activeLoadVersion: number | null = null
  private _continuationFailed = false
  private readonly initialRequest: ObservableRequest<CursorPage<T>, [Request], E>
  private readonly continuationRequest: ObservableRequest<CursorPage<T>, [Request], E>

  public constructor(
    private readonly fetchPage: (request: Request) => Promise<CursorPage<T>>,
    private readonly createRequest: (pagination: CursorPageRequest) => Request,
    private readonly options: CursorPageLoaderOptions = {},
  ) {
    this.initialRequest = ObservableRequest.of((request) => this.fetchPage(request), {
      skipResetting: options.skipResetting,
    })
    this.continuationRequest = ObservableRequest.of((request) => this.fetchPage(request))
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get items(): readonly T[] {
    return this._items
  }

  public get totalCount(): number {
    return this._totalCount
  }

  public get cursor(): PageInfo | null {
    return this._cursor
  }

  public get hasNextPage(): boolean {
    return this._cursor?.hasNextPage === true && this._cursor.endCursor !== null
  }

  public get hasPreviousPage(): boolean {
    return this._cursor?.hasPreviousPage === true
  }

  public get isLoading(): boolean {
    return this._activeLoadVersion !== null
  }

  public get hasLoaded(): boolean {
    return this.initialRequest.data !== null
  }

  public get state(): ListLoadState {
    if (this.isLoading) return 'loading'
    if (this.initialRequest.error) return 'error'
    if (this.initialRequest.isLoaded) return 'ready'
    return 'idle'
  }

  public get error(): E | null {
    return this.initialRequest.error
  }

  public get isLoadingNextPage(): boolean {
    return this.continuationRequest.isLoading
  }

  public get continuationState(): ContinuationState {
    if (this.continuationRequest.isLoading) return 'loading'
    if (this._continuationFailed) return 'error'
    return 'idle'
  }

  public get continuationError(): E | null {
    return this._continuationFailed ? this.continuationRequest.error : null
  }

  public async loadFirstPage(pagination: CursorPageRequest, mergeItems: PageMerger<T>): Promise<boolean> {
    return this.loadInitial(pagination, mergeItems, true)
  }

  public async loadPage(pagination: CursorPageRequest, mergeItems: PageMerger<T>): Promise<boolean> {
    return this.loadInitial(pagination, mergeItems, false)
  }

  public async loadContinuation(pagination: CursorPageRequest, mergeItems: PageMerger<T>): Promise<boolean> {
    if (this.isLoading) return false
    const version = ++this._continuationVersion
    this._continuationFailed = false
    const request = this.createRequest(pagination)
    try {
      const result = await this.continuationRequest.fetch(request)
      if (version !== this._continuationVersion || !result.isRight) return false
      runInAction(() => {
        this._items = mergeItems(this._items, result.data.items)
        this._totalCount = result.data.totalCount
        this._cursor = result.data.pageInfo
      })
      return true
    } finally {
      runInAction(() => {
        if (
          version === this._continuationVersion &&
          this.continuationRequest.error &&
          !(this.continuationRequest.error instanceof AbortError)
        ) {
          this._continuationFailed = true
        }
      })
    }
  }

  private async loadInitial(
    pagination: CursorPageRequest,
    mergeItems: PageMerger<T>,
    resetItems: boolean,
  ): Promise<boolean> {
    const version = ++this._requestVersion
    this._activeLoadVersion = version
    this._continuationVersion += 1
    this.continuationRequest.abort()
    this._continuationFailed = false
    if (resetItems && !this.options.skipResetting) {
      this._items = []
      this._totalCount = 0
      this._cursor = null
    }
    const request = this.createRequest(pagination)
    try {
      const result = await this.initialRequest.fetch(request)
      if (version !== this._requestVersion || !result.isRight) return false
      runInAction(() => {
        this._items = mergeItems(this._items, result.data.items)
        this._totalCount = result.data.totalCount
        this._cursor = result.data.pageInfo
      })
      return true
    } finally {
      runInAction(() => {
        if (this._activeLoadVersion === version) this._activeLoadVersion = null
      })
    }
  }

  public dispose(): void {
    this._requestVersion += 1
    this._continuationVersion += 1
    this._activeLoadVersion = null
    this.initialRequest.abort()
    this.continuationRequest.abort()
  }
}
