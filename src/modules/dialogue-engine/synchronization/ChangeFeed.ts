import { makeAutoObservable, when } from 'mobx'
import { DialogueError } from '../errors/DialogueError'
import type { WatchChanges } from '../contracts/backend.types'
import type { DialogueChange } from '../contracts/dialogue.types'
import { errorMessageOf } from 'src/modules/observable-request'

const RETRY_DELAY_MS = 1500

const pause = (signal: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    const finish = (): void => {
      clearTimeout(timer)
      signal.removeEventListener('abort', finish)
      resolve()
    }
    const timer = setTimeout(finish, RETRY_DELAY_MS)
    signal.addEventListener('abort', finish, { once: true })

    if (signal.aborted) {
      finish()
    }
  })

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
    snapshot: () => Promise<string>,
    apply: (data: DialogueChange) => Promise<string>,
  ): Promise<void> {
    while (!this.signal.aborted) {
      try {
        await this.subscribe(scope, snapshot, apply)
      } catch (error) {
        await this.reconnect(error)
      }
    }
  }

  private async subscribe(
    scope: string | undefined,
    snapshot: () => Promise<string>,
    apply: (data: DialogueChange) => Promise<string>,
  ): Promise<void> {
    const cursor = await this.resumeCursor(snapshot)

    if (this.signal.aborted) {
      return
    }

    await this.watch(scope, cursor, this.signal, (change) => this.applyChange(change, apply), this.markConnected)
    this.checkUnexpectedDisconnect()
  }

  private async resumeCursor(snapshot: () => Promise<string>): Promise<string> {
    const cursor = this.cursor ?? (await snapshot())
    this.advanceCursor(cursor)
    this.markSnapshotReady()

    return cursor
  }

  private async applyChange(change: DialogueChange, apply: (data: DialogueChange) => Promise<string>): Promise<void> {
    const cursor = await apply(change)
    this.advanceCursor(cursor)
  }

  private advanceCursor(cursor: string): void {
    if (this.signal.aborted) {
      return
    }

    this.cursor = cursor
  }

  private markSnapshotReady(): void {
    if (!this.signal.aborted) this.snapshotReady = true
  }

  private markConnected(): void {
    this.status = 'Live'
    this.error = ''
  }

  private checkUnexpectedDisconnect(): void {
    if (!this.signal.aborted) {
      throw new Error('Event stream ended. Reconnecting.')
    }
  }

  private async reconnect(error: unknown): Promise<void> {
    if (this.signal.aborted) {
      return
    }

    if (error instanceof DialogueError && error.recovery === 'stop') {
      this.fail(error)

      return
    }

    this.markDisconnected(error)
    await pause(this.signal)
  }

  private fail(error: Error): void {
    this.failure = error
    this.error = error.message
    this.stop()
  }

  private markDisconnected(error: unknown): void {
    this.status = 'Reconnecting'
    this.error = errorMessageOf(error) ?? 'Connection interrupted.'

    if (error instanceof DialogueError && error.recovery === 'refresh') {
      this.cursor = undefined
    }
  }
}
