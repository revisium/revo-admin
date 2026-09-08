import { afterEach, describe, expect, it, vi } from 'vitest'
import { SseLiveness } from '../../transport/graphql/SseLiveness'

afterEach(() => {
  vi.useRealTimers()
})

describe('SSE liveness', () => {
  it('aborts a silent connection but extends the deadline on raw heartbeat bytes', async () => {
    vi.useFakeTimers()
    const liveness = new SseLiveness()
    liveness.touch()
    await vi.advanceTimersByTimeAsync(44000)

    expect(liveness.signal.aborted).toBe(false)

    liveness.touch()
    await vi.advanceTimersByTimeAsync(44000)

    expect(liveness.signal.aborted).toBe(false)

    await vi.advanceTimersByTimeAsync(1001)

    expect(liveness.signal.aborted).toBe(true)

    liveness.dispose()
  })

  it('clears the watchdog on disposal', async () => {
    vi.useFakeTimers()
    const liveness = new SseLiveness()
    liveness.touch()
    liveness.dispose()
    await vi.advanceTimersByTimeAsync(90000)

    expect(liveness.signal.aborted).toBe(false)
  })
})
