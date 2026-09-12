import { ChakraProvider } from '@chakra-ui/react'
import { Toaster } from 'src/shared/ui'
import { system } from 'src/shared/ui/theme/theme'
import { AppErrorBoundary } from './app-error-boundary'
import { AppRoutes } from './routes'

export default function App() {
  return (
    <AppErrorBoundary>
      <ChakraProvider value={system}>
        <Toaster />
        <AppRoutes />
      </ChakraProvider>
    </AppErrorBoundary>
  )
}
