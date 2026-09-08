import { vi } from 'vitest'

interface Deferred<T> {
  readonly promise: Promise<T>
  resolve(value: T): void
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((accept) => {
    resolve = accept
  })

  return { promise, resolve }
}

export class HeldRequest<Args extends unknown[], Result> {
  private readonly arrival = deferred<Args>()

  private readonly response = deferred<() => Result | Promise<Result>>()

  public constructor(private readonly handler: (...args: Args) => Result | Promise<Result>) {}

  public received(): Promise<Args> {
    return this.arrival.promise
  }

  public async respond(value: Result): Promise<void> {
    this.response.resolve(() => value)
    await this.deliverResponse()
  }

  public async resume(): Promise<void> {
    this.response.resolve(async () => this.handler(...(await this.arrival.promise)))
    await this.deliverResponse()
  }

  public async execute(args: Args): Promise<Result> {
    this.arrival.resolve(args)
    const respond = await this.response.promise

    return respond()
  }

  private async deliverResponse(): Promise<void> {
    // Drain response consumers without advancing reconnect or liveness deadlines.
    await vi.advanceTimersByTimeAsync(0)
  }
}
