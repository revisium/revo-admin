export type Recovery = 'retry' | 'refresh' | 'stop'

export class DialogueError extends Error {
  public constructor(
    public readonly code: string,
    message: string,
    public readonly recovery: Recovery,
  ) {
    super(message)
    this.name = 'DialogueError'
  }
}
