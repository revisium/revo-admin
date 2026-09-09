import { makeAutoObservable, when } from 'mobx'
import { DialogueError } from '../errors/DialogueError'
import type { WatchChanges } from '../contracts/backend.types'
import type { DialogueChange } from '../contracts/dialogue.types'
import { errorMessageOf } from 'src/modules/observable-request'

export class ChangeFeed {
  public status = 'Connecting'
  public error = ''
  public snapshotReady = false
  public cursor?: string
  private failure?: Error
  private readonly controller = new AbortController()

  public constructor(private readonly watch: WatchChanges) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get state() {
    return { status: this.status, error: this.error }
  }

  public get signal() {
    return this.controller.signal
  }

  public stop(): void {
    this.controller.abort()
    this.status = 'Stopped'
  }

  public async ready(): Promise<void> {
    await when(() => this.snapshotReady || this.status === 'Stopped')

    if (!this.snapshotReady)
      throw this.failure ?? new DialogueError('CANCELLED', 'Dialogue loading was cancelled.', 'stop')
  }

  public async start(
    scope: string | undefined,
    snapshot: (signal: AbortSignal) => Promise<string>,
    apply: (data: DialogueChange, signal: AbortSignal) => Promise<string>,
  ): Promise<void> {
    try {
      await this.watch(scope, {
        signal: this.signal,
        prepare: (signal) => this.resumeCursor(snapshot, signal),
        receive: (change, signal) => this.applyChange(change, apply, signal),
        changed: this.connectionChanged,
        recover: this.recover,
      })
      this.stop()
    } catch (error) {
      if (!this.signal.aborted) this.fail(error)
    }
  }

  private async resumeCursor(snapshot: (signal: AbortSignal) => Promise<string>, signal: AbortSignal): Promise<string> {
    const cursor = this.cursor ?? (await snapshot(signal))
    signal.throwIfAborted()
    this.advanceCursor(cursor)
    this.markSnapshotReady()

    return cursor
  }

  private async applyChange(
    change: DialogueChange,
    apply: (data: DialogueChange, signal: AbortSignal) => Promise<string>,
    signal: AbortSignal,
  ): Promise<void> {
    const cursor = await apply(change, signal)
    signal.throwIfAborted()
    this.advanceCursor(cursor)
  }

  private advanceCursor(cursor: string): void {
    if (!this.signal.aborted) this.cursor = cursor
  }

  private markSnapshotReady(): void {
    if (!this.signal.aborted) this.snapshotReady = true
  }

  private connectionChanged(state: { status: string; error: string }): void {
    if (this.signal.aborted) return
    this.status = state.status
    this.error = state.error
  }

  private recover(error: unknown, signal: AbortSignal): boolean {
    if (signal.aborted || this.signal.aborted) return false

    if (error instanceof DialogueError && error.recovery === 'refresh') {
      this.cursor = undefined
      return true
    }

    return error instanceof DialogueError && error.recovery === 'retry'
  }

  private fail(error: unknown): void {
    this.failure = error instanceof Error ? error : new Error('Dialogue subscription failed.')
    this.error = errorMessageOf(error) ?? this.failure.message
    this.stop()
  }
}
