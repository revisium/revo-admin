import { ActivityItemViewModel } from '../item/ActivityItemViewModel'
import type { TimelineRow, TimelineBlockModel } from './timeline.types'
import { timelineSegments } from './timeline-segments'
import { TimelineScrollViewModel } from '../scroll/TimelineScrollViewModel'
import { makeAutoObservable } from 'mobx'
import { DialogueEngine } from 'src/modules/dialogue-engine'
import { ActivityGroupViewModel } from '../item/ActivityGroupViewModel'
import { MessageViewModel } from '../item/MessageViewModel'
import { container, ClipboardService } from 'src/shared/lib'
import { DialoguePresentationStore } from 'src/entities/dialogue'

export class TimelineViewModel {
  private readonly groups = new Map<string, ActivityGroupViewModel>()
  private id = ''
  private readonly rows = new Map<string, TimelineRow>()
  public readonly scroll: TimelineScrollViewModel

  public constructor(
    private readonly engine: DialogueEngine,
    presentation: DialoguePresentationStore,
    private readonly clipboard: ClipboardService,
  ) {
    this.scroll = new TimelineScrollViewModel(presentation)
    makeAutoObservable<this, 'rows' | 'groups'>(this, { rows: false, groups: false }, { autoBind: true })
  }

  public setup(id: string): void {
    this.id = id
    this.scroll.setup(id)
  }

  public mount(id: string): void {
    this.setup(id)
  }

  private get dialogue() {
    return this.engine.get(this.id)
  }

  public get items() {
    return this.dialogue.history.items.map((item) => {
      let row = this.rows.get(item.id)

      if (!row) {
        row = item.kind === 'MESSAGE' ? new MessageViewModel(item, this.clipboard) : new ActivityItemViewModel(item)
        this.rows.set(item.id, row)
      }

      return row
    })
  }

  private get segments() {
    return timelineSegments(this.items)
  }

  private get activityItems(): ReadonlyMap<string, ActivityItemViewModel[]> {
    return new Map(
      this.segments.flatMap((segment) => (segment.type === 'activity' ? [[segment.id, segment.items] as const] : [])),
    )
  }

  public get blocks(): readonly TimelineBlockModel[] {
    return this.segments.map((segment) => {
      if (segment.type === 'standalone') return segment.item

      return this.activityGroup(segment.id)
    })
  }

  private activityGroup(id: string): ActivityGroupViewModel {
    let group = this.groups.get(id)

    if (!group) {
      group = new ActivityGroupViewModel(`activity:${id}`, () => this.activityItems.get(id) ?? [])
      this.groups.set(id, group)
    }

    return group
  }

  public unmount(): void {
    this.rows.forEach((row) => {
      if (row.blockType === 'message') row.dispose()
    })
    this.rows.clear()
    this.groups.clear()
    this.scroll.attach(undefined)
  }
}
container.register(
  TimelineViewModel,
  () => {
    const engine = container.get(DialogueEngine)
    const presentation = container.get(DialoguePresentationStore)
    const clipboard = container.get(ClipboardService)

    return new TimelineViewModel(engine, presentation, clipboard)
  },
  { scope: 'transient' },
)
