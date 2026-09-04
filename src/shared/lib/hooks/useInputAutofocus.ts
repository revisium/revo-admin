import { useCallback } from 'react'

type InputRefCallback = (node: HTMLInputElement | null) => void

export const useInputAutofocus = (): InputRefCallback =>
  useCallback((node: HTMLInputElement | null) => {
    node?.focus()
  }, [])
