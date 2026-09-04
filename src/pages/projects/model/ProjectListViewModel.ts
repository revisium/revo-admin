import { makeAutoObservable } from 'mobx'
import { PROJECTS, type ProjectRow } from 'src/shared/fixtures'
import { container } from 'src/shared/lib/DIContainer'

export interface ProjectListCounter {
  readonly id: string
  readonly label: string
}

export interface ProjectListRow {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly href: string
  readonly status: 'active' | 'archived'
  readonly statusLabel: string
  readonly updatedLabel: string
  readonly workspaces: readonly string[]
  readonly extraWorkspaceCount: number
  readonly counters: readonly ProjectListCounter[]
}

const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const countersOf = (project: ProjectRow): readonly ProjectListCounter[] => [
  { id: 'runs', label: `Runs ${project.stats.runs}` },
  { id: 'adrs', label: `ADRs ${project.stats.adrs}` },
  { id: 'kb', label: `KB ${project.stats.kb}` },
  { id: 'memory', label: `Memory ${project.stats.tables}` },
]

const rowOf = (project: ProjectRow): ProjectListRow => ({
  id: project.id,
  name: project.name,
  description: project.description,
  href: `/projects/${project.id}`,
  status: 'active',
  statusLabel: 'Active',
  updatedLabel: `Updated ${dateFormatter.format(new Date(project.updatedAt))}`,
  workspaces: project.repos,
  extraWorkspaceCount: 0,
  counters: countersOf(project),
})

export class ProjectListViewModel {
  public query = ''
  public includeArchived = false

  public constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public setup(query = ''): void {
    this.query = query
  }

  public get rows(): readonly ProjectListRow[] {
    const query = this.query.trim().toLocaleLowerCase()

    return PROJECTS.filter((project) => {
      if (query === '') return true

      return `${project.name} ${project.id} ${project.key}`.toLocaleLowerCase().includes(query)
    }).map(rowOf)
  }

  public get totalCount(): number {
    return this.rows.length
  }

  public get resultCountLabel(): string {
    return this.totalCount === 1 ? '1 project' : `${this.totalCount} projects`
  }

  public get isEmpty(): boolean {
    return this.rows.length === 0
  }

  public get isNoResults(): boolean {
    return this.isEmpty && this.query.trim() !== ''
  }

  public setQuery(query: string): void {
    this.query = query
  }

  public setIncludeArchived(includeArchived: boolean): void {
    this.includeArchived = includeArchived
  }
}

container.register(ProjectListViewModel, () => new ProjectListViewModel(), { scope: 'transient' })
