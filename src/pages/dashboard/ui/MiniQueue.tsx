import { Center, Link as ChakraLink, HStack, Stack, Text } from '@chakra-ui/react'
import { DoorOpen, MessageCircleQuestion, TriangleAlert, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import type { InboxItem, InboxKind } from 'src/shared/fixtures'
import { relTime } from 'src/shared/fixtures'

const KIND: Record<InboxKind, { readonly icon: LucideIcon; readonly tone: 'gate' | 'running' | 'failed' }> = {
  approval: { icon: DoorOpen, tone: 'gate' },
  question: { icon: MessageCircleQuestion, tone: 'running' },
  alert: { icon: TriangleAlert, tone: 'failed' },
}

const palette = (tone: 'gate' | 'running' | 'failed') =>
  tone === 'gate' ? { fg: 'fg.secondary', bg: 'bg.subtle' } : { fg: `status.${tone}.fg`, bg: 'bg.subtle' }

export const MiniQueue = ({ items }: { readonly items: ReadonlyArray<InboxItem> }) => (
  <Stack gap="0.5" mt="3.5">
    {items.map((item) => {
      const { icon: Icon, tone } = KIND[item.kind]
      const colors = palette(tone)
      return (
        <ChakraLink
          key={item.id}
          asChild
          display="block"
          borderRadius="8px"
          _hover={{ textDecoration: 'none', bg: 'bg.subtle' }}
        >
          <Link to={`/inbox/${item.id}`}>
            <HStack gap="2.5" px="2" py="2.5">
              <Center boxSize="26px" borderRadius="7px" flexShrink="0" color={colors.fg} bg={colors.bg}>
                <Icon size={14} />
              </Center>
              <Text flex="1" minW="0" textStyle="small" color="fg.secondary" truncate>
                {item.title}
              </Text>
              <Text textStyle="caption" color="fg.muted" flexShrink="0">
                {relTime(item.createdAt)}
              </Text>
            </HStack>
          </Link>
        </ChakraLink>
      )
    })}
  </Stack>
)
