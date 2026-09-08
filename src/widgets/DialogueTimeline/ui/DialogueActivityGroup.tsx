import { Box, Button, Spinner, Stack } from '@chakra-ui/react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import type { ActivityGroupViewModel } from '../model/item/ActivityGroupViewModel'
import { DialogueActivityItem } from './DialogueActivityItem'

interface DialogueActivityGroupProps {
  readonly model: ActivityGroupViewModel
}
export const DialogueActivityGroup = observer(({ model }: DialogueActivityGroupProps) => (
  <Box px="2" py="1" data-testid="activity-group">
    <Button
      variant="ghost"
      size="sm"
      color="fg.muted"
      maxW="full"
      justifyContent="start"
      onClick={model.toggle}
      aria-expanded={model.expanded}
      aria-controls={model.id}
    >
      {model.working && <Spinner size="xs" />}
      {!model.working && model.expanded && <ChevronDown size={14} />}
      {!model.working && !model.expanded && <ChevronRight size={14} />}
      <Box as="span" truncate>
        {model.label}
      </Box>
    </Button>
    {model.expanded && (
      <Stack id={model.id} pl="5" py="2" gap="2">
        {model.items.map((item) => (
          <DialogueActivityItem key={item.id} item={item} />
        ))}
      </Stack>
    )}
  </Box>
))
