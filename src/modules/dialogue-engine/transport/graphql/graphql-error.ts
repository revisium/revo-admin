import { DialogueError } from '../../errors/DialogueError'

interface ExecutionError {
  readonly message: string
  readonly extensions?: Record<string, unknown>
}

const CLIENT_ERROR_START = 400
const SERVER_ERROR_START = 500
const TOO_MANY_REQUESTS = 429

const CURSOR_CODES = new Set(['INVALID_CURSOR', 'CURSOR_AHEAD', 'CURSOR_UNAVAILABLE', 'CURSOR_EXPIRED'])
const TRANSIENT_CODES = new Set(['INTERNAL_SERVER_ERROR', 'SERVICE_UNAVAILABLE', 'TOO_MANY_REQUESTS'])

export function executionError(errors: readonly ExecutionError[]): DialogueError {
  const primary = errors[0]
  const declared = typeof primary.extensions?.code === 'string' ? primary.extensions.code : 'GRAPHQL_ERROR'
  // Current Core exposes these stable cursor codes as message prefixes.
  const prefix = primary.message.split(':')[0]
  const code = CURSOR_CODES.has(prefix) ? prefix : declared
  const message = errors.map((error) => error.message).join('; ')

  if (CURSOR_CODES.has(code)) return new DialogueError(code, message, 'refresh')

  return new DialogueError(code, message, TRANSIENT_CODES.has(code) ? 'retry' : 'stop')
}

export function transportError(error: unknown): DialogueError {
  if (error instanceof DialogueError) return error

  const source = error as { response?: { errors?: ExecutionError[]; status?: number }; message?: string }

  if (source?.response?.errors?.length) return executionError(source.response.errors)

  const status = source?.response?.status
  const permanent =
    status !== undefined && status >= CLIENT_ERROR_START && status < SERVER_ERROR_START && status !== TOO_MANY_REQUESTS

  return new DialogueError(
    String(status ?? 'NETWORK_ERROR'),
    source?.message ?? 'Connection failed.',
    permanent ? 'stop' : 'retry',
  )
}
