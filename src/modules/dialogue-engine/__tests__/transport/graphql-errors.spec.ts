import { describe, expect, it } from 'vitest'
import { executionError, transportError } from '../../transport/graphql/graphql-error'

describe('Transport recovery classification', () => {
  it('uses structured cursor codes independently of message wording', () => {
    const error = executionError([{ message: 'Reload required.', extensions: { code: 'CURSOR_UNAVAILABLE' } }])

    expect(error.code).toBe('CURSOR_UNAVAILABLE')
    expect(error.recovery).toBe('refresh')
  })

  it('supports the current Core cursor prefix only at the adapter boundary', () => {
    expect(executionError([{ message: 'INVALID_CURSOR: reload dialogue data.' }]).recovery).toBe('refresh')
    expect(executionError([{ message: 'Unknown field cursor.' }]).recovery).toBe('stop')
  })

  it('stops on authorization failures but retries network failures', () => {
    expect(executionError([{ message: 'Sign in.', extensions: { code: 'UNAUTHENTICATED' } }]).recovery).toBe('stop')
    expect(transportError(new TypeError('Failed to fetch')).recovery).toBe('retry')
    expect(transportError({ response: { status: 403 }, message: 'Forbidden' }).recovery).toBe('stop')
  })

  it('ignores malformed extension codes without stringifying protocol objects', () => {
    const error = executionError([{ message: 'Unexpected response.', extensions: { code: { value: 'UNKNOWN' } } }])

    expect(error.code).toBe('GRAPHQL_ERROR')
    expect(error.message).toBe('Unexpected response.')
    expect(error.recovery).toBe('stop')
  })
})
