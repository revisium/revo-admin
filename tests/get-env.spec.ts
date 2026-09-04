import { afterEach, describe, expect, it, vi } from 'vitest'
import { getEnv } from 'src/shared/lib/getEnv'

const variableName = 'REACT_APP_GET_ENV_TEST_VALUE'

afterEach(() => {
  delete globalThis.__env__
  delete process.env[variableName]
  vi.unstubAllEnvs()
})

describe('getEnv', () => {
  it('prefers the server environment over browser-injected values during SSR', () => {
    process.env[variableName] = 'server-value'
    globalThis.__env__ = { [variableName]: 'browser-value' }

    expect(getEnv(variableName)).toBe('server-value')
  })

  it('uses the build-time value during SSR when the server environment is absent', () => {
    vi.stubEnv(variableName, 'build-value')
    const importMetaEnv = process.env
    let variableReads = 0
    process.env = new Proxy(process.env, {
      get(target, property, receiver) {
        if (property === variableName && variableReads++ === 0) return undefined

        return Reflect.get(target, property, receiver)
      },
    })

    try {
      expect(import.meta.env.SSR).toBe(true)
      expect(getEnv(variableName)).toBe('build-value')
    } finally {
      process.env = importMetaEnv
    }
  })

  it('uses an injected browser value without replacing an empty string', () => {
    vi.stubEnv('SSR', false)
    vi.stubEnv(variableName, 'build-value')
    globalThis.__env__ = { [variableName]: '' }

    expect(import.meta.env.SSR).toBe(false)
    expect(getEnv(variableName)).toBe('')
  })

  it('falls back to the build-time value when no browser value is injected', () => {
    vi.stubEnv('SSR', false)
    vi.stubEnv(variableName, 'build-value')

    expect(getEnv(variableName)).toBe('build-value')
  })
})
