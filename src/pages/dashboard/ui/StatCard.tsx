import { Box, Center, Link as ChakraLink, Stack, Text } from '@chakra-ui/react'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import type { RunStatus } from 'src/shared/fixtures'
import type { StatusTone } from 'src/shared/ui'

export interface StatDef {
  readonly key: RunStatus
  readonly label: string
  readonly tone: StatusTone
  readonly icon: LucideIcon
  readonly hint: string
  readonly to: string
  readonly accent?: boolean
}

export const StatCard = ({ def, count }: { readonly def: StatDef; readonly count: number }) => {
  const Icon = def.icon
  return (
    <ChakraLink
      asChild
      className="group"
      display="block"
      bg={def.accent ? undefined : 'bg.1'}
      bgGradient={def.accent ? 'to-b' : undefined}
      gradientFrom={def.accent ? 'brand.tint' : undefined}
      gradientTo={def.accent ? 'bg.1' : undefined}
      borderWidth="1px"
      borderColor={def.accent ? 'brand.softBorder' : 'border'}
      borderRadius="warmCard"
      boxShadow="sh-1"
      p="4"
      transition="transform 150ms, box-shadow 150ms, border-color 150ms"
      _hover={{
        textDecoration: 'none',
        transform: 'translateY(-2px)',
        boxShadow: 'sh-2',
        borderColor: 'border.warmStrong',
      }}
    >
      <Link to={def.to}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb="3.5">
          <Center boxSize="32px" borderRadius="9px" bg={`status.${def.tone}.bg`} color={`status.${def.tone}.fg`}>
            <Icon size={16} />
          </Center>
          <Box
            color="fg.3"
            opacity="0"
            transform="translateX(0)"
            transition="opacity 150ms, transform 150ms"
            _groupHover={{ opacity: 1, transform: 'translateX(2px)' }}
          >
            <ArrowRight size={15} />
          </Box>
        </Box>
        <Text className="tnum" fontSize="34px" fontWeight="680" letterSpacing="-0.03em" lineHeight="1" color="fg.0">
          {count}
        </Text>
        <Text textStyle="semibold-sm" color="fg.1" mt="2">
          {def.label}
        </Text>
        <Stack gap="0">
          <Text textStyle="regular-xs" color="fg.3" mt="0.5">
            {def.hint}
          </Text>
        </Stack>
      </Link>
    </ChakraLink>
  )
}
