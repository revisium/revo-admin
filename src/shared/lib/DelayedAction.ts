export class DelayedAction {
  private timer: ReturnType<typeof setTimeout> | null = null

  public constructor(private readonly delayMs: number) {}

  public schedule(action: () => void): void {
    this.cancel()
    this.timer = setTimeout(action, this.delayMs)
  }

  public cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  public dispose(): void {
    this.cancel()
  }
}
