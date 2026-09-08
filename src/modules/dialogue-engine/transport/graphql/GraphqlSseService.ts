import { executionError, transportError } from './graphql-error'
import { print, type DocumentNode } from 'graphql'
import { createClient } from 'graphql-sse'
import { SseLiveness } from './SseLiveness'

import type { GraphqlDialogueOptions } from './transport.types'

export class GraphqlSseService {
  public constructor(private readonly options: GraphqlDialogueOptions) {}

  public async consume<T>(
    document: DocumentNode,
    variables: Record<string, unknown>,
    signal: AbortSignal,
    receive: (data: T) => Promise<void>,
    connected: () => void,
  ): Promise<void> {
    const liveness = new SseLiveness()
    const offlineController = new AbortController()
    const offline = (): void => offlineController.abort()
    const client = createClient({
      url: this.options.endpoint,
      headers: this.options.headers,
      singleConnection: false,
      retryAttempts: 0,
      credentials: this.options.credentials ?? 'include',
      fetchFn: async (input: RequestInfo | URL, init?: RequestInit) => {
        liveness.touch()
        const combined = AbortSignal.any([
          signal,
          offlineController.signal,
          liveness.signal,
          ...(init?.signal ? [init.signal] : []),
        ])
        const response = await (this.options.fetch ?? globalThis.fetch)(input, { ...init, signal: combined })

        return liveness.track(response)
      },
      on: { connected },
    })
    const dispose = (): void => client.dispose()
    signal.addEventListener('abort', dispose, { once: true })

    if (typeof window !== 'undefined') window.addEventListener('offline', offline)

    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false)
        throw new Error('Browser is offline. Reconnecting.')
      for await (const result of client.iterate<T>({ query: print(document), variables })) {
        if (signal.aborted) return

        if (result.errors?.length) throw executionError(result.errors)

        if (result.data) await receive(result.data)
      }
    } catch (error) {
      throw transportError(error)
    } finally {
      liveness.dispose()
      signal.removeEventListener('abort', dispose)

      if (typeof window !== 'undefined') window.removeEventListener('offline', offline)
      client.dispose()
    }
  }
}
