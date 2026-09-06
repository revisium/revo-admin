import { useEffect, useRef, useState } from 'react'
import { container } from '../DIContainer'

interface ViewModelLifecycle {
  setup?: (...args: any[]) => void
  mount?: (...args: any[]) => void | Promise<void>
  unmount?: () => void
}

type SetupArgs<T> = 'setup' extends keyof T
  ? NonNullable<T['setup']> extends (...args: infer A) => unknown
    ? A
    : []
  : []

const sameArgs = (previous: readonly unknown[], next: readonly unknown[]): boolean =>
  previous.length === next.length && previous.every((arg, index) => arg === next[index])

export const useViewModel = <T extends object>(Class: new (...args: any[]) => T, ...initArgs: SetupArgs<T>): T => {
  const [model] = useState(() => {
    const instance = container.get(Class)
    const lifecycle = instance as T & ViewModelLifecycle
    lifecycle.setup?.(...initArgs)
    return instance
  })

  const previousArgsRef = useRef<SetupArgs<T>>(initArgs)
  const mountedArgsRef = useRef<SetupArgs<T> | undefined>(undefined)
  const isMountedRef = useRef(false)
  const lifecycleGenerationRef = useRef(0)

  if (!sameArgs(previousArgsRef.current, initArgs)) {
    previousArgsRef.current = initArgs
  }

  const memoizedInitArgs = previousArgsRef.current

  useEffect(() => {
    const lifecycle = model as T & ViewModelLifecycle
    lifecycleGenerationRef.current += 1
    if (!isMountedRef.current || !sameArgs(mountedArgsRef.current ?? [], memoizedInitArgs)) {
      lifecycle.mount?.(...memoizedInitArgs)
      mountedArgsRef.current = memoizedInitArgs
      isMountedRef.current = true
    }

    return () => {
      const cleanupGeneration = ++lifecycleGenerationRef.current
      queueMicrotask(() => {
        if (lifecycleGenerationRef.current !== cleanupGeneration) return
        lifecycle.unmount?.()
        isMountedRef.current = false
      })
    }
  }, [memoizedInitArgs, model])

  return model
}
