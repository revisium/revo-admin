import type { CursorPage, CursorPageRequest } from 'src/shared/api'

export type ProjectStatus = 'active' | 'archived'

export interface Project {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly status: ProjectStatus
  readonly createdAt: string
  readonly updatedAt: string
}

export type ProjectPage = CursorPage<Project>

export type ProjectListRequest = CursorPageRequest & {
  readonly query?: string
  readonly includeArchived?: boolean
}
