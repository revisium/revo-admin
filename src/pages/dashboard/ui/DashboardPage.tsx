import { Box, Button, Link as ChakraLink, Flex, Grid, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { ArrowRight, CircleCheck, DoorOpen, Play, RefreshCw, TriangleAlert } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router'
import { SystemStatusViewModel } from 'src/entities/system-status'
import { PENDING_INBOX, PENDING_QUEUE, RECENT_RUNS, statusCount } from 'src/shared/fixtures'
import { useViewModel } from 'src/shared/lib'
import { SectionHeading } from 'src/shared/ui'
import { DecideCallout } from './DecideCallout'
import { HostStatusCard } from './HostStatusCard'
import { MiniQueue } from './MiniQueue'
import { RunRow } from 'src/entities/run'
import { StatCard, type StatDef } from './StatCard'
import { routes } from 'src/shared/config'
import { PageHeader } from 'src/shared/ui/components'

const STAT_DEFS: ReadonlyArray<StatDef> = [
  { key: 'running', label: 'Running', tone: 'running', icon: Play, hint: 'agents active now', to: routes.runs() },
  {
    key: 'awaiting_approval',
    label: 'Awaiting approval',
    tone: 'waiting',
    icon: DoorOpen,
    hint: 'gates need you',
    to: routes.inbox(),
    accent: true,
  },
  {
    key: 'completed',
    label: 'Completed today',
    tone: 'success',
    icon: CircleCheck,
    hint: 'merged & closed',
    to: routes.runs(),
  },
  { key: 'failed', label: 'Failed', tone: 'failed', icon: TriangleAlert, hint: 'in last 24h', to: routes.runs() },
]

const Eyebrow = (
  <HStack gap="2" align="center">
    <Box boxSize="2" borderRadius="full" bg="fg.default" />
    <Text as="span">Control room · all projects</Text>
  </HStack>
)

const RefreshButton = ({ loading, onRefresh }: { readonly loading: boolean; readonly onRefresh: () => void }) => (
  <Button
    size="sm"
    h="36px"
    px="3.5"
    gap="2"
    bg="transparent"
    color="fg.secondary"
    borderRadius="control"
    disabled={loading}
    onClick={onRefresh}
    _hover={{ bg: 'action.secondary.hoverBg', color: 'fg.default' }}
  >
    <RefreshCw size={15} />
    Refresh
  </Button>
)

export const DashboardPage = observer(() => {
  const systemStatus = useViewModel(SystemStatusViewModel)

  return (
    <Stack gap="7">
      <PageHeader
        eyebrow={Eyebrow}
        title="Dashboard"
        description="Calm control over the local orchestrator — what's running, what needs you, what it cost."
        actions={<RefreshButton loading={systemStatus.isLoading} onRefresh={systemStatus.refresh} />}
      />

      <HostStatusCard
        error={systemStatus.error}
        hostLabel={systemStatus.hostLabel}
        issues={systemStatus.issues}
        metaLabel={systemStatus.metaLabel}
        metaValue={systemStatus.metaValue}
        statusLabel={systemStatus.statusLabel}
        statusTone={systemStatus.statusTone}
        stats={systemStatus.stats}
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4">
        {STAT_DEFS.map((def) => (
          <StatCard key={def.key} def={def} count={statusCount(def.key)} />
        ))}
      </SimpleGrid>

      <Grid
        templateColumns={{ base: '1fr', xl: 'minmax(0, 2fr) minmax(0, 1fr)' }}
        gap={{ base: '6', xl: '8' }}
        alignItems="start"
      >
        <Stack gap="3.5">
          <Flex align="flex-end" justify="space-between" gap="4">
            <Box>
              <SectionHeading>Recent runs</SectionHeading>
              <Text textStyle="small" color="fg.secondary">
                Latest task runs across all repos
              </Text>
            </Box>
            <ChakraLink
              asChild
              color="fg.secondary"
              textStyle="body"
              _hover={{ color: 'fg.default', textDecoration: 'none' }}
            >
              <Link to={routes.runs()}>
                <HStack gap="1.5">
                  <Text>View all</Text>
                  <ArrowRight size={14} />
                </HStack>
              </Link>
            </ChakraLink>
          </Flex>
          <Box
            containerType="inline-size"
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border.structural"
            borderRadius="card"
            boxShadow="popover"
            overflow="hidden"
          >
            {RECENT_RUNS.map((run) => (
              <RunRow key={run.id} run={run} variant="recent" />
            ))}
          </Box>
        </Stack>

        <Stack gap="3.5">
          <SectionHeading>Pending decisions</SectionHeading>
          <DecideCallout count={PENDING_INBOX.length} />
          <MiniQueue items={PENDING_QUEUE} />
        </Stack>
      </Grid>
    </Stack>
  )
})
