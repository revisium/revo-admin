import { describe, expect, it } from 'vitest'
import { SystemHealthViewModel } from 'src/entities/system-status/model/SystemHealthViewModel'

describe('SystemHealthViewModel', () => {
  it('adapts systemInfo without inventing unavailable host details', () => {
    const health = new SystemHealthViewModel({ name: 'revo-core', status: 'ok' })

    expect(health.isOnline).toBe(true)
    expect(health.hostLabel).toBe('revo-core')
    expect(health.metaValue).toBe('ok')
    expect(health.stats).toEqual([{ key: 'system', label: 'system', value: 'revo-core', tone: 'success', mono: true }])
    expect(health.issues).toEqual([
      'Detailed daemon, doctor, and project metadata is unavailable in the systemInfo contract.',
    ])
  })
})
