import { Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import type { ActivityItemViewModel } from '../model/item/ActivityItemViewModel'

interface DialogueNoticeProps {
  readonly model: ActivityItemViewModel
}

export const DialogueNotice = observer(({ model }: DialogueNoticeProps) => (
  <Text data-item-id={model.id} role="status" textStyle="small" color="fg.muted" px="4" py="3">
    {model.notice}
  </Text>
))
