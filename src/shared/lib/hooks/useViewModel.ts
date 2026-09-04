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

  if (!sameArgs(previousArgsRef.current, initArgs)) {
    previousArgsRef.current = initArgs
  }

  const memoizedInitArgs = previousArgsRef.current

  useEffect(() => {
    const lifecycle = model as T & ViewModelLifecycle
    lifecycle.mount?.(...memoizedInitArgs)

    return () => {
      lifecycle.unmount?.()
    }
  }, [memoizedInitArgs, model])

  return model
}
