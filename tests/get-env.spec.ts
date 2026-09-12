import { afterEach, describe, expect, it, vi } from 'vitest'
import { getEnv } from 'src/shared/lib/getEnv'

const variableName = 'REACT_APP_GET_ENV_TEST_VALUE'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getEnv', () => {
  it('reads a public build-time value from import.meta.env', () => {
    vi.stubEnv(variableName, 'build-value')

    expect(getEnv(variableName)).toBe('build-value')
  })

  it('returns undefined when the public build-time value is absent', () => {
    expect(getEnv(variableName)).toBeUndefined()
  })
})
