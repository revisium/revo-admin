import { PassThrough } from 'node:stream'

import { createReadableStreamFromReadable } from '@react-router/node'
import type { AppLoadContext, EntryContext } from 'react-router'
import { ServerRouter } from 'react-router'
import { renderToPipeableStream } from 'react-dom/server'

export const streamTimeout = 5_000
const abortGracePeriod = 1_000
const internalServerErrorStatus = 500

// React Router invokes this entry only while generating the static SPA document.
// It is deliberately a build-time streaming adapter, not a production server.
export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  if (request.method.toUpperCase() === 'HEAD') {
    return new Response(null, { status: responseStatusCode, headers: responseHeaders })
  }

  return new Promise<Response>((resolve, reject) => {
    let shellRendered = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const { pipe, abort } = renderToPipeableStream(<ServerRouter context={routerContext} url={request.url} />, {
      onAllReady() {
        shellRendered = true
        const body = new PassThrough({
          final(callback) {
            clearTimeout(timeoutId)
            timeoutId = undefined
            callback()
          },
        })
        responseHeaders.set('Content-Type', 'text/html')
        pipe(body)
        resolve(
          new Response(createReadableStreamFromReadable(body), {
            headers: responseHeaders,
            status: responseStatusCode,
          }),
        )
      },
      onShellError(error) {
        reject(error)
      },
      onError(error) {
        responseStatusCode = internalServerErrorStatus
        if (shellRendered) console.error(error)
      },
    })
    timeoutId = setTimeout(() => abort(), streamTimeout + abortGracePeriod)
  })
}
