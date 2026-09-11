import { Box, Button, HStack, Spinner, Text } from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { DialogueSidebarViewModel } from '../model/dialogue/DialogueSidebarViewModel'
import { useViewModel } from 'src/shared/lib'
import { routes } from 'src/shared/config'
import { SidebarAction, SidebarGroup, SidebarItem } from 'src/shared/ui/components'

interface DialogueSidebarProps {
  readonly pathname: string
  readonly onNavigate?: () => void
}

export const DialogueSidebar = observer(({ pathname, onNavigate }: DialogueSidebarProps) => {
  const model = useViewModel(DialogueSidebarViewModel, pathname)
  return (
    <Box flex="1" minH="0" mt="4" mb="3" px="4">
      <SidebarGroup
        label="Chats"
        actions={
          <SidebarAction iconOnly label="New chat" to={routes.assistant()} onClick={onNavigate}>
            <Plus size={15} />
          </SidebarAction>
        }
      >
        {model.items.map((dialogue) => (
          <SidebarItem
            key={dialogue.id}
            label={dialogue.title}
            to={dialogue.to}
            active={dialogue.active}
            level="nested"
            onNavigate={onNavigate}
            badge={
              dialogue.hasIndicator && (
                <HStack gap="1" minW="20px">
                  {dialogue.busy && <Spinner size="xs" aria-label="Working" />}
                  {dialogue.unread && <Box boxSize="6px" borderRadius="full" bg="fg.default" aria-label="Unread" />}
                </HStack>
              )
            }
          />
        ))}
        {model.hasMore && (
          <Button size="xs" variant="ghost" loading={model.loading} onClick={model.loadMore}>
            Load more chats
          </Button>
        )}
        {model.error && (
          <Text role="alert" textStyle="caption">
            {model.error}
          </Text>
        )}
        {model.connectionError && (
          <Text role="status" textStyle="caption">
            {model.connectionError}
          </Text>
        )}
      </SidebarGroup>
    </Box>
  )
})
