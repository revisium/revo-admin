// Yoga emits comment heartbeats every 12 seconds. Allow several missed heartbeats.
const HEARTBEAT_TIMEOUT_MS = 45000

export class SseLiveness {
  private readonly controller = new AbortController()
  private timer?: ReturnType<typeof setTimeout>
  public get signal(): AbortSignal {
    return this.controller.signal
  }

  public touch = (): void => {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.controller.abort(new Error('The event connection stopped responding. Reconnecting.'))
    }, HEARTBEAT_TIMEOUT_MS)
  }

  public track(response: Response): Response {
    if (!response.body) return response
    const body = response.body.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform: (chunk, controller) => {
          this.touch()
          controller.enqueue(chunk)
        },
      }),
    )

    return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers })
  }

  public dispose(): void {
    clearTimeout(this.timer)
  }
}
