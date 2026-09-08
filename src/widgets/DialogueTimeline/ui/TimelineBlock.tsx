import { observer } from 'mobx-react-lite'
import type { TimelineBlockModel } from '../model/list/timeline.types'
import { DialogueNotice } from './DialogueNotice'
import { DialogueMessage } from './DialogueMessage'
import { DialogueActivityGroup } from './DialogueActivityGroup'

interface TimelineBlockProps {
  readonly item: TimelineBlockModel
}
export const TimelineBlock = observer(({ item }: TimelineBlockProps) => {
  switch (item.blockType) {
    case 'activity':
      return <DialogueActivityGroup model={item} />
    case 'notice':
      return <DialogueNotice model={item} />
    case 'message':
      return <DialogueMessage item={item} />
  }
})
