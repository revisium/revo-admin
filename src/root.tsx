import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from 'src/shared/ui/theme/theme'
import { Toaster } from 'src/shared/ui'

export const links = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
  },
]

interface LayoutProps {
  readonly children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  // Theme is hard-forced light with no toggle. Render the light color-mode
  // markup statically so the initial document stays deterministic.
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function HydrateFallback() {
  return (
    <main>
      <p>Loading Revo Admin…</p>
    </main>
  )
}

export default function App() {
  return (
    <ChakraProvider value={system}>
      <Toaster />
      <Outlet />
    </ChakraProvider>
  )
}

const HTTP_NOT_FOUND = 404

interface ErrorBoundaryProps {
  readonly error: unknown
}

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  let message = 'Error'
  let details = 'An unexpected error occurred.'

  if (isRouteErrorResponse(error)) {
    message = error.status === HTTP_NOT_FOUND ? '404' : 'Error'
    details = error.status === HTTP_NOT_FOUND ? 'Page not found.' : (error.statusText ?? details)
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{message}</h1>
      <p>{details}</p>
    </main>
  )
}
