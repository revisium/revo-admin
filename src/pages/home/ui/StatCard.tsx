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

interface StatCardProps {
  readonly def: StatDef
  readonly count: number
}

export const StatCard = ({ def, count }: StatCardProps) => {
  const Icon = def.icon
  return (
    <ChakraLink
      asChild
      className="group"
      display="block"
      bg={def.accent ? undefined : 'bg.surface'}
      bgGradient={def.accent ? 'to-b' : undefined}
      gradientFrom={def.accent ? 'bg.subtle' : undefined}
      gradientTo={def.accent ? 'bg.surface' : undefined}
      borderWidth="1px"
      borderColor={def.accent ? 'border.structural' : 'border'}
      borderRadius="card"
      boxShadow="popover"
      p="4"
      transition="transform 150ms, box-shadow 150ms, border-color 150ms"
      _hover={{
        textDecoration: 'none',
        bg: 'bg.subtle',
        borderColor: 'border.strong',
      }}
    >
      <Link to={def.to}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb="3.5">
          <Center boxSize="32px" borderRadius="9px" bg={'bg.subtle'} color={`status.${def.tone}.fg`}>
            <Icon size={16} />
          </Center>
          <Box
            color="fg.muted"
            opacity="0"
            transform="translateX(0)"
            transition="opacity 150ms, transform 150ms"
            _groupHover={{ opacity: 1, transform: 'translateX(2px)' }}
          >
            <ArrowRight size={15} />
          </Box>
        </Box>
        <Text
          className="tnum"
          fontSize="34px"
          fontWeight="680"
          letterSpacing="-0.03em"
          lineHeight="1"
          color="fg.default"
        >
          {count}
        </Text>
        <Text textStyle="bodyStrong" color="fg.secondary" mt="2">
          {def.label}
        </Text>
        <Stack gap="0">
          <Text textStyle="caption" color="fg.muted" mt="0.5">
            {def.hint}
          </Text>
        </Stack>
      </Link>
    </ChakraLink>
  )
}
