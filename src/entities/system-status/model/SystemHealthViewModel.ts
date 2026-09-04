import type { SystemInfoQuery } from 'src/__generated__/graphql-request'
import type { SystemHostStat, SystemStatusTone } from './types'

type SystemHealthRaw = SystemInfoQuery['systemInfo']

/** Adapts the compact systemInfo contract to the dashboard host card. */
export class SystemHealthViewModel {
  public constructor(private readonly raw: SystemHealthRaw) {}

  public get isOnline(): boolean {
    return this.raw.status === 'ok'
  }
  public get statusLabel(): string {
    return this.isOnline ? 'Host online' : 'Host needs attention'
  }
  public get statusTone(): SystemStatusTone {
    return this.isOnline ? 'success' : 'failed'
  }
  public get hostLabel(): string {
    return this.raw.name
  }
  public get metaLabel(): string {
    return 'status'
  }
  public get metaValue(): string {
    return this.raw.status
  }
  public get issues(): readonly string[] {
    return ['Detailed daemon, doctor, and project metadata is unavailable in the systemInfo contract.']
  }
  public get stats(): readonly SystemHostStat[] {
    return [{ key: 'system', label: 'system', value: this.raw.name, tone: this.statusTone, mono: true }]
  }
}
