import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  readonly children: ReactNode
}

interface ErrorBoundaryState {
  readonly hasError: boolean
}

export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled application render error', error, errorInfo)
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main style={{ padding: '2rem' }}>
          <h1>Error</h1>
          <p>An unexpected error occurred.</p>
          <button type="button" onClick={this.reset}>
            Try again
          </button>
        </main>
      )
    }

    return this.props.children
  }

  private readonly reset = (): void => {
    this.setState({ hasError: false })
  }
}
