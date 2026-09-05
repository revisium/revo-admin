import { makeAutoObservable } from 'mobx'
import { ProjectService, type Project, type ProjectListRequest, type ProjectPage } from 'src/entities/project'
import { type CursorPage, type PageInfo } from 'src/shared/api'
import { routes } from 'src/shared/config'
import { ListContinuation, DelayedAction, errorMessageOf, container } from 'src/shared/lib'
import { PROJECT_LIST_STATES } from './types'
import type {
  ProjectListContinuationError,
  ProjectListContinuationState,
  ProjectListItem,
  ProjectListLoadState,
} from './types'

const errorMessage = (error: unknown): string => errorMessageOf(error, 'Failed to load projects.')
const PROJECT_SEARCH_DEBOUNCE_MS = 300
const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const rowOf = (project: Project): ProjectListItem => ({
  id: project.id,
  name: project.name,
  description: project.description,
  href: routes.project(project.id),
  status: project.status,
  statusLabel: project.status === 'archived' ? 'Archived' : 'Active',
  updatedLabel: `Updated ${dateFormatter.format(new Date(project.updatedAt))}`,
})

const listPageOf = (page: ProjectPage): CursorPage<ProjectListItem> => ({
  items: page.items.map(rowOf),
  pageInfo: page.pageInfo,
  totalCount: page.totalCount,
})

export class ProjectListViewModel {
  public query = ''
  public includeArchived = false
  private isQueryPending = false
  private readonly queryAction = new DelayedAction(PROJECT_SEARCH_DEBOUNCE_MS)
  private readonly continuation: ListContinuation<ProjectListItem, ProjectListRequest>

  public constructor(projectService: ProjectService) {
    this.continuation = new ListContinuation(
      async (request) => listPageOf(await projectService.list(request)),
      (pagination) => ({
        ...pagination,
        query: this.query.trim() || undefined,
        includeArchived: this.includeArchived,
      }),
      { skipResetting: true },
    )
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public setup(query = ''): void {
    this.query = query
  }

  public mount(): Promise<void> {
    return this.load()
  }

  public unmount(): void {
    this.queryAction.dispose()
    this.isQueryPending = false
    this.continuation.dispose()
  }

  public get isLoading(): boolean {
    return this.continuation.isLoading
  }

  public get isRefreshing(): boolean {
    return this.continuation.hasLoaded && (this.isQueryPending || this.isLoading)
  }

  public get hasLoaded(): boolean {
    return this.continuation.hasLoaded
  }

  public get state(): ProjectListLoadState {
    if (this.isQueryPending) return PROJECT_LIST_STATES.loading
    return this.continuation.state
  }

  public get error(): string | null {
    if (this.isQueryPending || this.isLoading) return null
    return this.continuation.error ? errorMessage(this.continuation.error) : null
  }

  public get rows(): readonly ProjectListItem[] {
    return this.continuation.items
  }

  public get totalCount(): number {
    return this.continuation.totalCount
  }

  public get cursor(): PageInfo | null {
    return this.continuation.cursor
  }

  public get resultCountLabel(): string | null {
    if (!this.continuation.hasLoaded) return null
    return this.totalCount === 1 ? '1 project' : `${this.totalCount} projects`
  }

  public get isEmpty(): boolean {
    return !this.isRefreshing && this.state === PROJECT_LIST_STATES.ready && this.rows.length === 0
  }

  public get isNoResults(): boolean {
    return this.isEmpty && this.query.trim() !== ''
  }

  public get hasNextPage(): boolean {
    return this.continuation.hasNextPage
  }

  public get isLoadingNextPage(): boolean {
    return this.continuation.isLoadingNextPage
  }

  public get continuationState(): ProjectListContinuationState {
    if (this.isQueryPending || this.isLoading) return PROJECT_LIST_STATES.idle
    if (this.continuation.continuationState === PROJECT_LIST_STATES.loading) return PROJECT_LIST_STATES.loading
    if (this.continuation.continuationState === PROJECT_LIST_STATES.error) return PROJECT_LIST_STATES.error
    return PROJECT_LIST_STATES.idle
  }

  public get continuationError(): ProjectListContinuationError {
    if (this.isQueryPending || this.isLoading) return null
    return this.continuation.continuationError ? errorMessage(this.continuation.continuationError) : null
  }

  public setQuery(query: string): void {
    this.query = query
    this.isQueryPending = true
    this.queryAction.schedule(this.loadPendingQuery)
  }

  public setIncludeArchived(includeArchived: boolean): void {
    this.queryAction.cancel()
    this.isQueryPending = false
    this.includeArchived = includeArchived
    this.load().catch(() => undefined)
  }

  public retry(): Promise<void> {
    return this.load()
  }

  public load(): Promise<void> {
    return this.continuation.load()
  }

  public loadNextPage(): Promise<void> {
    if (this.isQueryPending || this.isLoading) return Promise.resolve()
    return this.continuation.loadNextPage()
  }

  public retryNextPage(): Promise<void> {
    return this.loadNextPage()
  }

  private loadPendingQuery(): void {
    this.isQueryPending = false
    this.load().catch(() => undefined)
  }
}

container.register(ProjectListViewModel, () => new ProjectListViewModel(container.get(ProjectService)), {
  scope: 'transient',
})
