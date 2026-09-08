import { HeldRequest } from './HeldRequest'

export class ControlledRequest<Args extends unknown[], Result> {
  public readonly calls: Args[] = []

  private readonly queued: ((args: Args) => Result | Promise<Result>)[] = []

  public constructor(private readonly handler: (...args: Args) => Result | Promise<Result>) {}

  public holdNext(): HeldRequest<Args, Result> {
    const held = new HeldRequest(this.handler)
    this.queued.push((args) => held.execute(args))

    return held
  }

  public respondNext(value: Result): void {
    this.queued.push(() => value)
  }

  public failNext(error: Error): void {
    this.queued.push(() => {
      throw error
    })
  }

  public async execute(...args: Args): Promise<Result> {
    this.calls.push(args)
    const queued = this.queued.shift()

    return queued ? queued(args) : this.handler(...args)
  }
}
