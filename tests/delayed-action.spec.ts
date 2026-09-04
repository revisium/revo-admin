import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DelayedAction } from 'src/shared/lib/DelayedAction'

describe('DelayedAction', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs the action after the delay', () => {
    const action = vi.fn()
    new DelayedAction(200).schedule(action)

    expect(action).not.toHaveBeenCalled()

    vi.advanceTimersByTime(200)

    expect(action).toHaveBeenCalledTimes(1)
  })

  it('keeps only the last scheduled action', () => {
    const first = vi.fn()
    const second = vi.fn()
    const delayed = new DelayedAction(200)

    delayed.schedule(first)
    vi.advanceTimersByTime(100)
    delayed.schedule(second)
    vi.advanceTimersByTime(200)

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('cancels a pending action', () => {
    const action = vi.fn()
    const delayed = new DelayedAction(200)

    delayed.schedule(action)
    delayed.cancel()
    vi.advanceTimersByTime(200)

    expect(action).not.toHaveBeenCalled()
  })

  it('tolerates cancelling when nothing is pending', () => {
    const delayed = new DelayedAction(200)

    expect(() => {
      delayed.cancel()
      delayed.cancel()
    }).not.toThrow()
  })

  it('drops a pending action on dispose', () => {
    const action = vi.fn()
    const delayed = new DelayedAction(200)

    delayed.schedule(action)
    delayed.dispose()
    vi.advanceTimersByTime(200)

    expect(action).not.toHaveBeenCalled()
  })

  it('can schedule again after dispose', () => {
    const action = vi.fn()
    const delayed = new DelayedAction(200)

    delayed.dispose()
    delayed.schedule(action)
    vi.advanceTimersByTime(200)

    expect(action).toHaveBeenCalledTimes(1)
  })
})
