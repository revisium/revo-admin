import { HStack, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface SidebarGroupProps {
  readonly actions?: ReactNode
  readonly children: ReactNode
  readonly label: string
}

export const SidebarGroup = ({ actions, children, label }: SidebarGroupProps) => (
  <Stack as="section" h="full" minH="0" gap="1" aria-label={label}>
    <HStack h={{ base: '44px', lg: '36px' }} px="2" justify="space-between" gap="2" flexShrink="0">
      <Text textStyle="caption" color="fg.muted" fontWeight="600" truncate>
        {label}
      </Text>
      {actions}
    </HStack>
    <Stack as="nav" aria-label={label} flex="1" minH="0" gap="1" overflowY="auto">
      {children}
    </Stack>
  </Stack>
)

SidebarGroup.displayName = 'SidebarGroup'

export type { SidebarGroupProps }
