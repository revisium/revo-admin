import { Box, Center, Flex, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { BookOpen, GitBranch, Layers, Terminal, type LucideIcon } from 'lucide-react'
import type { SystemHostStat, SystemHostStatKey, SystemStatusTone } from 'src/entities/system-status'

interface HostStatusCardProps {
  readonly error: string | null
  readonly hostLabel: string
  readonly issues: readonly string[]
  readonly metaLabel: string
  readonly metaValue: string
  readonly statusLabel: string
  readonly statusTone: SystemStatusTone
  readonly stats: readonly SystemHostStat[]
}

const ICONS: Record<SystemHostStatKey, LucideIcon> = {
  branch: BookOpen,
  daemon: Terminal,
  doctor: Layers,
  project: GitBranch,
}

export const HostStatusCard = ({
  error,
  hostLabel,
  issues,
  metaLabel,
  metaValue,
  statusLabel,
  statusTone,
  stats,
}: HostStatusCardProps) => (
  <Box bg="bg.1" borderWidth="1px" borderColor="border" borderRadius="warmCard" boxShadow="sh-1" overflow="hidden">
    <Flex
      align="center"
      justify="space-between"
      gap="4"
      px="5"
      py="4"
      borderBottomWidth="1px"
      borderColor="border"
      bgGradient="to-b"
      gradientFrom="brand.tint"
      gradientTo="transparent"
    >
      <HStack gap="3" minW="0">
        <Center
          boxSize="30px"
          borderRadius="9px"
          bg={`status.${statusTone}.bg`}
          borderWidth="1px"
          borderColor={`status.${statusTone}.border`}
        >
          <Box boxSize="2.5" borderRadius="full" bg={`dot.${statusTone}`} boxShadow="0 0 0 3px rgba(106,154,46,.22)" />
        </Center>
        <Box minW="0">
          <Text textStyle="semibold-body" color="fg.0">
            {statusLabel}
          </Text>
          <Text className="mono" textStyle="regular-xs" color="fg.2" truncate>
            {hostLabel}
          </Text>
        </Box>
      </HStack>
      <Stack gap="0" textAlign="right" flexShrink="0">
        <Text textStyle="regular-micro" color="fg.3" textTransform="uppercase" letterSpacing="0.05em">
          {metaLabel}
        </Text>
        <Text className="mono" textStyle="regular-xs" color="fg.0" maxW="40vw" truncate>
          {metaValue}
        </Text>
      </Stack>
    </Flex>

    <SimpleGrid columns={{ base: 2, md: 4 }}>
      {stats.map((stat) => {
        const Icon = ICONS[stat.key]
        return (
          <Stack
            key={stat.key}
            gap="1.5"
            px="5"
            py="3.5"
            minW="0"
            borderRightWidth="1px"
            borderBottomWidth="1px"
            borderColor="border.subtle"
          >
            <HStack gap="1.5" color="fg.2" textStyle="regular-xs" whiteSpace="nowrap">
              <Box color="fg.3" display="inline-flex">
                <Icon size={14} />
              </Box>
              <Text>{stat.label}</Text>
            </HStack>
            {stat.mono ? (
              <Text className="mono" textStyle="regular-xs" color="fg.0" lineHeight="1.4" overflowWrap="anywhere">
                {stat.value}
              </Text>
            ) : (
              <HStack gap="2" color="fg.0" textStyle="medium-body">
                <Box boxSize="1.5" borderRadius="full" bg={`dot.${stat.tone}`} flexShrink="0" />
                <Text>{stat.value}</Text>
              </HStack>
            )}
          </Stack>
        )
      })}
    </SimpleGrid>

    {error ? (
      <Box px="5" py="3" borderTopWidth="1px" borderColor="border.subtle" bg="status.failed.bg">
        <Text textStyle="regular-xs" color="status.failed.fg" overflowWrap="anywhere">
          {error}
        </Text>
      </Box>
    ) : null}

    {issues.length ? (
      <Stack gap="1.5" px="5" py="3" borderTopWidth="1px" borderColor="border.subtle" bg="status.waiting.bg">
        {issues.map((issue) => (
          <Text key={issue} textStyle="regular-xs" color="status.waiting.fg" overflowWrap="anywhere">
            {issue}
          </Text>
        ))}
      </Stack>
    ) : null}
  </Box>
)
