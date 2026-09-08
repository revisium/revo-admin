import { Box, HStack } from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useViewModel } from 'src/shared/lib'
import { SidebarAction, SidebarGroup, SidebarItem } from 'src/shared/ui/components'
import { ContextListViewModel } from '../model/ContextListViewModel'
import { DialogueSidebar } from './DialogueSidebar'

interface ContextListProps {
  readonly pathname: string
  readonly onNavigate?: () => void
}

export const ContextList = observer(({ pathname, onNavigate }: ContextListProps) => {
  const model = useViewModel(ContextListViewModel)
  if (model.section(pathname) === 'assistant') return <DialogueSidebar pathname={pathname} onNavigate={onNavigate} />
  const content = model.content(pathname)
  if (!content) return null

  return (
    <Box flex="1" minH="0" mt="4" mb="3" px="4">
      <SidebarGroup
        label={content.title}
        actions={
          <HStack gap="1">
            {content.overviewAction ? (
              <SidebarAction label={content.overviewAction.label} to={content.overviewAction.to} onClick={onNavigate}>
                {content.overviewAction.label}
              </SidebarAction>
            ) : null}
            {content.createAction ? (
              <SidebarAction
                iconOnly
                label={content.createAction.label}
                to={content.createAction.to}
                onClick={onNavigate}
              >
                <Plus size={15} />
              </SidebarAction>
            ) : null}
          </HStack>
        }
      >
        {content.items.map((item) => (
          <SidebarItem
            key={item.to}
            active={pathname === item.to}
            label={item.title}
            level="nested"
            meta={item.meta}
            onNavigate={onNavigate}
            to={item.to}
          />
        ))}
      </SidebarGroup>
    </Box>
  )
})
