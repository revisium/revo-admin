import { describe, expect, it } from 'vitest'
import { pageInfoOf } from 'src/shared/api'

describe('pageInfoOf', () => {
  it('maps any structural page info source to the shared cursor contract', () => {
    expect(
      pageInfoOf({
        endCursor: undefined,
        hasNextPage: false,
        hasPreviousPage: true,
        startCursor: null,
      }),
    ).toEqual({ endCursor: null, hasNextPage: false, hasPreviousPage: true, startCursor: null })
  })
})
