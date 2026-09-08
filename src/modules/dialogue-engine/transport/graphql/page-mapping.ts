import type { Page, SnapshotPage } from '../../contracts/page.types'

interface Connection<T> {
  readonly edges: readonly { readonly node: T }[]
  readonly pageInfo: { readonly hasNextPage: boolean; readonly endCursor?: string | null }
}

export function pageOf<T>(connection: Connection<T>): Page<T> {
  return {
    items: connection.edges.map(({ node }) => node),
    next: connection.pageInfo.hasNextPage ? (connection.pageInfo.endCursor ?? undefined) : undefined,
  }
}

export function snapshotOf<T>(
  connection: Connection<T> & { snapshotCursor: string; totalCount: number },
): SnapshotPage<T> {
  return { ...pageOf(connection), snapshot: connection.snapshotCursor, total: connection.totalCount }
}
