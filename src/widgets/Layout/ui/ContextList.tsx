import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router'
import { useViewModel } from 'src/shared/lib'
import { ContextListViewModel } from '../model/ContextListViewModel'

interface ContextListProps {
  readonly pathname: string
  readonly onNavigate?: () => void
}

export const ContextList = observer(({ pathname, onNavigate }: ContextListProps) => {
  const model = useViewModel(ContextListViewModel)
  const content = model.content(pathname)
  if (!content) return null

  return (
    <Stack className="group" flex="1" minH="0" gap="0" mt="5" mb="3" aria-label={`${content.title} section`}>
      <Stack gap="2" px="3" py="3" flexShrink="0">
        <HStack justify="space-between">
          <Text textStyle="caption" color="fg.muted" fontWeight="500">
            {content.title}
          </Text>
          <HStack gap="0.5" color="fg.muted">
            {content.showOverviewAction && (
              <Button asChild variant="ghost" size="xs" color="fg.muted" _hover={{ color: 'fg.default' }}>
                <Link to={content.overview} onClick={onNavigate}>
                  All
                </Link>
              </Button>
            )}
            {content.create && (
              <Button
                asChild
                variant="ghost"
                size="xs"
                color="fg.muted"
                _hover={{ color: 'fg.default' }}
                aria-label={content.createLabel}
              >
                <Link to={content.create} onClick={onNavigate} title={content.createLabel}>
                  <Plus size={15} />
                </Link>
              </Button>
            )}
          </HStack>
        </HStack>
      </Stack>
      <Box overflowY="auto" minH="0" flex="1" px="2" aria-label={`${content.title} quick selection`}>
        <Stack gap="1">
          {model.visible(pathname).map((item) => (
            <Box
              key={item.to}
              asChild
              px="3"
              py="2.5"
              borderRadius="control"
              bg={pathname === item.to ? 'bg.subtle' : 'transparent'}
              borderLeftWidth="2px"
              borderColor={pathname === item.to ? 'action.primary.bg' : 'transparent'}
              _hover={{ bg: 'bg.subtle' }}
            >
              <Link to={item.to} onClick={onNavigate} aria-current={pathname === item.to ? 'page' : undefined}>
                <Text textStyle="small" fontWeight={pathname === item.to ? '600' : '400'} truncate title={item.title}>
                  {item.title}
                </Text>
                {item.meta && (
                  <Text textStyle="caption" color="fg.muted" mt="1">
                    {item.meta}
                  </Text>
                )}
              </Link>
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  )
})
