import { Box, HStack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface FieldRowProps {
  readonly label: string
  readonly children: ReactNode
}

// Label/value pair for detail panels (.field-row): muted fixed-width key, ink
// value, hairline separator between rows.
export const FieldRow = ({ label, children }: FieldRowProps) => (
  <HStack
    align="start"
    gap="4"
    py="2.5"
    borderBottomWidth="1px"
    borderColor="border.structural"
    _last={{ borderBottomWidth: '0' }}
  >
    <Text textStyle="body" color="fg.secondary" minW="150px" flexShrink="0">
      {label}
    </Text>
    <Box flex="1" minW="0">
      {typeof children === 'string' ? (
        <Text textStyle="body" color="fg.default">
          {children}
        </Text>
      ) : (
        children
      )}
    </Box>
  </HStack>
)
