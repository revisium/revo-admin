import { GraphQLError } from 'graphql'
import { ClientError } from 'graphql-request'
import { describe, expect, it } from 'vitest'
import { errorMessageOf } from 'src/shared/lib/error-formatting'

const sensitiveRequest = {
  query: 'query Secret($token: String!) { secret(token: $token) }',
  variables: { token: 'TOP_SECRET' },
}

describe('errorMessageOf', () => {
  it.each([
    ['missing errors', { status: 503 }],
    ['an empty errors array', { status: 503, errors: [] }],
    ['a blank first error message', { status: 503, errors: [new GraphQLError('   ')] }],
  ])('sanitizes a real ClientError with %s', (_case, response) => {
    const message = errorMessageOf(new ClientError(response, sensitiveRequest), 'Request failed.')

    expect(message).toBe('GraphQL request failed (status 503).')
    expect(message).not.toContain('query Secret')
    expect(message).not.toContain('TOP_SECRET')
  })

  it('keeps an ordinary Error message', () => {
    expect(errorMessageOf(new Error('offline'), 'Request failed.')).toBe('offline')
  })
})
