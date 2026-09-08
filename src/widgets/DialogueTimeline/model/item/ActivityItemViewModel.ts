import { makeAutoObservable } from 'mobx'
import type { DialogueEntry } from 'src/modules/dialogue-engine'
import { activitySummary, activityWorking, entryNotice, entryVisible } from './entry-presentation'

export class ActivityItemViewModel {
  public readonly blockType = 'notice' as const

  public constructor(private readonly item: DialogueEntry) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public get id(): string {
    return this.item.id
  }

  public get turnKey(): string {
    return this.item.turnId
  }

  public get visible(): boolean {
    return entryVisible(this.item)
  }

  public get notice(): string {
    return entryNotice(this.item)
  }

  public get standalone(): boolean {
    return Boolean(this.notice)
  }

  public get working(): boolean {
    return activityWorking(this.item)
  }

  public get summary(): string {
    return activitySummary(this.item)
  }

  public get activityStatus(): string {
    return this.working ? 'In progress' : ''
  }
}
