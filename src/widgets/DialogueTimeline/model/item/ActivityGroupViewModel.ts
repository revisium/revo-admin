import { makeAutoObservable } from 'mobx'
import type { ActivityItemViewModel } from './ActivityItemViewModel'

export class ActivityGroupViewModel {
  public readonly blockType = 'activity' as const
  public expanded = false
  public constructor(
    public readonly id: string,
    private readonly readItems: () => ActivityItemViewModel[],
  ) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get items() {
    return this.readItems()
  }

  public get working() {
    return this.items.some((item) => item.working)
  }

  public get label() {
    const active = [...this.items].reverse().find((item) => item.working)
    if (active) return active.summary
    return `Actions · ${this.items.length}`
  }

  public toggle(): void {
    this.expanded = !this.expanded
  }
}
