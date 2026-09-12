/* @vitest-environment jsdom */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from 'src/app-error-boundary'
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let root: Root | undefined
let host: HTMLDivElement | undefined
let shouldThrow = false

const ThrowingRouteTree = () => {
  if (shouldThrow) throw new Error('render failed')

  return <p>Route tree recovered</p>
}

const ThrowingToaster = () => {
  throw new Error('app shell failed')
}

const MockAppRoutes = () => <p>Routes</p>

vi.mock('src/shared/ui', () => ({ Toaster: ThrowingToaster }))
vi.mock('src/routes', () => ({ AppRoutes: MockAppRoutes }))

afterEach(() => {
  shouldThrow = false
  root?.unmount()
  root = undefined
  host?.remove()
  host = undefined
  vi.restoreAllMocks()
})

describe('AppErrorBoundary', () => {
  it('shows the error UI and recovers when the route tree renders again', async () => {
    shouldThrow = true
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)

    await act(async () => {
      root?.render(
        <AppErrorBoundary>
          <ThrowingRouteTree />
        </AppErrorBoundary>,
      )
    })

    expect(host.textContent).toContain('An unexpected error occurred.')
    expect(host.querySelector('button')?.textContent).toBe('Try again')
    expect(consoleError).toHaveBeenCalled()

    shouldThrow = false
    await act(async () => {
      host?.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(host.textContent).toContain('Route tree recovered')
  })

  it('catches a render error from the app shell before route rendering', async () => {
    const { default: App } = await import('src/root')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)

    await act(async () => {
      root?.render(<App />)
    })

    expect(host.textContent).toContain('An unexpected error occurred.')
    expect(consoleError).toHaveBeenCalled()
  })
})
