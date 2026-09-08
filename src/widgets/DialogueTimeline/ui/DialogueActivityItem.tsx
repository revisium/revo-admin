import { Box, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import type { ActivityItemViewModel } from '../model/item/ActivityItemViewModel'

interface DialogueActivityItemProps {
  readonly item: ActivityItemViewModel
}
export const DialogueActivityItem = observer(({ item }: DialogueActivityItemProps) => (
  <Box data-item-id={item.id}>
    <Text textStyle="small" color="fg.muted">
      {item.summary}
    </Text>
    {item.activityStatus && (
      <Text textStyle="caption" color="fg.muted">
        {item.activityStatus}
      </Text>
    )}
  </Box>
))
