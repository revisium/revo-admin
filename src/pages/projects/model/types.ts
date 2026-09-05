export interface ProjectListItem {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly href: string
  readonly status: 'active' | 'archived'
  readonly statusLabel: string
  readonly updatedLabel: string
}

export const PROJECT_LIST_STATES = {
  idle: 'idle',
  loading: 'loading',
  ready: 'ready',
  error: 'error',
} as const

export type ProjectListLoadState = (typeof PROJECT_LIST_STATES)[keyof typeof PROJECT_LIST_STATES]

export type ProjectListContinuationState = Exclude<ProjectListLoadState, (typeof PROJECT_LIST_STATES)['ready']>

export type ProjectListContinuationError = string | null
