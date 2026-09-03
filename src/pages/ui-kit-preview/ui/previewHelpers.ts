import { useEffect, useRef, useState } from 'react'

export const noOp = () => {}

// Shared by demo controls that flip a busy/open flag on, then flip it back off after a fixed
// delay — the "busy demo" idiom repeated across this preview page. `trigger`'s optional
// `onComplete` lets a caller run one more state change (for example closing a dialog) exactly
// when the flag resets, without duplicating the timer bookkeeping at the call site.
export const useTimedFlag = (durationMs: number) => {
  const [active, setActive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const trigger = (onComplete?: () => void) => {
    setActive(true)

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setActive(false)
      timerRef.current = null
      onComplete?.()
    }, durationMs)
  }

  return [active, trigger] as const
}
