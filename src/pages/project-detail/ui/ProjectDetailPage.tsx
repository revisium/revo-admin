import { Box, Button, Center, Grid, HStack, Link as ChakraLink, Span, Stack, Text } from '@chakra-ui/react'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleDot,
  Command,
  Cpu,
  Database,
  GitBranch,
  GitPullRequest,
  History,
  Layers3,
  Pencil,
  Plus,
  Rocket,
  Terminal,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import {
  absTime,
  activityForProject,
  adrsForProject,
  knowledgeForProject,
  memoryForProject,
  projectById,
  relTime,
  reposForProject,
  runsForProject,
  type ProjectActivityEvent,
  type ProjectAdr,
  type ProjectKnowledgeArticle,
  type ProjectMemoryFact,
  type ProjectMemoryTable,
  type ProjectRepository,
  type ProjectRow,
  type ProjectTone,
} from 'src/shared/fixtures'
import { Card, EmptyState, StatusBadge, toneForStatus } from 'src/shared/ui'
import { Avatar, Badge, type IAvatarProps } from 'src/shared/ui/kit'

interface ProjectDetailPageProps {
  readonly projectId: string
  readonly tab?: string
}

interface ProjectAdrDetailPageProps {
  readonly projectId: string
  readonly adrId: string
}

interface ProjectKnowledgeArticlePageProps {
  readonly projectId: string
  readonly articleId: string
}

interface ProjectMemoryTablePageProps {
  readonly projectId: string
  readonly tableId: string
}

interface DetailTab {
  readonly id: string
  readonly label: string
  readonly count?: number
}

const RECENT_ADR_LIMIT = 4
const RECENT_ACTIVITY_LIMIT = 4
const ADR_NUMBER_WIDTH = 4
const OWNER_INITIALS_LENGTH = 2
const ADR_LINKED_COUNTS: Readonly<Record<number, number>> = {
  1: 3,
  2: 1,
  9: 1,
}
const ADR_ROW_HOVER_BG = 'bg.subtle'

const avatarToneForProject = (tone: ProjectTone): IAvatarProps['tone'] => {
  if (tone === 'teal') return 'muted'
  if (tone === 'plum') return 'waiting'
  if (tone === 'system') return 'system'
  return 'neutral'
}

const tabsForProject = (
  project: ProjectRow,
  repositories: ReadonlyArray<ProjectRepository>,
): ReadonlyArray<DetailTab> => [
  { id: 'overview', label: 'Overview' },
  { id: 'repositories', label: 'Repositories', count: repositories.length },
  { id: 'knowledge', label: 'Knowledge base', count: project.stats.kb },
  { id: 'adrs', label: 'ADRs', count: project.stats.adrs },
  { id: 'memory', label: 'Memory', count: project.stats.tables },
  { id: 'activity', label: 'Activity' },
]

const validTab = (tab: string | undefined): string => {
  if (tab === 'repositories') return tab
  if (tab === 'knowledge') return tab
  if (tab === 'adrs') return tab
  if (tab === 'memory') return tab
  if (tab === 'activity') return tab
  return 'overview'
}

const DetailHeader = ({ project }: { readonly project: ProjectRow }) => <FlexHeader project={project} />

const FlexHeader = ({ project }: { readonly project: ProjectRow }) => (
  <Grid templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) auto' }} gap="5" alignItems="start">
    <HStack gap="4" align="flex-start" minW="0">
      <Avatar size="xl" tone={avatarToneForProject(project.tone)}>
        {project.initials}
      </Avatar>
      <Stack gap="1.5" minW="0">
        <HStack gap="3" align="baseline" wrap="wrap">
          <Text className="mono" textStyle="small" color="fg.muted">
            {project.org} /
          </Text>
          <Text
            color="fg.default"
            fontSize={{ base: '28px', lg: '26px' }}
            fontWeight="720"
            lineHeight="1.08"
            letterSpacing="0"
          >
            {project.name}
          </Text>
        </HStack>
        <Text textStyle="body" color="fg.secondary" maxW="760px">
          {project.description}
        </Text>
      </Stack>
    </HStack>
    <HStack gap="2" wrap="wrap" justify={{ base: 'flex-start', xl: 'flex-end' }}>
      <Button
        size="sm"
        h="34px"
        px="3"
        gap="2"
        bg="bg.surface"
        color="fg.secondary"
        borderWidth="1px"
        borderColor="border.strong"
        borderRadius="control"
        _hover={{ bg: 'blackAlpha.50', color: 'fg.default' }}
      >
        <GitBranch size={14} />
        <Span className="mono">{project.defaultBranch}</Span>
        <ChevronDown size={13} />
      </Button>
      <HStack
        h="34px"
        px="3"
        gap="2"
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border.structural"
        borderRadius="control"
        color="fg.secondary"
        textStyle="caption"
      >
        <History size={13} />
        <Span className="mono">{project.headRev}</Span>
      </HStack>
      <Button
        size="sm"
        h="34px"
        px="3.5"
        gap="2"
        bg="bg.surface"
        color="fg.default"
        borderWidth="1px"
        borderColor="border.strong"
        borderRadius="control"
        boxShadow="popover"
        disabled
        _hover={{ bg: 'blackAlpha.50' }}
        _disabled={{ opacity: 0.58, cursor: 'not-allowed' }}
      >
        <Plus size={14} />
        New ADR
      </Button>
    </HStack>
  </Grid>
)

const DetailTabs = ({
  project,
  tabs,
  activeTab,
}: {
  readonly project: ProjectRow
  readonly tabs: ReadonlyArray<DetailTab>
  readonly activeTab: string
}) => (
  <HStack
    as="nav"
    gap="0"
    overflowX="auto"
    borderBottomWidth="1px"
    borderColor="border.structural"
    css={{ scrollbarWidth: 'none' }}
  >
    {tabs.map((tab) => {
      const active = tab.id === activeTab
      const to = tab.id === 'overview' ? `/projects/${project.id}` : `/projects/${project.id}/${tab.id}`

      return (
        <ChakraLink
          key={tab.id}
          asChild
          h="48px"
          px="4.5"
          display="inline-flex"
          alignItems="center"
          gap="2"
          flexShrink="0"
          borderBottomWidth="2px"
          borderColor={active ? 'action.primary.bg' : 'transparent'}
          bg="transparent"
          color={active ? 'fg.default' : 'fg.secondary'}
          textStyle={active ? 'bodyStrong' : 'body'}
          _hover={{ color: 'fg.default', textDecoration: 'none' }}
          _focusVisible={{ outlineWidth: '2px', outlineColor: 'blue.500', outlineOffset: '-2px' }}
        >
          <Link to={to}>
            {tab.label}
            {tab.count === undefined ? null : (
              <Span
                className="mono tnum"
                minW="5"
                h="5"
                px="1.5"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="pill"
                bg="bg.subtle"
                color="fg.muted"
                textStyle="caption"
              >
                {tab.count}
              </Span>
            )}
          </Link>
        </ChakraLink>
      )
    })}
  </HStack>
)

const StatCard = ({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: typeof GitBranch
  readonly label: string
  readonly value: number
}) => (
  <Card p="5" minH="136px">
    <Stack gap="3">
      <Center
        boxSize="32px"
        borderRadius="8px"
        bg="bg.subtle"
        color="action.primary.bg"
        borderWidth="1px"
        borderColor="border.structural"
      >
        <Icon size={15} />
      </Center>
      <Text className="tnum" color="fg.default" fontSize="30px" fontWeight="700" lineHeight="1">
        {value}
      </Text>
      <Text color="fg.secondary" textStyle="caption">
        {label}
      </Text>
    </Stack>
  </Card>
)

const SectionHead = ({
  title,
  to,
  action,
}: {
  readonly title: string
  readonly to?: string
  readonly action?: string
}) => (
  <HStack justify="space-between" mb="3">
    <Text textStyle="componentTitle" color="fg.default">
      {title}
    </Text>
    {to ? (
      <ChakraLink
        asChild
        color="fg.secondary"
        textStyle="caption"
        _hover={{ color: 'action.primary.bg', textDecoration: 'none' }}
      >
        <Link to={to}>
          {action ?? 'All'}
          <ArrowRight size={13} />
        </Link>
      </ChakraLink>
    ) : null}
  </HStack>
)

const AdrStatusBadge = ({
  status,
  children,
}: {
  readonly status: ProjectAdr['status']
  readonly children?: ReactNode
}) => {
  const palette = {
    accepted: { fg: 'status.success.fg', bg: 'status.success.bg', border: 'status.success.border' },
    proposed: { fg: 'status.waiting.fg', bg: 'status.waiting.bg', border: 'status.waiting.border' },
    superseded: { fg: 'fg.secondary', bg: 'bg.surface', border: 'border.strong' },
  }[status]

  return (
    <Span
      px="2"
      h="5"
      display="inline-flex"
      alignItems="center"
      width="fit-content"
      borderRadius="control"
      borderWidth="1px"
      color={palette.fg}
      bg={palette.bg}
      borderColor={palette.border}
      textStyle="caption"
      textTransform="capitalize"
      whiteSpace="nowrap"
    >
      {children ?? status}
    </Span>
  )
}

const formatAdrNumber = (number: number): string => `ADR-${String(number).padStart(ADR_NUMBER_WIDTH, '0')}`

const adrRouteId = (adr: ProjectAdr): string => formatAdrNumber(adr.number).toLowerCase()

const adrHref = (projectId: string, adr: ProjectAdr): string => `/projects/${projectId}/adrs/${adrRouteId(adr)}`

const compactDecisionStatus = (
  status: ProjectAdr['status'],
): {
  readonly label: string
  readonly fg: string
  readonly bg: string
  readonly border: string
  readonly dot: string
} => {
  if (status === 'proposed') {
    return {
      label: 'Awaiting Gate',
      fg: 'status.waiting.fg',
      bg: 'bg.subtle',
      border: 'border.structural',
      dot: 'dot.waiting',
    }
  }

  if (status === 'superseded') {
    return { label: 'Superseded', fg: 'fg.secondary', bg: 'bg.subtle', border: 'border.strong', dot: 'dot.muted' }
  }

  return {
    label: 'Committed',
    fg: 'status.success.fg',
    bg: 'bg.subtle',
    border: 'border.structural',
    dot: 'dot.success',
  }
}

const CompactDecisionStatus = ({ status }: { readonly status: ProjectAdr['status'] }) => {
  const palette = compactDecisionStatus(status)

  return (
    <HStack
      as="span"
      h="6"
      px="2.5"
      gap="1.5"
      width="fit-content"
      borderRadius="control"
      borderWidth="1px"
      color={palette.fg}
      bg={palette.bg}
      borderColor={palette.border}
      textStyle="body"
      whiteSpace="nowrap"
    >
      <Box boxSize="1.5" borderRadius="full" bg={palette.dot} />
      {palette.label}
    </HStack>
  )
}

const knowledgeStatusMeta = (
  status: NonNullable<ProjectKnowledgeArticle['status']>,
): {
  readonly label: string
  readonly fg: string
  readonly bg: string
  readonly border: string
  readonly dot: string
} => {
  // Each state carries its own surface and border, not just a differently coloured word: three
  // badges sharing one fill were told apart only by a 6px dot.
  if (status === 'in-review') {
    return {
      label: 'In Review',
      fg: 'status.waiting.fg',
      bg: 'status.waiting.bg',
      border: 'status.waiting.border',
      dot: 'dot.waiting',
    }
  }

  // Draft is the empty state of the scale, so it stays on the plain surface with a strong
  // hairline — an outline against the two filled states.
  if (status === 'draft') {
    return {
      label: 'Draft',
      fg: 'fg.secondary',
      bg: 'bg.surface',
      border: 'border.strong',
      dot: 'dot.neutral',
    }
  }

  return {
    label: 'Committed',
    fg: 'status.success.fg',
    bg: 'status.success.bg',
    border: 'status.success.border',
    dot: 'dot.success',
  }
}

const KnowledgeStatusBadge = ({ status }: { readonly status: NonNullable<ProjectKnowledgeArticle['status']> }) => {
  const palette = knowledgeStatusMeta(status)

  return (
    <HStack
      as="span"
      h="6"
      px="2.5"
      gap="1.5"
      borderRadius="control"
      borderWidth="1px"
      color={palette.fg}
      bg={palette.bg}
      borderColor={palette.border}
      textStyle="body"
      whiteSpace="nowrap"
    >
      <Box boxSize="1.5" borderRadius="full" bg={palette.dot} />
      {palette.label}
    </HStack>
  )
}

const MemoryKindBadge = ({ kind }: { readonly kind: ProjectMemoryTable['kind'] }) => {
  const palette = {
    decision: { fg: 'fg.default', bg: 'bg.surface', border: 'border.strong' },
    domain: { fg: 'fg.secondary', bg: 'bg.subtle', border: 'border.structural' },
    operational: { fg: 'status.running.fg', bg: 'status.running.bg', border: 'status.running.border' },
    risk: { fg: 'status.failed.fg', bg: 'status.failed.bg', border: 'status.failed.border' },
  }[kind]

  return (
    <Span
      px="2"
      h="5"
      display="inline-flex"
      alignItems="center"
      borderRadius="control"
      borderWidth="1px"
      color={palette.fg}
      bg={palette.bg}
      borderColor={palette.border}
      textStyle="caption"
      textTransform="capitalize"
      whiteSpace="nowrap"
    >
      {kind}
    </Span>
  )
}

const ActivityKindBadge = ({ kind }: { readonly kind: ProjectActivityEvent['kind'] }) => {
  const palette = {
    adr: { fg: 'fg.default', bg: 'bg.subtle', border: 'border.structural' },
    knowledge: { fg: 'fg.secondary', bg: 'bg.subtle', border: 'border.structural' },
    memory: { fg: 'status.running.fg', bg: 'bg.subtle', border: 'border.structural' },
    repo: { fg: 'fg.secondary', bg: 'bg.subtle', border: 'border' },
    run: { fg: 'status.success.fg', bg: 'bg.subtle', border: 'border.structural' },
  }[kind]

  return (
    <Span
      px="2"
      h="5"
      display="inline-flex"
      alignItems="center"
      borderRadius="control"
      borderWidth="1px"
      color={palette.fg}
      bg={palette.bg}
      borderColor={palette.border}
      textStyle="caption"
      textTransform="capitalize"
      whiteSpace="nowrap"
    >
      {kind}
    </Span>
  )
}

const RepoList = ({ repositories }: { readonly repositories: ReadonlyArray<ProjectRepository> }) => (
  <Card p="0" overflow="hidden">
    {repositories.map((repo) => (
      <HStack key={repo.id} gap="3" px="4" py="3" borderBottomWidth="1px" borderColor="border.structural">
        <Center
          boxSize="28px"
          borderRadius="8px"
          bg="bg.subtle"
          borderWidth="1px"
          borderColor="border.structural"
          color="fg.secondary"
        >
          <GitBranch size={14} />
        </Center>
        <Stack gap="0.5" minW="0" flex="1">
          <Text className="mono" textStyle="body" color="fg.default" truncate>
            {repo.name}
          </Text>
          <Text textStyle="caption" color="fg.secondary" truncate>
            {repo.description}
          </Text>
        </Stack>
        <Text className="mono" textStyle="caption" color="fg.muted" flexShrink="0">
          {repo.openPRs} PR · {repo.branches} br
        </Text>
      </HStack>
    ))}
  </Card>
)

const adrStatusLabel = (status: ProjectAdr['status']): string => {
  if (status === 'accepted') return 'Accepted'
  if (status === 'proposed') return 'Proposed'
  return 'Superseded'
}

const revisionStatus = (status: ProjectAdr['status']): ProjectAdr['status'] =>
  status === 'proposed' ? 'proposed' : 'accepted'

const linkedCountForAdr = (adr: ProjectAdr): number => ADR_LINKED_COUNTS[adr.number] ?? 0

const AdrTableHeaderCell = ({ children }: { readonly children: ReactNode }) => (
  <Text color="fg.muted" fontSize="11.5px" fontWeight="600" textTransform="uppercase" letterSpacing="0">
    {children}
  </Text>
)

const AdrList = ({ adrs }: { readonly adrs: ReadonlyArray<ProjectAdr> }) => (
  <Box containerType="inline-size">
    <Card p="0" overflow="hidden">
      {adrs.length === 0 ? (
        <Box px="4" py="5">
          <EmptyState title="No ADRs yet" description="Decision records will appear here once they are captured." />
        </Box>
      ) : (
        <>
          <Grid
            templateColumns="112px minmax(0, 1fr) 104px 124px 126px 86px"
            gap="2.5"
            alignItems="center"
            h="40px"
            px="4.5"
            bg="bg.subtle"
            borderBottomWidth="1px"
            borderColor="border.structural"
            css={{
              '@container (max-width: 760px)': {
                gridTemplateColumns: '96px minmax(0, 1fr) 116px 110px',
              },
            }}
          >
            <AdrTableHeaderCell>ADR</AdrTableHeaderCell>
            <AdrTableHeaderCell>Decision</AdrTableHeaderCell>
            <AdrTableHeaderCell>Status</AdrTableHeaderCell>
            <AdrTableHeaderCell>Revision</AdrTableHeaderCell>
            <Box css={{ '@container (max-width: 760px)': { display: 'none' } }}>
              <AdrTableHeaderCell>Author</AdrTableHeaderCell>
            </Box>
            <AdrTableHeaderCell>Updated</AdrTableHeaderCell>
          </Grid>
          {adrs.map((adr) => {
            const linkedCount = linkedCountForAdr(adr)

            return (
              <ChakraLink
                key={adr.id}
                asChild
                display="grid"
                gridTemplateColumns="112px minmax(0, 1fr) 104px 124px 126px 86px"
                gap="2.5"
                alignItems="center"
                px="4.5"
                py="2.5"
                minH="72px"
                borderBottomWidth="1px"
                borderColor="border.structural"
                color="inherit"
                textDecoration="none"
                _hover={{ bg: ADR_ROW_HOVER_BG }}
                _focusVisible={{ outlineWidth: '2px', outlineColor: 'blue.500', outlineOffset: '-2px' }}
                _last={{ borderBottomWidth: '0' }}
                css={{
                  '@container (max-width: 760px)': {
                    gridTemplateColumns: '96px minmax(0, 1fr) 116px 110px',
                  },
                }}
              >
                <Link to={adrHref(adr.projectId, adr)}>
                  <Text className="mono" color="action.primary.bg" textStyle="bodyStrong">
                    {formatAdrNumber(adr.number)}
                  </Text>
                  <Stack gap="1" minW="0">
                    <Text color="fg.default" textStyle="bodyStrong" lineHeight="1.25">
                      {adr.title}
                    </Text>
                    <HStack gap="1.5" wrap="wrap">
                      {adr.tags.map((tag) => (
                        <Badge key={tag} tone="quiet">
                          {tag}
                        </Badge>
                      ))}
                      {linkedCount > 0 ? (
                        <Text className="mono" textStyle="caption" color="fg.muted">
                          ⌘ {linkedCount}
                        </Text>
                      ) : null}
                    </HStack>
                  </Stack>
                  <AdrStatusBadge status={adr.status}>{adrStatusLabel(adr.status)}</AdrStatusBadge>
                  <CompactDecisionStatus status={revisionStatus(adr.status)} />
                  <HStack gap="2" minW="0" css={{ '@container (max-width: 760px)': { display: 'none' } }}>
                    <Avatar size="xs" shape="circle" tone={adr.owner === 'orchestrator' ? 'muted' : 'brand'}>
                      {ownerInitials(adr.owner)}
                    </Avatar>
                    <Text color="fg.secondary" textStyle="small" truncate>
                      {adr.owner}
                    </Text>
                  </HStack>
                  <Text color="fg.muted" textStyle="small" whiteSpace="nowrap">
                    {relTime(adr.createdAt)}
                  </Text>
                </Link>
              </ChakraLink>
            )
          })}
        </>
      )}
    </Card>
  </Box>
)

const RecentDecisionList = ({ adrs }: { readonly adrs: ReadonlyArray<ProjectAdr> }) => (
  <Card p="0" overflow="hidden">
    {adrs.map((adr) => (
      <Grid
        key={adr.id}
        templateColumns={{ base: '88px minmax(0, 1fr)', md: '112px minmax(0, 1fr) auto' }}
        gap="3"
        alignItems="center"
        px="4"
        py="3.5"
        borderBottomWidth="1px"
        borderColor="border.structural"
        _last={{ borderBottomWidth: '0' }}
      >
        <Text className="mono" color="action.primary.bg" textStyle="bodyStrong">
          {formatAdrNumber(adr.number)}
        </Text>
        <Text color="fg.default" textStyle="body" fontWeight="500" truncate>
          {adr.title}
        </Text>
        <Box display={{ base: 'none', md: 'block' }}>
          <CompactDecisionStatus status={adr.status} />
        </Box>
      </Grid>
    ))}
  </Card>
)

const KNOWLEDGE_CATEGORIES: ReadonlyArray<{
  readonly id: NonNullable<ProjectKnowledgeArticle['category']>
  readonly label: string
  readonly icon: typeof Layers3
}> = [
  { id: 'architecture', label: 'Architecture', icon: Layers3 },
  { id: 'product', label: 'Product', icon: Rocket },
  { id: 'runners', label: 'Runners', icon: Cpu },
]

const fallbackKnowledgeCategory = (
  article: ProjectKnowledgeArticle,
): NonNullable<ProjectKnowledgeArticle['category']> => {
  if (article.source === 'method') return 'architecture'
  if (article.source === 'run') return 'runners'
  return 'product'
}

const ownerInitials = (owner: string): string => owner.slice(0, OWNER_INITIALS_LENGTH)

const knowledgeArticleHref = (projectId: string, article: ProjectKnowledgeArticle): string =>
  `/projects/${projectId}/knowledge/${article.id}`

const knowledgeArticleForRouteId = (
  articles: ReadonlyArray<ProjectKnowledgeArticle>,
  articleId: string,
): ProjectKnowledgeArticle | undefined => articles.find((article) => article.id === articleId)

const KnowledgeArticleCard = ({
  article,
  projectId,
}: {
  readonly article: ProjectKnowledgeArticle
  readonly projectId: string
}) => {
  const status = article.status ?? 'committed'
  const version = article.version ?? 1

  return (
    <ChakraLink
      asChild
      display="block"
      h="100%"
      color="inherit"
      _hover={{ textDecoration: 'none' }}
      _focusVisible={{ outline: '2px solid', outlineColor: 'action.primary.bg', outlineOffset: '3px' }}
    >
      <Link to={knowledgeArticleHref(projectId, article)}>
        <Card
          className="group"
          p="4"
          minH="126px"
          h="100%"
          display="flex"
          flexDirection="column"
          transition="border-color 150ms, transform 150ms"
          _hover={{ borderColor: 'border.strong', transform: 'translateY(-1px)' }}
        >
          <Stack gap="3" h="100%">
            <HStack gap="3" align="start">
              <Stack gap="2" minW="0" flex="1">
                <Text textStyle="componentTitle" color="fg.default" lineHeight="1.25">
                  {article.title}
                </Text>
                <Text textStyle="small" color="fg.secondary" lineHeight="1.45">
                  {article.summary}
                </Text>
              </Stack>
              <KnowledgeStatusBadge status={status} />
            </HStack>
            <HStack mt="auto" gap="2" minW="0" color="fg.muted" textStyle="caption">
              <Text className="mono" whiteSpace="nowrap">
                v{version}
              </Text>
              <Span>·</Span>
              <Avatar size="xs" shape="circle" tone={article.owner === 'orchestrator' ? 'muted' : 'brand'}>
                {ownerInitials(article.owner)}
              </Avatar>
              <Text color="fg.secondary" truncate minW="0">
                {article.owner}
              </Text>
              <Text ml="auto" whiteSpace="nowrap">
                {relTime(article.updatedAt)}
              </Text>
            </HStack>
          </Stack>
        </Card>
      </Link>
    </ChakraLink>
  )
}

const KnowledgeCategorySection = ({
  category,
  articles,
  projectId,
}: {
  readonly category: (typeof KNOWLEDGE_CATEGORIES)[number]
  readonly articles: ReadonlyArray<ProjectKnowledgeArticle>
  readonly projectId: string
}) => {
  const Icon = category.icon

  if (articles.length === 0) return null

  return (
    <Stack gap="3">
      <HStack gap="2" color="fg.secondary">
        <Icon size={15} />
        <Text textStyle="bodyStrong" textTransform="uppercase" letterSpacing="0" color="fg.secondary">
          {category.label}
        </Text>
      </HStack>
      <Grid templateColumns={{ base: '1fr', xl: 'repeat(2, minmax(0, 1fr))' }} gap="4">
        {articles.map((article) => (
          <KnowledgeArticleCard key={article.id} article={article} projectId={projectId} />
        ))}
      </Grid>
    </Stack>
  )
}

const KnowledgeList = ({
  articles,
  projectId,
}: {
  readonly articles: ReadonlyArray<ProjectKnowledgeArticle>
  readonly projectId: string
}) => {
  if (articles.length === 0) {
    return <EmptyState title="No knowledge articles yet" description="Project knowledge will appear after ingestion." />
  }

  return (
    <Stack gap="7">
      {KNOWLEDGE_CATEGORIES.map((category) => (
        <KnowledgeCategorySection
          key={category.id}
          category={category}
          projectId={projectId}
          articles={articles.filter(
            (article) => (article.category ?? fallbackKnowledgeCategory(article)) === category.id,
          )}
        />
      ))}
    </Stack>
  )
}

const KnowledgeDocSection = ({ title, children }: { readonly title: string; readonly children: ReactNode }) => (
  <Box borderTopWidth="1px" borderColor="border.structural" pt="4">
    <Text color="fg.default" textStyle="bodyStrong" mb="2">
      {title}
    </Text>
    <Box color="fg.secondary" textStyle="small" lineHeight="1.6">
      {children}
    </Box>
  </Box>
)

const KnowledgeArticleDetail = ({
  article,
  project,
}: {
  readonly article: ProjectKnowledgeArticle
  readonly project: ProjectRow
}) => {
  const status = article.status ?? 'committed'
  const version = article.version ?? 1
  const category = article.category ?? fallbackKnowledgeCategory(article)

  return (
    <Stack gap="5">
      <ChakraLink
        asChild
        alignSelf="flex-start"
        display="inline-flex"
        alignItems="center"
        gap="2"
        color="fg.secondary"
        fontSize="18px"
        fontWeight="520"
        lineHeight="1"
        _hover={{ color: 'fg.default', textDecoration: 'none' }}
      >
        <Link to={`/projects/${project.id}/knowledge`}>
          <ChevronLeft size={19} />
          Knowledge base
        </Link>
      </ChakraLink>
      <Grid templateColumns={{ base: '1fr', xl: 'minmax(0, 1.55fr) minmax(320px, 0.75fr)' }} gap="5" alignItems="start">
        <Card p="5">
          <Stack gap="5">
            <Stack gap="3">
              <HStack gap="2" wrap="wrap">
                <AccentKnowledgeCategory category={category} />
                <KnowledgeStatusBadge status={status} />
              </HStack>
              <Text color="fg.default" fontSize={{ base: '25px', md: '28px' }} fontWeight="720" lineHeight="1.1">
                {article.title}
              </Text>
              <Text color="fg.secondary" textStyle="body" lineHeight="1.55" maxW="760px">
                {article.summary}
              </Text>
            </Stack>
            <KnowledgeDocSection title="What agents read">
              <Text>
                This article is projected into run context when the route touches{' '}
                <Span className="mono">{article.repo}</Span>. It keeps the reusable product fact separate from
                high-churn events and inbox decisions.
              </Text>
            </KnowledgeDocSection>
            <KnowledgeDocSection title="Operational guidance">
              <Stack as="ul" gap="2" pl="4">
                {article.tags.map((tag) => (
                  <Text as="li" key={tag}>
                    Preserve the <Span className="mono">{tag}</Span> convention when changing related screens or
                    fixtures.
                  </Text>
                ))}
              </Stack>
            </KnowledgeDocSection>
            <KnowledgeDocSection title="Source">
              <Text>
                Captured from <Span className="mono">{article.source}</Span> data in{' '}
                <Span className="mono">{project.key}</Span>.
              </Text>
            </KnowledgeDocSection>
          </Stack>
        </Card>
        <Stack gap="4">
          <Card p="5">
            <Stack gap="3">
              <HStack gap="2" color="fg.secondary">
                <History size={15} />
                <Text textStyle="componentTitle">Version</Text>
              </HStack>
              <Text className="mono" color="fg.default" textStyle="bodyStrong">
                v{version} · committed head
              </Text>
              <Text color="fg.secondary" textStyle="small" lineHeight="1.5">
                Versioned data in Revisium. Edits open a draft; committing creates a new revision with diff and review.
              </Text>
              <Stack gap="2">
                <Button
                  size="sm"
                  h="34px"
                  px="3.5"
                  gap="2"
                  bg="bg.surface"
                  color="fg.default"
                  borderWidth="1px"
                  borderColor="border.strong"
                  borderRadius="control"
                  disabled
                  _disabled={{ opacity: 0.58, cursor: 'not-allowed' }}
                >
                  <Pencil size={14} />
                  Edit draft
                </Button>
                <Button
                  size="sm"
                  h="34px"
                  px="3.5"
                  gap="2"
                  bg="transparent"
                  color="fg.secondary"
                  borderWidth="1px"
                  borderColor="border.structural"
                  borderRadius="control"
                  disabled
                  _disabled={{ opacity: 0.58, cursor: 'not-allowed' }}
                >
                  <History size={14} />
                  History
                </Button>
              </Stack>
            </Stack>
          </Card>
          <Card p="5">
            <Stack gap="3">
              <Text color="fg.default" textStyle="componentTitle">
                Article metadata
              </Text>
              <Stack gap="0">
                <AdrDetailMetaRow label="Owner">
                  <HStack gap="2" minW="0">
                    <Avatar size="xs" shape="circle" tone={article.owner === 'orchestrator' ? 'muted' : 'brand'}>
                      {ownerInitials(article.owner)}
                    </Avatar>
                    <Text color="fg.secondary" textStyle="small" truncate>
                      {article.owner}
                    </Text>
                  </HStack>
                </AdrDetailMetaRow>
                <AdrDetailMetaRow label="Updated">{relTime(article.updatedAt)}</AdrDetailMetaRow>
                <AdrDetailMetaRow label="Repository">
                  <Text className="mono" color="fg.secondary" textStyle="caption" truncate>
                    {article.repo}
                  </Text>
                </AdrDetailMetaRow>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Grid>
    </Stack>
  )
}

const AccentKnowledgeCategory = ({
  category,
}: {
  readonly category: NonNullable<ProjectKnowledgeArticle['category']>
}) => {
  const meta = KNOWLEDGE_CATEGORIES.find((item) => item.id === category) ?? KNOWLEDGE_CATEGORIES[0]
  const Icon = meta.icon

  return (
    <HStack
      as="span"
      h="6"
      px="2.5"
      gap="1.5"
      borderRadius="control"
      borderWidth="1px"
      borderColor="border.structural"
      bg="bg.subtle"
      color="fg.default"
      textStyle="body"
      whiteSpace="nowrap"
    >
      <Icon size={13} />
      {meta.label}
    </HStack>
  )
}

const memoryTableHref = (projectId: string, table: ProjectMemoryTable): string =>
  `/projects/${projectId}/memory/${table.id}`

const memoryTableForRouteId = (
  tables: ReadonlyArray<ProjectMemoryTable>,
  tableId: string,
): ProjectMemoryTable | undefined => tables.find((table) => table.id === tableId)

const MemoryTableCard = ({
  active,
  projectId,
  table,
}: {
  readonly active: boolean
  readonly projectId: string
  readonly table: ProjectMemoryTable
}) => (
  <ChakraLink
    asChild
    display="grid"
    gridTemplateColumns="32px minmax(0, 1fr) auto"
    alignItems="center"
    gap="3"
    px="3.5"
    py="3"
    borderRadius="9px"
    borderWidth="1px"
    borderColor={active ? 'border.structural' : 'border'}
    bg={active ? 'bg.subtle' : 'bg.surface'}
    color="inherit"
    _hover={{ borderColor: 'border.strong', textDecoration: 'none' }}
    _focusVisible={{ outline: '2px solid', outlineColor: 'action.primary.bg', outlineOffset: '2px' }}
  >
    <Link to={memoryTableHref(projectId, table)}>
      <Center
        boxSize="32px"
        borderRadius="8px"
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border.structural"
        color="fg.secondary"
      >
        <Database size={15} />
      </Center>
      <Stack gap="0.5" minW="0">
        <Text className="mono" textStyle="bodyStrong" color="fg.default" truncate>
          {table.name}
        </Text>
        <Text textStyle="caption" color="fg.secondary" truncate>
          {table.description}
        </Text>
      </Stack>
      <Text className="mono tnum" color="fg.muted" textStyle="caption">
        {table.records}
      </Text>
    </Link>
  </ChakraLink>
)

const MemorySchema = () => {
  const columns = [
    { name: 'fact_id', type: 'string', primary: true },
    { name: 'source', type: 'enum', primary: false },
    { name: 'source_id', type: 'string', primary: false },
    { name: 'fact', type: 'text', primary: false },
  ] as const

  return (
    <Box borderTopWidth="1px" borderColor="border.structural" pt="4">
      <HStack gap="2" color="fg.secondary" mb="3">
        <Layers3 size={14} />
        <Text textStyle="bodyStrong">Schema · {columns.length} columns</Text>
      </HStack>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap="2.5">
        {columns.map((column) => (
          <HStack
            key={column.name}
            gap="2"
            px="3"
            py="2.5"
            borderRadius="8px"
            borderWidth="1px"
            borderColor="border.structural"
            bg="bg.subtle"
            minW="0"
          >
            <Text className="mono" textStyle="caption" color="fg.default" truncate>
              {column.name}
            </Text>
            {column.primary ? (
              <Span px="1.5" borderRadius="4px" bg="bg.subtle" color="fg.default" textStyle="caption">
                pk
              </Span>
            ) : null}
            <Span ml="auto" px="2" h="5" borderRadius="control" bg="bg.subtle" color="fg.secondary" textStyle="caption">
              {column.type}
            </Span>
          </HStack>
        ))}
      </Grid>
    </Box>
  )
}

const MemorySampleRows = ({ table }: { readonly table: ProjectMemoryTable }) => (
  <Box borderTopWidth="1px" borderColor="border.structural" pt="4" containerType="inline-size">
    <HStack gap="2" color="fg.secondary" mb="3">
      <Terminal size={14} />
      <Text textStyle="bodyStrong">Sample rows</Text>
      <Text className="mono" color="fg.muted" textStyle="caption">
        read by agents at buildContext
      </Text>
    </HStack>
    <Card p="0" overflowX="auto" boxShadow="none">
      <Grid
        templateColumns="150px 96px 140px minmax(280px, 1fr)"
        gap="3"
        minW="720px"
        h="38px"
        alignItems="center"
        px="4"
        bg="bg.subtle"
        borderBottomWidth="1px"
        borderColor="border.structural"
      >
        <RepoHeaderCell>fact_id</RepoHeaderCell>
        <RepoHeaderCell>source</RepoHeaderCell>
        <RepoHeaderCell>source_id</RepoHeaderCell>
        <RepoHeaderCell>fact</RepoHeaderCell>
      </Grid>
      {table.facts.map((fact) => (
        <Grid
          key={fact.id}
          templateColumns="150px 96px 140px minmax(280px, 1fr)"
          gap="3"
          minW="720px"
          alignItems="start"
          px="4"
          py="3"
          borderBottomWidth="1px"
          borderColor="border.structural"
          _last={{ borderBottomWidth: '0' }}
        >
          <Text className="mono" color="fg.secondary" textStyle="caption" truncate>
            {fact.id}
          </Text>
          <MemorySourceBadge source={fact.source} />
          <Text className="mono" color="fg.secondary" textStyle="caption" truncate>
            {fact.sourceId}
          </Text>
          <Text color="fg.secondary" textStyle="small" lineHeight="1.45">
            {fact.text}
          </Text>
        </Grid>
      ))}
    </Card>
    {table.records > table.facts.length ? (
      <Text mt="2.5" color="fg.muted" textStyle="caption">
        +{table.records - table.facts.length} more rows
      </Text>
    ) : null}
  </Box>
)

const MemorySourceBadge = ({ source }: { readonly source: ProjectMemoryFact['source'] }) => {
  const palette = {
    adr: { fg: 'fg.default', bg: 'bg.subtle', border: 'border.structural' },
    manual: { fg: 'fg.secondary', bg: 'bg.subtle', border: 'border.structural' },
    run: { fg: 'status.running.fg', bg: 'bg.subtle', border: 'border.structural' },
  }[source]

  return (
    <Span
      px="2"
      h="5"
      display="inline-flex"
      alignItems="center"
      width="fit-content"
      borderRadius="control"
      borderWidth="1px"
      color={palette.fg}
      bg={palette.bg}
      borderColor={palette.border}
      textStyle="caption"
    >
      {source}
    </Span>
  )
}

const MemoryTableDetail = ({ table }: { readonly table: ProjectMemoryTable }) => (
  <Card p="0" overflow="hidden">
    <Stack gap="0">
      <Box px="5" py="4.5" borderBottomWidth="1px" borderColor="border.structural">
        <HStack gap="3" justify="space-between" align="start">
          <HStack gap="3" minW="0" align="start">
            <Center
              boxSize="38px"
              borderRadius="9px"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.structural"
              color="fg.secondary"
            >
              <Database size={18} />
            </Center>
            <Stack gap="1" minW="0">
              <Text className="mono" textStyle="componentTitle" color="fg.default" truncate>
                {table.name}
              </Text>
              <Text textStyle="small" color="fg.secondary" lineHeight="1.5">
                {table.description}
              </Text>
            </Stack>
          </HStack>
          <Stack align="flex-end" gap="2" flexShrink="0">
            <MemoryKindBadge kind={table.kind} />
            <Text className="mono" color="fg.muted" textStyle="caption">
              {table.records} rows
            </Text>
          </Stack>
        </HStack>
      </Box>
      <Grid
        templateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }}
        borderBottomWidth="1px"
        borderColor="border.structural"
      >
        <MemoryMetric label="Records" value={table.records} />
        <MemoryMetric label="Owner" value={table.owner} />
        <MemoryMetric label="Run" value={table.linkedRunId} to={`/runs/${table.linkedRunId}`} />
        <MemoryMetric label="ADR" value={table.linkedAdrId.replace('adr_', '')} />
      </Grid>
      <Stack gap="4.5" px="5" py="4.5">
        <MemorySchema />
        <MemorySampleRows table={table} />
        <HStack gap="1.5" wrap="wrap">
          {table.tags.map((tag) => (
            <Badge key={tag} tone="quiet">
              {tag}
            </Badge>
          ))}
        </HStack>
      </Stack>
    </Stack>
  </Card>
)

const MemoryBrowser = ({
  project,
  selectedTableId,
  tables,
}: {
  readonly project: ProjectRow
  readonly selectedTableId?: string
  readonly tables: ReadonlyArray<ProjectMemoryTable>
}) => {
  if (tables.length === 0) {
    return <EmptyState title="No memory tables yet" description="Project memory will appear once agents learn facts." />
  }

  const selectedTable = memoryTableForRouteId(tables, selectedTableId ?? '') ?? tables[0]

  return (
    <Grid templateColumns={{ base: '1fr', xl: 'minmax(270px, 0.5fr) minmax(0, 1.5fr)' }} gap="5" alignItems="start">
      <Stack gap="3">
        <HStack justify="space-between" align="center">
          <Text color="fg.secondary" textStyle="bodyStrong">
            Tables
          </Text>
          <Text className="mono tnum" color="fg.muted" textStyle="caption">
            {tables.length}
          </Text>
        </HStack>
        {tables.map((table) => (
          <MemoryTableCard key={table.id} projectId={project.id} table={table} active={table.id === selectedTable.id} />
        ))}
      </Stack>
      <MemoryTableDetail table={selectedTable} />
    </Grid>
  )
}

const MemoryMetric = ({
  label,
  value,
  to,
}: {
  readonly label: string
  readonly value: number | string
  readonly to?: string
}) => (
  <Stack
    gap="1"
    px="3.5"
    py="3"
    borderRightWidth="1px"
    borderBottomWidth={{ base: '1px', md: '0' }}
    borderColor="border.structural"
  >
    <Text color="fg.muted" textStyle="caption">
      {label}
    </Text>
    {to ? (
      <ChakraLink
        asChild
        className="mono"
        color="fg.secondary"
        textStyle="caption"
        _hover={{ color: 'action.primary.bg', textDecoration: 'none' }}
      >
        <Link to={to}>{value}</Link>
      </ChakraLink>
    ) : (
      <Text
        className={typeof value === 'number' ? 'mono tnum' : 'mono'}
        color="fg.secondary"
        textStyle="caption"
        truncate
      >
        {value}
      </Text>
    )}
  </Stack>
)

const ActivityList = ({ events }: { readonly events: ReadonlyArray<ProjectActivityEvent> }) => (
  <Card p="0" overflow="hidden">
    {events.length === 0 ? (
      <Box px="4" py="5">
        <EmptyState title="No activity yet" description="Project events will appear once agents touch this project." />
      </Box>
    ) : (
      events.map((event) => (
        <Grid
          key={event.id}
          templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 180px' }}
          gap={{ base: '2.5', lg: '4' }}
          px="4.5"
          py="4"
          borderBottomWidth="1px"
          borderColor="border.structural"
          _last={{ borderBottomWidth: '0' }}
        >
          <HStack gap="3" align="start" minW="0">
            <Center
              boxSize="32px"
              borderRadius="full"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.structural"
              color="fg.secondary"
              flexShrink="0"
            >
              <CircleDot size={15} />
            </Center>
            <Stack gap="1.5" minW="0">
              <HStack gap="2" wrap="wrap">
                <ActivityKindBadge kind={event.kind} />
                <Text textStyle="bodyStrong" color="fg.default">
                  {event.title}
                </Text>
              </HStack>
              <Text textStyle="small" color="fg.secondary" lineHeight="1.5">
                {event.summary}
              </Text>
              <HStack gap="2" wrap="wrap">
                <Badge tone="quiet">{event.target}</Badge>
                {event.runId ? (
                  <ChakraLink
                    asChild
                    color="fg.secondary"
                    textStyle="caption"
                    _hover={{ color: 'action.primary.bg', textDecoration: 'none' }}
                  >
                    <Link to={`/runs/${event.runId}`}>{event.runId}</Link>
                  </ChakraLink>
                ) : null}
              </HStack>
            </Stack>
          </HStack>
          <Stack gap="1" align={{ base: 'flex-start', lg: 'flex-end' }}>
            <HStack gap="1.5">
              <Avatar size="xs" shape="circle" tone={event.actor === 'orchestrator' ? 'muted' : 'brand'}>
                {event.actor}
              </Avatar>
              <Text className="mono" textStyle="caption" color="fg.secondary">
                {event.actor}
              </Text>
            </HStack>
            <Text className="mono" textStyle="caption" color="fg.muted">
              {absTime(event.createdAt)}
            </Text>
          </Stack>
        </Grid>
      ))
    )}
  </Card>
)

const activityPreviewStyle = (
  kind: ProjectActivityEvent['kind'],
): { readonly color: string; readonly bg: string; readonly icon: ReactNode } => {
  if (kind === 'run') return { color: 'fg.secondary', bg: 'bg.subtle', icon: <CircleDot size={14} /> }
  if (kind === 'repo') return { color: 'status.running.fg', bg: 'bg.subtle', icon: <GitBranch size={14} /> }
  return { color: 'fg.secondary', bg: 'bg.subtle', icon: <History size={14} /> }
}

const ActivityPreviewIcon = ({ kind }: { readonly kind: ProjectActivityEvent['kind'] }) => {
  const style = activityPreviewStyle(kind)

  return (
    <Center
      boxSize="30px"
      borderRadius="8px"
      bg={style.bg}
      borderWidth="1px"
      borderColor="border.structural"
      color={style.color}
      flexShrink="0"
    >
      {style.icon}
    </Center>
  )
}

const RecentActivityPreview = ({ events }: { readonly events: ReadonlyArray<ProjectActivityEvent> }) => (
  <Card p="0" overflow="hidden">
    {events.slice(0, RECENT_ACTIVITY_LIMIT).map((event) => (
      <HStack
        key={event.id}
        gap="3"
        align="start"
        px="4"
        py="3.5"
        borderBottomWidth="1px"
        borderColor="border.structural"
        _last={{ borderBottomWidth: '0' }}
      >
        <ActivityPreviewIcon kind={event.kind} />
        <Stack gap="1" minW="0">
          <Text color="fg.default" textStyle="body" lineHeight="1.3">
            {event.title}
          </Text>
          <HStack gap="2" wrap="wrap" color="fg.muted" textStyle="caption">
            <Span
              className="mono"
              px="2"
              py="0.5"
              borderRadius="4px"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.structural"
            >
              {event.target}
            </Span>
            <Span>·</Span>
            <Span>{event.actor}</Span>
            <Span>·</Span>
            <Span>{relTime(event.createdAt)}</Span>
          </HStack>
        </Stack>
      </HStack>
    ))}
  </Card>
)

const ProjectMetaRow = ({ label, children }: { readonly label: string; readonly children: ReactNode }) => (
  <Grid
    templateColumns="126px minmax(0, 1fr)"
    gap="3"
    alignItems="start"
    py="3"
    borderBottomWidth="1px"
    borderColor="border.structural"
    _last={{ borderBottomWidth: '0' }}
  >
    <Text textStyle="body" color="fg.secondary" whiteSpace="nowrap">
      {label}
    </Text>
    <Box minW="0">
      {typeof children === 'string' ? (
        <Text textStyle="body" color="fg.default" overflowWrap="anywhere">
          {children}
        </Text>
      ) : (
        children
      )}
    </Box>
  </Grid>
)

const ProjectMeta = ({ project }: { readonly project: ProjectRow }) => (
  <Card>
    <Stack gap="3">
      <Text textStyle="bodyStrong" color="fg.default">
        Project
      </Text>
      <ProjectMetaRow label="Key">
        <Text className="mono" textStyle="caption" color="fg.default" lineHeight="1.45" overflowWrap="anywhere">
          {project.key}
        </Text>
      </ProjectMetaRow>
      <ProjectMetaRow label="Owners">
        <HStack gap="2" wrap="wrap">
          {project.owners.map((owner) => (
            <HStack key={owner} gap="1.5">
              <Avatar size="xs" shape="circle" tone={owner === 'orchestrator' ? 'muted' : 'brand'}>
                {owner}
              </Avatar>
              <Text className="mono">{owner}</Text>
            </HStack>
          ))}
        </HStack>
      </ProjectMetaRow>
      <ProjectMetaRow label="Default branch">{project.defaultBranch}</ProjectMetaRow>
      <ProjectMetaRow label="Head revision">{project.headRev}</ProjectMetaRow>
      <ProjectMetaRow label="Open PRs">{project.openPRs}</ProjectMetaRow>
      <ProjectMetaRow label="Updated">{relTime(project.updatedAt)}</ProjectMetaRow>
    </Stack>
  </Card>
)

const ActiveRuns = ({ project }: { readonly project: ProjectRow }) => {
  const runs = runsForProject(project.id)

  return (
    <Card p="0" overflow="hidden">
      {runs.length === 0 ? (
        <Box px="4" py="5">
          <EmptyState title="No runs in this project" description="Runs will appear here once they are scoped." />
        </Box>
      ) : (
        runs.map((run) => (
          <ChakraLink
            key={run.id}
            asChild
            display="grid"
            gridTemplateColumns="3px minmax(0, 1fr) auto"
            alignItems="center"
            gap="3"
            pr="4"
            borderBottomWidth="1px"
            borderColor="border.structural"
            _hover={{ bg: 'bg.subtle', textDecoration: 'none' }}
          >
            <Link to={`/runs/${run.id}`}>
              <Box alignSelf="stretch" bg={`dot.${toneForStatus(run.status)}`} />
              <Stack gap="0.5" minW="0" py="3">
                <Text textStyle="caption" color="fg.default" lineHeight="1.25">
                  {run.title}
                </Text>
                <Text className="mono" textStyle="caption" color="fg.muted">
                  {run.id}
                </Text>
              </Stack>
              <StatusBadge status={run.status} size="sm" dot={false} />
            </Link>
          </ChakraLink>
        ))
      )}
    </Card>
  )
}

const OverviewTab = ({
  project,
  repositories,
  adrs,
  activity,
}: {
  readonly project: ProjectRow
  readonly repositories: ReadonlyArray<ProjectRepository>
  readonly adrs: ReadonlyArray<ProjectAdr>
  readonly activity: ReadonlyArray<ProjectActivityEvent>
}) => (
  <Grid templateColumns={{ base: '1fr', xl: 'minmax(0, 1.55fr) minmax(390px, 1fr)' }} gap="7" alignItems="start">
    <Stack gap="6">
      <Grid templateColumns={{ base: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }} gap="3">
        <StatCard icon={GitBranch} label="Repositories" value={repositories.length} />
        <StatCard icon={BookOpen} label="ADRs" value={project.stats.adrs} />
        <StatCard icon={Layers3} label="KB articles" value={project.stats.kb} />
        <StatCard icon={Cpu} label="Memory tables" value={project.stats.tables} />
      </Grid>
      <Box>
        <SectionHead title="Repositories" to={`/projects/${project.id}/repositories`} />
        <RepoList repositories={repositories} />
      </Box>
      <Box>
        <SectionHead title="Recent decisions" to={`/projects/${project.id}/adrs`} action="All ADRs" />
        <RecentDecisionList adrs={adrs.slice(0, RECENT_ADR_LIMIT)} />
      </Box>
    </Stack>
    <Stack gap="5">
      <ProjectMeta project={project} />
      <Box>
        <SectionHead title="Active runs" />
        <ActiveRuns project={project} />
      </Box>
      <Box>
        <SectionHead title="Recent activity" to={`/projects/${project.id}/activity`} />
        <RecentActivityPreview events={activity} />
      </Box>
    </Stack>
  </Grid>
)

const AdrsTab = ({ adrs }: { readonly adrs: ReadonlyArray<ProjectAdr> }) => (
  <Stack gap="0">
    <AdrList adrs={adrs} />
  </Stack>
)

const KnowledgeTab = ({
  project,
  articles,
}: {
  readonly project: ProjectRow
  readonly articles: ReadonlyArray<ProjectKnowledgeArticle>
}) => (
  <Stack gap="5">
    <HStack justify="space-between" align="center" gap="4" wrap="wrap">
      <Text color="fg.secondary" textStyle="small">
        {articles.length} articles · versioned in <Span className="mono">{project.key}</Span>
      </Text>
      <Button
        size="sm"
        h="34px"
        px="3.5"
        gap="2"
        bg="bg.surface"
        color="fg.default"
        borderWidth="1px"
        borderColor="border.strong"
        borderRadius="control"
        boxShadow="popover"
        disabled
        _hover={{ bg: 'blackAlpha.50' }}
        _disabled={{ opacity: 0.58, cursor: 'not-allowed' }}
      >
        <Plus size={14} />
        New article
      </Button>
    </HStack>
    <KnowledgeList articles={articles} projectId={project.id} />
  </Stack>
)

const MemoryTab = ({
  project,
  selectedTableId,
  tables,
}: {
  readonly project: ProjectRow
  readonly selectedTableId?: string
  readonly tables: ReadonlyArray<ProjectMemoryTable>
}) => (
  <Stack gap="4">
    <SectionHead title="Project memory" />
    <MemoryBrowser project={project} selectedTableId={selectedTableId} tables={tables} />
  </Stack>
)

const ActivityTab = ({ events }: { readonly events: ReadonlyArray<ProjectActivityEvent> }) => (
  <Stack gap="4">
    <SectionHead title="Project activity" />
    <ActivityList events={events} />
  </Stack>
)

const RepositoriesTab = ({ repositories }: { readonly repositories: ReadonlyArray<ProjectRepository> }) => (
  <Box containerType="inline-size">
    <Card p="0" overflow="hidden">
      <Grid
        templateColumns="minmax(0, 2.4fr) 120px 88px 88px 88px 120px"
        gap="3"
        alignItems="center"
        h="40px"
        px="4.5"
        bg="bg.subtle"
        borderBottomWidth="1px"
        borderColor="border.structural"
        css={{ '@container (max-width: 860px)': { gridTemplateColumns: 'minmax(0, 1fr) 88px 88px' } }}
      >
        <RepoHeaderCell>Repository</RepoHeaderCell>
        <RepoHeaderCell css={{ '@container (max-width: 860px)': { display: 'none' } }}>Language</RepoHeaderCell>
        <RepoHeaderCell>Branches</RepoHeaderCell>
        <RepoHeaderCell>Open PRs</RepoHeaderCell>
        <RepoHeaderCell css={{ '@container (max-width: 860px)': { display: 'none' } }}>Commits</RepoHeaderCell>
        <RepoHeaderCell css={{ '@container (max-width: 860px)': { display: 'none' } }}>Last activity</RepoHeaderCell>
      </Grid>
      {repositories.map((repo) => (
        <Grid
          key={repo.id}
          templateColumns="minmax(0, 2.4fr) 120px 88px 88px 88px 120px"
          gap="3"
          alignItems="center"
          px="4.5"
          py="3"
          borderBottomWidth="1px"
          borderColor="border.structural"
          _last={{ borderBottomWidth: '0' }}
          css={{ '@container (max-width: 860px)': { gridTemplateColumns: 'minmax(0, 1fr) 88px 88px' } }}
        >
          <HStack gap="3" minW="0">
            <Center
              boxSize="30px"
              borderRadius="8px"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.structural"
              color="fg.secondary"
            >
              <GitBranch size={15} />
            </Center>
            <Stack gap="0.5" minW="0">
              <Text className="mono" textStyle="body" color="fg.default" truncate>
                {repo.name}
              </Text>
              <Text textStyle="caption" color="fg.secondary" truncate>
                {repo.description}
              </Text>
            </Stack>
          </HStack>
          <HStack gap="2" minW="0" css={{ '@container (max-width: 860px)': { display: 'none' } }}>
            <Box boxSize="2" borderRadius="full" bg="dot.running" flexShrink="0" />
            <Text textStyle="caption" color="fg.secondary" truncate>
              {repo.language}
            </Text>
          </HStack>
          <Text className="mono tnum" textStyle="caption" color="fg.secondary">
            {repo.branches}
          </Text>
          <HStack
            as="span"
            h="7"
            w="fit-content"
            px="2"
            gap="1"
            borderRadius="pill"
            borderWidth="1px"
            borderColor="border.structural"
            bg="bg.subtle"
            color="status.success.fg"
            textStyle="caption"
          >
            <GitPullRequest size={13} />
            <Span className="mono tnum">{repo.openPRs}</Span>
          </HStack>
          <Text
            className="mono tnum"
            textStyle="caption"
            color="fg.secondary"
            css={{ '@container (max-width: 860px)': { display: 'none' } }}
          >
            {repo.commits}
          </Text>
          <Text textStyle="caption" color="fg.muted" css={{ '@container (max-width: 860px)': { display: 'none' } }}>
            {relTime(repo.lastActivity)}
          </Text>
        </Grid>
      ))}
    </Card>
  </Box>
)

const RepoHeaderCell = ({
  children,
  css,
}: {
  readonly children: ReactNode
  readonly css?: Record<string, unknown>
}) => (
  <Text color="fg.muted" fontSize="11.5px" fontWeight="600" textTransform="uppercase" letterSpacing="0" css={css}>
    {children}
  </Text>
)

const adrForRouteId = (adrs: ReadonlyArray<ProjectAdr>, adrId: string): ProjectAdr | undefined =>
  adrs.find((adr) => adr.id === adrId || adrRouteId(adr) === adrId.toLowerCase())

const AdrDetailMetaRow = ({ label, children }: { readonly label: string; readonly children: ReactNode }) => (
  <Grid
    templateColumns="112px minmax(0, 1fr)"
    gap="3"
    alignItems="center"
    py="3"
    borderBottomWidth="1px"
    borderColor="border.structural"
    _last={{ borderBottomWidth: '0' }}
  >
    <Text color="fg.secondary" textStyle="small">
      {label}
    </Text>
    <Box minW="0">{children}</Box>
  </Grid>
)

const AdrSection = ({
  children,
  comments,
  title,
}: {
  readonly children: ReactNode
  readonly comments?: number
  readonly title: string
}) => (
  <Box borderTopWidth="1px" borderColor="border.structural" pt="4">
    <HStack gap="2" mb="2">
      <Text color="fg.default" textStyle="bodyStrong">
        {title}
      </Text>
      {comments ? (
        <HStack
          as="span"
          h="5"
          px="2"
          gap="1"
          borderRadius="control"
          bg="bg.subtle"
          borderWidth="1px"
          borderColor="border.structural"
          color="fg.muted"
          textStyle="caption"
        >
          <Command size={11} />
          {comments}
        </HStack>
      ) : null}
    </HStack>
    <Box color="fg.secondary" textStyle="small" lineHeight="1.6">
      {children}
    </Box>
  </Box>
)

const AdrLinkedRun = ({ adr }: { readonly adr: ProjectAdr }) => (
  <ChakraLink
    asChild
    display="grid"
    gridTemplateColumns="34px minmax(0, 1fr) auto"
    alignItems="center"
    gap="3"
    p="3.5"
    borderRadius="10px"
    borderWidth="1px"
    borderColor="border.structural"
    bg="bg.subtle"
    color="inherit"
    _hover={{ textDecoration: 'none', borderColor: 'action.primary.bg' }}
  >
    <Link to={`/runs/${adr.runId}`}>
      <Center boxSize="34px" borderRadius="8px" bg="bg.surface" color="action.primary.bg">
        <GitBranch size={16} />
      </Center>
      <Stack gap="0.5" minW="0">
        <Text color="fg.default" textStyle="bodyStrong">
          Linked to a run
        </Text>
        <Text color="fg.secondary" textStyle="caption">
          Authored during task execution; reviewers can trace the decision back to the run.
        </Text>
      </Stack>
      <HStack gap="1.5" color="action.primary.bg" textStyle="caption">
        <Span className="mono">{adr.runId}</Span>
        <ArrowRight size={13} />
      </HStack>
    </Link>
  </ChakraLink>
)

const AdrOption = ({
  chosen,
  note,
  title,
}: {
  readonly chosen?: boolean
  readonly note: string
  readonly title: string
}) => (
  <Box
    p="3"
    borderRadius="9px"
    borderWidth="1px"
    borderColor={chosen ? 'fg.default' : 'border.structural'}
    bg="bg.subtle"
  >
    <HStack gap="2" mb="1">
      {chosen ? (
        <Center boxSize="18px" borderRadius="full" bg="action.primary.bg" color="action.primary.fg">
          <Check size={12} />
        </Center>
      ) : null}
      <Text color="fg.default" textStyle="bodyStrong">
        {title}
      </Text>
    </HStack>
    <Text color="fg.secondary" textStyle="small" lineHeight="1.5">
      {note}
    </Text>
  </Box>
)

const AdrReviewPanel = ({ adr }: { readonly adr: ProjectAdr }) => {
  const status = revisionStatus(adr.status)
  const note =
    adr.status === 'proposed'
      ? 'Proposed decision — needs review before it can be committed to the project head.'
      : 'Committed to head — rollback creates a new revision rather than mutating history.'

  return (
    <Card p="5">
      <Stack gap="3">
        <Text color="fg.default" textStyle="componentTitle">
          Review
        </Text>
        <CompactDecisionStatus status={status} />
        <Text color="fg.secondary" textStyle="small" lineHeight="1.5">
          {note}
        </Text>
        {adr.status === 'proposed' ? (
          <Stack gap="2">
            <Button
              size="sm"
              h="34px"
              px="3.5"
              gap="2"
              bg="status.success.fg"
              color="white"
              borderRadius="control"
              disabled
              _disabled={{ opacity: 0.58, cursor: 'not-allowed' }}
            >
              <Check size={14} />
              Commit
            </Button>
            <Button
              size="sm"
              h="34px"
              px="3.5"
              gap="2"
              bg="bg.surface"
              color="fg.default"
              borderWidth="1px"
              borderColor="border.strong"
              borderRadius="control"
              disabled
              _disabled={{ opacity: 0.58, cursor: 'not-allowed' }}
            >
              <Pencil size={14} />
              Edit draft
            </Button>
          </Stack>
        ) : null}
      </Stack>
    </Card>
  )
}

const AdrHistoryPanel = ({ adr }: { readonly adr: ProjectAdr }) => {
  const revisions = [
    { id: 'head', label: 'Committed head', rev: 'head', time: adr.createdAt },
    { id: 'review', label: 'Reviewer notes resolved', rev: 'review', time: adr.createdAt },
    { id: 'draft', label: 'Initial draft opened', rev: 'draft', time: adr.createdAt },
  ] as const

  return (
    <Card p="0" overflow="hidden">
      <HStack gap="2" px="4" py="3.5" borderBottomWidth="1px" borderColor="border.structural">
        <History size={14} />
        <Text color="fg.default" textStyle="bodyStrong">
          Version history
        </Text>
      </HStack>
      <Stack gap="0" px="4" py="2">
        {revisions.map((revision) => (
          <Grid
            key={revision.id}
            templateColumns="72px minmax(0, 1fr)"
            gap="3"
            py="3"
            borderBottomWidth="1px"
            borderColor="border.structural"
            _last={{ borderBottomWidth: '0' }}
          >
            <Text
              className="mono"
              color={revision.id === 'head' ? 'action.primary.bg' : 'fg.muted'}
              textStyle="caption"
            >
              {revision.rev}
            </Text>
            <Stack gap="0.5" minW="0">
              <Text color="fg.default" textStyle="small">
                {revision.label}
              </Text>
              <Text color="fg.muted" textStyle="caption">
                {adr.owner} · {relTime(revision.time)}
              </Text>
            </Stack>
          </Grid>
        ))}
      </Stack>
    </Card>
  )
}

const AdrDetail = ({ project, adr }: { readonly project: ProjectRow; readonly adr: ProjectAdr }) => (
  <Stack gap="5">
    <ChakraLink
      asChild
      alignSelf="flex-start"
      display="inline-flex"
      alignItems="center"
      gap="2"
      color="fg.secondary"
      fontSize="18px"
      fontWeight="520"
      lineHeight="1"
      _hover={{ color: 'fg.default', textDecoration: 'none' }}
    >
      <Link to={`/projects/${project.id}/adrs`}>
        <ChevronLeft size={19} />
        ADRs
      </Link>
    </ChakraLink>
    <Grid templateColumns={{ base: '1fr', xl: 'minmax(0, 1.55fr) minmax(340px, 0.75fr)' }} gap="5" alignItems="start">
      <Card p="5">
        <Stack gap="5">
          <Stack gap="3">
            <HStack gap="3" justify="space-between" align="start" wrap="wrap">
              <Stack gap="1.5" minW="0">
                <Text className="mono" color="action.primary.bg" textStyle="bodyStrong">
                  {formatAdrNumber(adr.number)}
                </Text>
                <Text color="fg.default" fontSize="26px" fontWeight="720" lineHeight="1.1">
                  {adr.title}
                </Text>
              </Stack>
              <HStack gap="2" wrap="wrap">
                <AdrStatusBadge status={adr.status}>{adrStatusLabel(adr.status)}</AdrStatusBadge>
                <CompactDecisionStatus status={revisionStatus(adr.status)} />
              </HStack>
            </HStack>
            <Text color="fg.secondary" textStyle="body" lineHeight="1.55" maxW="760px">
              {adr.summary}
            </Text>
          </Stack>
          <HStack gap="1.5" wrap="wrap">
            {adr.tags.map((tag) => (
              <Badge key={tag} tone="quiet">
                {tag}
              </Badge>
            ))}
          </HStack>
          <AdrLinkedRun adr={adr} />
          <AdrSection title="Context">
            <Text>
              {adr.summary} The decision belongs to <Span className="mono">{project.key}</Span> and is read alongside
              project knowledge, memory, active runs, and review gates.
            </Text>
          </AdrSection>
          <AdrSection title="Decision" comments={linkedCountForAdr(adr)}>
            <Text>
              Keep this behavior aligned with the versioned method. Implementation work may change files, but the
              meaning captured here changes only through a new ADR revision.
            </Text>
          </AdrSection>
          <AdrSection title="Consequences">
            <Stack as="ul" gap="2" pl="4">
              <Text as="li">Agents can cite this ADR while building context for related runs.</Text>
              <Text as="li">Reviewers can trace the decision back to source repository and task run.</Text>
              <Text as="li">Superseding the decision creates a new explicit revision path.</Text>
            </Stack>
          </AdrSection>
          <AdrSection title="Options considered">
            <Stack gap="3">
              <AdrOption
                chosen
                title="Version the decision"
                note="Chosen: keep durable product meaning in project history."
              />
              <AdrOption
                title="Keep it as runtime state"
                note="Rejected: inbox and events are high-churn signals, not durable meaning."
              />
            </Stack>
          </AdrSection>
          <Box borderTopWidth="1px" borderColor="border.structural" pt="4">
            <HStack gap="2" mb="3">
              <Command size={14} />
              <Text color="fg.default" textStyle="bodyStrong">
                Add a comment
              </Text>
            </HStack>
            <Box
              minH="70px"
              p="3"
              borderRadius="9px"
              borderWidth="1px"
              borderColor="border.structural"
              bg="bg.subtle"
              color="fg.muted"
              textStyle="small"
            >
              Leave a review comment...
            </Box>
            <Button
              mt="3"
              size="sm"
              h="34px"
              px="3.5"
              gap="2"
              bg="action.primary.bg"
              color="action.primary.fg"
              borderRadius="control"
              disabled
              _disabled={{ opacity: 0.58, cursor: 'not-allowed' }}
            >
              <Check size={14} />
              Comment
            </Button>
          </Box>
        </Stack>
      </Card>
      <Stack gap="4">
        <AdrReviewPanel adr={adr} />
        <AdrHistoryPanel adr={adr} />
        <Card p="5">
          <Stack gap="3">
            <Text color="fg.default" textStyle="componentTitle">
              ADR metadata
            </Text>
            <Stack gap="0">
              <AdrDetailMetaRow label="Author">
                <HStack gap="2" minW="0">
                  <Avatar size="xs" shape="circle" tone={adr.owner === 'orchestrator' ? 'muted' : 'brand'}>
                    {ownerInitials(adr.owner)}
                  </Avatar>
                  <Text color="fg.secondary" textStyle="small" truncate>
                    {adr.owner}
                  </Text>
                </HStack>
              </AdrDetailMetaRow>
              <AdrDetailMetaRow label="Updated">{relTime(adr.createdAt)}</AdrDetailMetaRow>
              <AdrDetailMetaRow label="Repository">
                <Text className="mono" color="fg.secondary" textStyle="caption" truncate>
                  {adr.repo}
                </Text>
              </AdrDetailMetaRow>
              <AdrDetailMetaRow label="Run">
                <ChakraLink
                  asChild
                  color="action.primary.bg"
                  textStyle="caption"
                  _hover={{ color: 'action.primary.hoverBg', textDecoration: 'none' }}
                >
                  <Link to={`/runs/${adr.runId}`}>{adr.runId}</Link>
                </ChakraLink>
              </AdrDetailMetaRow>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Grid>
  </Stack>
)

export const ProjectAdrDetailPage = ({ projectId, adrId }: ProjectAdrDetailPageProps) => {
  const project = projectById(projectId)
  if (!project) {
    return <EmptyState title="Project not found" description="The requested project does not exist." />
  }

  const repositories = reposForProject(project.id)
  const adrs = adrsForProject(project.id)
  const tabs = tabsForProject(project, repositories)
  const adr = adrForRouteId(adrs, adrId)

  return (
    <Stack gap="6">
      <DetailHeader project={project} />
      <DetailTabs project={project} tabs={tabs} activeTab="adrs" />
      {adr ? (
        <AdrDetail project={project} adr={adr} />
      ) : (
        <EmptyState title="ADR not found" description="The requested decision record does not exist in this project." />
      )}
    </Stack>
  )
}

export const ProjectKnowledgeArticlePage = ({ projectId, articleId }: ProjectKnowledgeArticlePageProps) => {
  const project = projectById(projectId)
  if (!project) {
    return <EmptyState title="Project not found" description="The requested project does not exist." />
  }

  const repositories = reposForProject(project.id)
  const articles = knowledgeForProject(project.id)
  const tabs = tabsForProject(project, repositories)
  const article = knowledgeArticleForRouteId(articles, articleId)

  return (
    <Stack gap="6">
      <DetailHeader project={project} />
      <DetailTabs project={project} tabs={tabs} activeTab="knowledge" />
      {article ? (
        <KnowledgeArticleDetail article={article} project={project} />
      ) : (
        <EmptyState title="Article not found" description="The requested knowledge article does not exist." />
      )}
    </Stack>
  )
}

export const ProjectMemoryTablePage = ({ projectId, tableId }: ProjectMemoryTablePageProps) => {
  const project = projectById(projectId)
  if (!project) {
    return <EmptyState title="Project not found" description="The requested project does not exist." />
  }

  const repositories = reposForProject(project.id)
  const memoryTables = memoryForProject(project.id)
  const tabs = tabsForProject(project, repositories)

  return (
    <Stack gap="6">
      <DetailHeader project={project} />
      <DetailTabs project={project} tabs={tabs} activeTab="memory" />
      <MemoryTab project={project} tables={memoryTables} selectedTableId={tableId} />
    </Stack>
  )
}

export const ProjectDetailPage = ({ projectId, tab }: ProjectDetailPageProps) => {
  const project = projectById(projectId)
  if (!project) {
    return <EmptyState title="Project not found" description="The requested project does not exist." />
  }

  const repositories = reposForProject(project.id)
  const adrs = adrsForProject(project.id)
  const articles = knowledgeForProject(project.id)
  const memoryTables = memoryForProject(project.id)
  const activity = activityForProject(project.id)
  const activeTab = validTab(tab)
  const tabs = tabsForProject(project, repositories)

  return (
    <Stack gap="6">
      <DetailHeader project={project} />
      <DetailTabs project={project} tabs={tabs} activeTab={activeTab} />
      {activeTab === 'overview' ? (
        <OverviewTab project={project} repositories={repositories} adrs={adrs} activity={activity} />
      ) : null}
      {activeTab === 'repositories' ? <RepositoriesTab repositories={repositories} /> : null}
      {activeTab === 'knowledge' ? <KnowledgeTab project={project} articles={articles} /> : null}
      {activeTab === 'adrs' ? <AdrsTab adrs={adrs} /> : null}
      {activeTab === 'memory' ? <MemoryTab project={project} tables={memoryTables} /> : null}
      {activeTab === 'activity' ? <ActivityTab events={activity} /> : null}
    </Stack>
  )
}
