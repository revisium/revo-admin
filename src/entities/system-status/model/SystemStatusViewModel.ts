import { makeAutoObservable, runInAction } from 'mobx'
import { container } from 'src/shared/lib/DIContainer'
import { SystemHealthViewModel } from './SystemHealthViewModel'
import { SystemStatusService } from './SystemStatusService'
import type { SystemHostStat, SystemStatusLoadState, SystemStatusTone } from './types'

const errorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Failed to load GraphQL status.'
}

export class SystemStatusViewModel {
  public health: SystemHealthViewModel | null = null
  public state: SystemStatusLoadState = 'idle'
  public error: string | null = null

  public constructor(private readonly systemStatusService: SystemStatusService = container.get(SystemStatusService)) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get isLoading(): boolean {
    return this.state === 'loading'
  }

  public get isReady(): boolean {
    return this.state === 'ready'
  }

  public get isOnline(): boolean {
    return this.health?.isOnline ?? false
  }

  public get statusLabel(): string {
    if (this.state === 'loading' && !this.health) {
      return 'Checking host'
    }

    return this.health?.statusLabel ?? 'Host unavailable'
  }

  // Without health data the tone follows the load state: a failed request is an error, while
  // idle and loading are merely unknown yet.
  private get fallbackTone(): SystemStatusTone {
    return this.state === 'error' ? 'failed' : 'waiting'
  }

  public get statusTone(): SystemStatusTone {
    return this.health?.statusTone ?? this.fallbackTone
  }

  public get hostLabel(): string {
    return this.health?.hostLabel ?? 'local GraphQL host'
  }

  public get metaLabel(): string {
    return this.health?.metaLabel ?? 'state'
  }

  public get metaValue(): string {
    return this.health?.metaValue ?? this.state
  }

  public get issues(): readonly string[] {
    return this.health?.issues ?? []
  }

  public get stats(): readonly SystemHostStat[] {
    return (
      this.health?.stats ?? [{ key: 'system', label: 'system', value: 'unknown', tone: this.fallbackTone, mono: true }]
    )
  }

  public mount(): Promise<void> {
    return this.refresh()
  }

  public async refresh(): Promise<void> {
    this.state = 'loading'
    this.error = null

    try {
      const rawHealth = await this.systemStatusService.loadSystemInfo()

      runInAction(() => {
        this.health = new SystemHealthViewModel(rawHealth)
        this.state = 'ready'
      })
    } catch (error) {
      runInAction(() => {
        this.state = 'error'
        this.error = errorMessage(error)
      })
    }
  }
}

container.register(SystemStatusViewModel, () => new SystemStatusViewModel(), { scope: 'transient' })
