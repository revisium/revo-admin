export type Cursor = string | null

export type PageInfo = {
  readonly endCursor: Cursor
  readonly hasNextPage: boolean
  readonly hasPreviousPage: boolean
  readonly startCursor: Cursor
}

export type PageInfoSource = {
  readonly endCursor?: string | null
  readonly hasNextPage: boolean
  readonly hasPreviousPage: boolean
  readonly startCursor?: string | null
}

export const pageInfoOf = (pageInfo: PageInfoSource): PageInfo => ({
  endCursor: pageInfo.endCursor ?? null,
  hasNextPage: pageInfo.hasNextPage,
  hasPreviousPage: pageInfo.hasPreviousPage,
  startCursor: pageInfo.startCursor ?? null,
})

export type CursorPage<T> = {
  readonly items: readonly T[]
  readonly pageInfo: PageInfo
  readonly totalCount: number
}

export type CursorPageRequest = {
  readonly after?: Cursor
  readonly first?: number
}

export const DEFAULT_PAGE_SIZE = 10
export const MIN_PAGE_SIZE = 1
export const MAX_PAGE_SIZE = 100

export const clampPageSize = (pageSize: number): number => {
  if (!Number.isFinite(pageSize)) return DEFAULT_PAGE_SIZE
  return Math.min(Math.max(Math.trunc(pageSize), MIN_PAGE_SIZE), MAX_PAGE_SIZE)
}
