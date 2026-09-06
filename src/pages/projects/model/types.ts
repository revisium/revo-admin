export interface ProjectListItem {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly href: string
  readonly status: 'active' | 'archived'
  readonly statusLabel: string
  readonly updatedLabel: string
}
