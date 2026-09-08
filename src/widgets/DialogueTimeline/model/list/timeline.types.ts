import type { MessageViewModel } from '../item/MessageViewModel'
import type { ActivityItemViewModel } from '../item/ActivityItemViewModel'
import type { ActivityGroupViewModel } from '../item/ActivityGroupViewModel'

export type TimelineRow = MessageViewModel | ActivityItemViewModel
export type TimelineBlockModel = MessageViewModel | ActivityItemViewModel | ActivityGroupViewModel

export interface ActivitySegment {
  readonly type: 'activity'
  readonly id: string
  readonly turnKey: string
  readonly items: ActivityItemViewModel[]
}

export interface StandaloneSegment {
  readonly type: 'standalone'
  readonly item: TimelineRow
}

export type TimelineSegment = ActivitySegment | StandaloneSegment
