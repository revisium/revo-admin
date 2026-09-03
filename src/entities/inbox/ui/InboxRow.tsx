import { Box, Center, Link as ChakraLink, HStack, Span, Text } from '@chakra-ui/react'
import { Check, DoorOpen, MessageCircleQuestion, TriangleAlert, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import type { InboxItem, InboxKind } from 'src/shared/fixtures'
import { relTime } from 'src/shared/fixtures'

const KIND: Record<InboxKind, { readonly icon: LucideIcon; readonly fg: string; readonly bg: string }> = {
  approval: { icon: DoorOpen, fg: 'accent.gate.fg', bg: 'accent.gate.bg' },
  question: { icon: MessageCircleQuestion, fg: 'status.running.fg', bg: 'status.running.bg' },
  alert: { icon: TriangleAlert, fg: 'status.failed.fg', bg: 'status.failed.bg' },
}

export const InboxRow = ({ item, active }: { readonly item: InboxItem; readonly active: boolean }) => {
  const kind = KIND[item.kind]
  const Icon = kind.icon
  const resolved = item.status === 'resolved'

  return (
    <ChakraLink
      asChild
      display="block"
      borderRadius="9px"
      borderWidth="1px"
      borderColor={active ? 'border.warmStrong' : 'transparent'}
      bg={active ? 'bg.1' : 'transparent'}
      boxShadow={active ? 'sh-1' : undefined}
      _hover={{ textDecoration: 'none', bg: active ? 'bg.1' : 'blackAlpha.50' }}
    >
      <Link to={`/inbox/${item.id}`}>
        <HStack gap="2.5" p="2.5" align="start">
          <Center
            boxSize="28px"
            borderRadius="7px"
            flexShrink="0"
            color={kind.fg}
            bg={kind.bg}
            opacity={resolved ? '0.6' : '1'}
          >
            <Icon size={15} />
          </Center>
          <Box flex="1" minW="0">
            <Text textStyle="medium-sm" color={resolved ? 'fg.2' : 'fg.0'} truncate>
              {item.title}
            </Text>
            <HStack gap="1.5" mt="0.5" color="fg.3" textStyle="regular-micro">
              <Text className="mono" truncate>
                {item.runId}
              </Text>
              <Span>·</Span>
              <Text flexShrink="0">{relTime(item.createdAt)}</Text>
            </HStack>
          </Box>
          {resolved ? (
            <Box color="status.success.fg" flexShrink="0" mt="1">
              <Check size={14} />
            </Box>
          ) : (
            <Box boxSize="7px" borderRadius="full" bg="brand.500" flexShrink="0" mt="1.5" />
          )}
        </HStack>
      </Link>
    </ChakraLink>
  )
}
