import { Box, Button, Flex, Grid, HStack, Link as ChakraLink, Span, Stack, Tabs, Text } from '@chakra-ui/react'
import {
  Activity,
  ArrowRight,
  CircleDollarSign,
  Clock3,
  DoorOpen,
  ExternalLink,
  History,
  Layers3,
  Pause,
  RotateCcw,
  Sparkles,
  TriangleAlert,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { RunProgressGraph } from 'src/features/RunProgressGraph'
import {
  RUN_ATTEMPTS,
  RUN_BUDGET,
  RUN_COSTS,
  RUN_COST_TOTALS,
  RUN_DETAIL_TABS,
  RUN_EVENTS_DESC,
  absTime,
  costShare,
  currentRunStep,
  formatRunCost,
  formatTokens,
  initials,
  latestAttempt,
  relTime,
  runById,
  runDetailSteps,
} from 'src/shared/fixtures'
import type { Attempt, RunDetailStep, RunEvent, TaskRun } from 'src/shared/fixtures'
import { AvatarInitials, Card, CostMeter, RoleToken, StatusBadge, TagList, toneForStatus } from 'src/shared/ui'

interface RunDetailPageProps {
  readonly runId: string
}

interface SummaryCell {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly sub?: string
  readonly icon: LucideIcon
  readonly mono?: boolean
  readonly tone?: string
}

const secondaryButton = {
  h: '36px',
  px: '3.5',
  gap: '2',
  bg: 'bg.1',
  color: 'fg.1',
  borderWidth: '1px',
  borderColor: 'border.warmStrong',
  borderRadius: 'btn',
  _hover: { bg: 'blackAlpha.50', color: 'fg.0' },
} as const

const primaryButton = {
  h: '36px',
  px: '3.5',
  gap: '2',
  bg: 'brand.500',
  color: 'brand.on',
  borderRadius: 'btn',
  _hover: { bg: 'brand.hover' },
} as const

const RunActions = ({ run }: { readonly run: TaskRun }) => {
  const ProgressAction = run.status === 'failed' ? RotateCcw : Pause
  const progressLabel = run.status === 'failed' ? 'Re-run' : 'Pause'
  const showProgressAction = run.status === 'running' || run.status === 'planning' || run.status === 'failed'
  const gateLabel = run.status === 'awaiting_approval' ? 'Resolve gate' : 'Open gate'
  const gateTarget = run.status === 'awaiting_approval' ? '/inbox/ibx_merge_01' : '/inbox/ibx_plan_01'

  return (
    <HStack gap="2" wrap="wrap" justify={{ base: 'flex-start', lg: 'flex-end' }}>
      <Button size="sm" {...secondaryButton}>
        <Activity size={15} />
        Activity
      </Button>
      <Button size="sm" {...secondaryButton}>
        <ExternalLink size={15} />
        Repo
      </Button>
      {showProgressAction ? (
        <Button size="sm" {...secondaryButton}>
          <ProgressAction size={15} />
          {progressLabel}
        </Button>
      ) : null}
      <Button asChild size="sm" {...primaryButton}>
        <Link to={gateTarget}>
          <DoorOpen size={15} />
          {gateLabel}
        </Link>
      </Button>
    </HStack>
  )
}

const RunHeader = ({ run }: { readonly run: TaskRun }) => (
  <Stack gap="5">
    <ChakraLink
      asChild
      alignSelf="flex-start"
      color="fg.2"
      textStyle="medium-xs"
      _hover={{ color: 'fg.0', textDecoration: 'none' }}
    >
      <Link to="/runs">Back to runs</Link>
    </ChakraLink>
    <Flex align="flex-start" justify="space-between" gap="6" direction={{ base: 'column', lg: 'row' }}>
      <Stack gap="3" minW="0">
        <HStack gap="2" color="fg.2" textStyle="regular-xs" wrap="wrap">
          <Text className="mono" color="brand.500" fontWeight="650">
            {run.id}
          </Text>
          <Span color="fg.3">·</Span>
          <Text className="mono">{run.scope}</Text>
        </HStack>
        <Text textStyle="bold-xxl" color="fg.0" lineHeight="1.12" letterSpacing="-0.025em" maxW="760px">
          {run.title}
        </Text>
        <Text textStyle="regular-body" color="fg.2" maxW="680px">
          {run.description}
        </Text>
        <HStack gap="3" wrap="wrap">
          <StatusBadge status={run.status} />
          <TagList items={run.repos} />
          <HStack gap="2" color="fg.1" textStyle="regular-xs">
            <AvatarInitials label={initials(run.createdBy)} system={run.createdBy === 'orchestrator'} />
            <Text className="mono">{run.createdBy}</Text>
          </HStack>
          <HStack gap="1.5" color="fg.3" textStyle="regular-xs">
            <Clock3 size={13} />
            <Text>{absTime(run.createdAt)}</Text>
          </HStack>
        </HStack>
      </Stack>
      <RunActions run={run} />
    </Flex>
  </Stack>
)

const summaryCells = (run: TaskRun, steps: ReadonlyArray<RunDetailStep>): ReadonlyArray<SummaryCell> => {
  const current = currentRunStep(steps)
  return [
    { id: 'pipeline', label: 'Pipeline', value: 'feature-default', mono: true, icon: Layers3 },
    {
      id: 'current',
      label: 'Current step',
      value: current?.label ?? '—',
      icon: Zap,
      tone: current ? toneForStatus(current.status) : undefined,
    },
    { id: 'attempts', label: 'Attempts', value: String(RUN_ATTEMPTS.length), icon: History },
    {
      id: 'spend',
      label: 'Spend',
      value: formatRunCost(run.spend),
      sub: `of ${formatRunCost(RUN_BUDGET.limit)}`,
      icon: CircleDollarSign,
      mono: true,
    },
  ]
}

const RunSummaryStrip = ({ run, steps }: { readonly run: TaskRun; readonly steps: ReadonlyArray<RunDetailStep> }) => (
  <Grid
    templateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }}
    bg="bg.1"
    borderWidth="1px"
    borderColor="border"
    borderRadius="warmCard"
    boxShadow="sh-1"
    overflow="hidden"
  >
    {summaryCells(run, steps).map((cell) => {
      const Icon = cell.icon
      return (
        <Stack
          key={cell.id}
          gap="1.5"
          p="4"
          borderRightWidth={{ xl: '1px' }}
          borderColor="border"
          _last={{ borderRightWidth: '0' }}
        >
          <HStack gap="1.5" color="fg.2" textStyle="regular-xs">
            <Icon size={13} />
            <Text>{cell.label}</Text>
          </HStack>
          <HStack gap="2" minW="0">
            {cell.tone ? <Box boxSize="2" borderRadius="full" bg={`dot.${cell.tone}`} flexShrink="0" /> : null}
            <Text className={cell.mono ? 'mono' : undefined} textStyle="semibold-md" color="fg.0" truncate>
              {cell.value}
            </Text>
            {cell.sub ? (
              <Text className="mono" textStyle="regular-xs" color="fg.3" flexShrink="0">
                {cell.sub}
              </Text>
            ) : null}
          </HStack>
        </Stack>
      )
    })}
  </Grid>
)

const CurrentStepCard = ({ steps }: { readonly steps: ReadonlyArray<RunDetailStep> }) => {
  const current = currentRunStep(steps)
  if (!current) return null

  const attempt = latestAttempt()
  return (
    <Card>
      <Stack gap="4">
        <HStack gap="3" align="start">
          <RoleToken name={current.role} size={34} />
          <Stack gap="0.5" flex="1" minW="0">
            <Text textStyle="semibold-md" color="fg.0">
              {current.label}
            </Text>
            <Text className="mono" textStyle="regular-xs" color="fg.3">
              attempt #{attempt.attemptNo} · {attempt.modelProfile}
            </Text>
          </Stack>
          <StatusBadge status={current.status} size="sm" />
        </HStack>
        <HStack
          gap="2"
          px="3"
          py="2.5"
          borderRadius="9px"
          bg="brand.tint"
          borderWidth="1px"
          borderColor="brand.softBorder"
          color="brand.ink"
          textStyle="regular-xs"
        >
          <Box boxSize="2" borderRadius="full" bg="brand.500" />
          <Text className="mono">implementing changelog generation step...</Text>
        </HStack>
        <HStack gap="2" wrap="wrap">
          <Metric label="in" value={formatTokens(attempt.inputTokens)} />
          <ArrowRight size={13} />
          <Metric label="out" value={formatTokens(attempt.outputTokens)} />
          <Metric label="cost" value={formatRunCost(attempt.costAmount)} />
        </HStack>
      </Stack>
    </Card>
  )
}

const Metric = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <HStack gap="1.5" px="2.5" py="1.5" bg="bg.inset" borderRadius="7px" textStyle="regular-xs">
    <Text color="fg.3">{label}</Text>
    <Text className="mono tnum" color="fg.0" fontWeight="620">
      {value}
    </Text>
  </HStack>
)

const eventIcon = (event: RunEvent) => {
  if (event.type.startsWith('gate')) return DoorOpen
  if (event.type.startsWith('attempt')) return History
  if (event.type.startsWith('step')) return Zap
  if (event.type.startsWith('run.planned')) return Layers3
  return Activity
}

const eventTone = (event: RunEvent): string => {
  if (event.type.includes('failed')) return 'failed'
  if (event.type.includes('approved')) return 'success'
  if (event.type.includes('opened')) return 'waiting'
  return 'neutral'
}

const ActivityFeed = () => (
  <Card p="0" overflow="hidden">
    <HStack h="42px" px="4" borderBottomWidth="1px" borderColor="border" justify="space-between">
      <Text textStyle="semibold-sm" color="fg.0">
        Activity
      </Text>
      <Text textStyle="regular-xs" color="fg.3">
        {RUN_EVENTS_DESC.length} events
      </Text>
    </HStack>
    <Stack gap="0">
      {RUN_EVENTS_DESC.map((event) => {
        const Icon = eventIcon(event)
        const tone = eventTone(event)
        return (
          <Grid
            key={event.id}
            templateColumns="auto minmax(0, 1fr) auto"
            gap="3"
            alignItems="start"
            px="4"
            py="3"
            borderBottomWidth="1px"
            borderColor="border.subtle"
            _last={{ borderBottomWidth: '0' }}
          >
            <Box
              display="grid"
              placeItems="center"
              boxSize="26px"
              borderRadius="8px"
              bg={`status.${tone}.bg`}
              color={`status.${tone}.fg`}
              borderWidth="1px"
              borderColor={`status.${tone}.border`}
            >
              <Icon size={13} />
            </Box>
            <Stack gap="0.5" minW="0">
              <HStack gap="2" minW="0">
                <Text className="mono" textStyle="medium-xs" color="fg.0" truncate>
                  {event.type}
                </Text>
                <Text textStyle="regular-xs" color="fg.3" flexShrink="0">
                  {event.actor}
                </Text>
              </HStack>
              <Text className="mono" textStyle="regular-micro" color="fg.3" truncate>
                {event.payloadSummary}
              </Text>
            </Stack>
            <Text textStyle="regular-xs" color="fg.3" whiteSpace="nowrap">
              {relTime(event.createdAt)}
            </Text>
          </Grid>
        )
      })}
    </Stack>
  </Card>
)

const PipelineTab = ({ steps }: { readonly steps: ReadonlyArray<RunDetailStep> }) => (
  <Grid templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 320px' }} gap="5" alignItems="start">
    <Card p="0" overflow="hidden">
      <HStack px="4" py="3.5" justify="space-between" borderBottomWidth="1px" borderColor="border" gap="4">
        <Stack gap="0.5">
          <Text textStyle="semibold-md" color="fg.0">
            Pipeline
          </Text>
          <Text className="mono" textStyle="regular-xs" color="fg.3">
            feature-default · 6 steps · review loop enabled
          </Text>
        </Stack>
        <HStack gap="1.5" color="brand.ink" textStyle="regular-xs" flexShrink="0">
          <Sparkles size={13} />
          <Text>current step pulses</Text>
        </HStack>
      </HStack>
      <RunProgressGraph />
    </Card>
    <Stack gap="4">
      <CurrentStepCard steps={steps} />
      <ActivityFeed />
    </Stack>
  </Grid>
)

const ATTEMPT_COLUMNS = '56px minmax(0, 1.4fr) 120px minmax(0, 1.5fr) 168px 80px'

const attemptGridCss = {
  '@container (max-width: 820px)': { gridTemplateColumns: '48px minmax(0, 1fr) 116px 84px' },
  '@container (max-width: 520px)': { gridTemplateColumns: '44px minmax(0, 1fr) 92px' },
} as const

const modelColumnCss = { '@container (max-width: 820px)': { display: 'none' } } as const

const tokensColumnCss = { '@container (max-width: 820px)': { display: 'none' } } as const

const costColumnCss = { '@container (max-width: 520px)': { display: 'none' } } as const

const AttemptTableHeader = () => (
  <Grid
    templateColumns={ATTEMPT_COLUMNS}
    gap="3"
    alignItems="center"
    h="40px"
    px="4.5"
    bg="bg.inset"
    borderBottomWidth="1px"
    borderColor="border"
    css={attemptGridCss}
  >
    <AttemptHeaderCell>#</AttemptHeaderCell>
    <AttemptHeaderCell>Step</AttemptHeaderCell>
    <AttemptHeaderCell>Verdict</AttemptHeaderCell>
    <AttemptHeaderCell css={modelColumnCss}>Model</AttemptHeaderCell>
    <AttemptHeaderCell css={tokensColumnCss}>Tokens (in / out)</AttemptHeaderCell>
    <AttemptHeaderCell css={costColumnCss} textAlign="right">
      Cost
    </AttemptHeaderCell>
  </Grid>
)

const AttemptHeaderCell = ({
  children,
  css,
  textAlign = 'left',
}: {
  readonly children: ReactNode
  readonly css?: Record<string, unknown>
  readonly textAlign?: 'left' | 'right'
}) => (
  <Text
    textStyle="semibold-sm"
    color="fg.3"
    fontSize="11.5px"
    textTransform="uppercase"
    letterSpacing=".04em"
    textAlign={textAlign}
    css={css}
  >
    {children}
  </Text>
)

const AttemptNote = ({ attempt }: { readonly attempt: Attempt }) => {
  if (!attempt.error && !attempt.lesson) return null

  return (
    <Stack
      gap="2"
      mx="4.5"
      mb="3.5"
      px="3.5"
      py="3"
      bg="bg.inset"
      borderWidth="1px"
      borderColor="border"
      borderRadius="9px"
      color="fg.1"
      textStyle="regular-xs"
    >
      {attempt.error ? (
        <HStack gap="2" align="flex-start" color="status.failed.fg">
          <TriangleAlert size={13} />
          <Text>{attempt.error}</Text>
        </HStack>
      ) : null}
      {attempt.lesson ? (
        <HStack gap="2" align="baseline">
          <Span
            px="1.5"
            py="0.5"
            borderRadius="4px"
            bg="status.waiting.bg"
            borderWidth="1px"
            borderColor="status.waiting.border"
            color="status.waiting.fg"
            fontSize="10px"
            fontWeight="700"
            textTransform="uppercase"
            letterSpacing=".06em"
            flexShrink="0"
          >
            Lesson
          </Span>
          <Text>{attempt.lesson}</Text>
        </HStack>
      ) : null}
    </Stack>
  )
}

const AttemptsTab = () => (
  <Box containerType="inline-size">
    <Card p="0" overflow="hidden">
      <AttemptTableHeader />
      {RUN_ATTEMPTS.map((attempt) => (
        <Box key={attempt.id} bg="bg.1" borderBottomWidth="1px" borderColor="border" _last={{ borderBottomWidth: '0' }}>
          <Grid templateColumns={ATTEMPT_COLUMNS} gap="3" alignItems="center" px="4.5" py="3.5" css={attemptGridCss}>
            <Text className="mono tnum" textStyle="medium-xs" color="fg.3">
              #{attempt.attemptNo}
            </Text>
            <HStack gap="2.5" minW="0">
              <RoleToken name={attempt.stepLabel} size={24} />
              <Text textStyle="medium-sm" color="fg.0" truncate>
                {attempt.stepLabel}
              </Text>
            </HStack>
            <Box>
              <StatusBadge status={attempt.status} size="sm" />
            </Box>
            <Text className="mono" textStyle="regular-xs" color="fg.1" truncate css={modelColumnCss}>
              {attempt.modelProfile}
            </Text>
            <Text className="mono tnum" textStyle="regular-xs" color="fg.1" css={tokensColumnCss}>
              {formatTokens(attempt.inputTokens)} <Span color="fg.3">/</Span> {formatTokens(attempt.outputTokens)}
            </Text>
            <Text className="mono tnum" textStyle="medium-sm" color="fg.0" textAlign="right" css={costColumnCss}>
              {formatRunCost(attempt.costAmount)}
            </Text>
          </Grid>
          <AttemptNote attempt={attempt} />
        </Box>
      ))}
    </Card>
  </Box>
)

const CostTab = () => (
  <Grid templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 320px' }} gap="5" alignItems="start">
    <Box containerType="inline-size">
      <Card p="0" overflow="hidden">
        {RUN_COSTS.map((row) => (
          <Grid
            key={row.id}
            templateColumns="minmax(0, 1.4fr) 112px 96px 96px minmax(96px, .8fr) 84px"
            gap="3"
            alignItems="center"
            px="4"
            py="3"
            borderBottomWidth="1px"
            borderColor="border.subtle"
          >
            <Text textStyle="medium-sm" color="fg.0" truncate>
              {row.attemptLabel}
            </Text>
            <Text
              className="mono"
              textStyle="regular-xs"
              color="fg.2"
              css={{ '@container (max-width: 760px)': { display: 'none' } }}
            >
              {row.modelProfile}
            </Text>
            <Text
              className="mono tnum"
              textStyle="regular-xs"
              color="fg.2"
              css={{ '@container (max-width: 640px)': { display: 'none' } }}
            >
              {formatTokens(row.inputTokens)}
            </Text>
            <Text
              className="mono tnum"
              textStyle="regular-xs"
              color="fg.2"
              css={{ '@container (max-width: 640px)': { display: 'none' } }}
            >
              {formatTokens(row.outputTokens)}
            </Text>
            <Box h="7px" borderRadius="pill" bg="bg.inset" overflow="hidden">
              <Box h="full" w={costShare(row.costAmount, RUN_COST_TOTALS.maxAmount)} bg="brand.500" />
            </Box>
            <Text className="mono tnum" textStyle="medium-sm" color="fg.1" textAlign="right">
              {formatRunCost(row.costAmount)}
            </Text>
          </Grid>
        ))}
        <Grid
          templateColumns="minmax(0, 1.4fr) 112px 96px 96px minmax(96px, .8fr) 84px"
          gap="3"
          alignItems="center"
          px="4"
          py="3.5"
          bg="bg.inset"
        >
          <Text textStyle="semibold-sm" color="fg.0">
            Run total
          </Text>
          <Text
            className="mono"
            textStyle="regular-xs"
            color="fg.2"
            css={{ '@container (max-width: 760px)': { display: 'none' } }}
          >
            {RUN_COST_TOTALS.attempts} attempts
          </Text>
          <Text
            className="mono tnum"
            textStyle="regular-xs"
            color="fg.2"
            css={{ '@container (max-width: 640px)': { display: 'none' } }}
          >
            {formatTokens(RUN_COST_TOTALS.inputTokens)}
          </Text>
          <Text
            className="mono tnum"
            textStyle="regular-xs"
            color="fg.2"
            css={{ '@container (max-width: 640px)': { display: 'none' } }}
          >
            {formatTokens(RUN_COST_TOTALS.outputTokens)}
          </Text>
          <Box />
          <Text className="mono tnum" textStyle="semibold-sm" color="fg.0" textAlign="right">
            {formatRunCost(RUN_COST_TOTALS.amount)}
          </Text>
        </Grid>
      </Card>
    </Box>
    <Card>
      <Stack gap="4">
        <Text textStyle="semibold-md" color="fg.0">
          Budget
        </Text>
        <CostMeter spent={RUN_BUDGET.spent} limit={RUN_BUDGET.limit} estimate={RUN_BUDGET.estimate} />
        <Grid templateColumns="1fr 1fr" gap="3" textStyle="regular-xs">
          <BudgetField label="Per-attempt cap" value="$1.50" />
          <BudgetField
            label="Tokens total"
            value={formatTokens(RUN_COST_TOTALS.inputTokens + RUN_COST_TOTALS.outputTokens)}
          />
          <BudgetField label="Avg / attempt" value={formatRunCost(RUN_COST_TOTALS.amount / RUN_COST_TOTALS.attempts)} />
          <BudgetField label="Billing" value="price before bill" mono={false} />
        </Grid>
      </Stack>
    </Card>
  </Grid>
)

const BudgetField = ({
  label,
  value,
  mono = true,
}: {
  readonly label: string
  readonly value: string
  readonly mono?: boolean
}) => (
  <Stack gap="1" p="3" bg="bg.inset" borderRadius="8px">
    <Text color="fg.3">{label}</Text>
    <Text className={mono ? 'mono' : undefined} color="fg.0" fontWeight="600">
      {value}
    </Text>
  </Stack>
)

export const RunDetailPage = ({ runId }: RunDetailPageProps) => {
  const run = runById(runId)
  const steps = runDetailSteps(run)

  return (
    <Stack gap="6">
      <RunHeader run={run} />
      <RunSummaryStrip run={run} steps={steps} />
      <Tabs.Root defaultValue="pipeline" variant="line">
        <Tabs.List overflowX="auto" css={{ '& > *': { flexShrink: 0 }, scrollbarWidth: 'none' }}>
          {RUN_DETAIL_TABS.map((tab) => (
            <Tabs.Trigger key={tab.id} value={tab.id}>
              {tab.label}
              {'count' in tab ? (
                <Span className="mono tnum" color="fg.3" ml="1.5">
                  {tab.count}
                </Span>
              ) : null}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Box pt="5">
          <Tabs.Content value="pipeline">
            <PipelineTab steps={steps} />
          </Tabs.Content>
          <Tabs.Content value="attempts">
            <AttemptsTab />
          </Tabs.Content>
          <Tabs.Content value="cost">
            <CostTab />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Stack>
  )
}
