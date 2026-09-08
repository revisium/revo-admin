import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { Copy } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { MessageActionsViewModel } from '../model/item/MessageActionsViewModel'

interface MessageActionsProps {
  readonly model: MessageActionsViewModel
}
export const MessageActions = observer(({ model }: MessageActionsProps) => {
  return (
    model.visible && (
      <Box>
        <HStack gap="1" mt="1" color="fg.muted">
          <Button
            size="xs"
            variant="ghost"
            color="fg.muted"
            _hover={{ color: 'fg.default' }}
            aria-label={model.copyLabel}
            title={model.copyLabel}
            loading={model.copying}
            onClick={model.copy}
          >
            <Copy size={14} />
          </Button>
        </HStack>
        {model.error && (
          <Text role="alert" textStyle="caption">
            {model.error}
          </Text>
        )}
      </Box>
    )
  )
})
