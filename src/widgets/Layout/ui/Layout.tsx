import {
  Box,
  Button,
  Center,
  chakra,
  Drawer,
  Flex,
  HStack,
  Link as ChakraLink,
  Menu,
  Portal,
  Span,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import {
  ArrowRight,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Check,
  Folder,
  Inbox,
  LayoutDashboard,
  Layers,
  List,
  type LucideIcon,
  Menu as MenuIcon,
  Plus,
  Scan,
  Search,
  X,
} from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useState, type ReactNode } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import {
  HOST_STATUS,
  INBOX_ITEMS,
  adrsForProject,
  knowledgeForProject,
  memoryForProject,
  projectById,
} from 'src/shared/fixtures'
import { useViewModel } from 'src/shared/lib'
import { BrandLogo } from 'src/shared/ui'
import { ProjectSwitcherViewModel, type LayoutProjectTone } from '../model/ProjectSwitcherViewModel'
import { routes } from 'src/shared/config'

interface NavItem {
  readonly label: string
  readonly to: string
  // Prefix used to mark the active section (e.g. /method matches /method/roles).
  readonly match: string
  readonly icon: LucideIcon
  readonly badge?: number
  // Sections whose pages do not exist yet render disabled (no navigation).
  readonly disabled?: boolean
}

interface BreadcrumbItem {
  readonly label: string
  readonly to?: string
}

const PENDING_INBOX = INBOX_ITEMS.filter((item) => item.status === 'pending').length
const PATH_SECTION_INDEX = 0
const PROJECT_ID_INDEX = 1
const PROJECT_TAB_INDEX = 2
const PROJECT_DETAIL_INDEX = 3
const BREADCRUMB_ADR_NUMBER_WIDTH = 4

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: 'Dashboard', to: routes.home(), match: routes.home(), icon: LayoutDashboard },
  { label: 'Runs', to: routes.runs(), match: routes.runs(), icon: List },
  { label: 'Inbox', to: routes.inbox(), match: routes.inbox(), icon: Inbox, badge: PENDING_INBOX },
  { label: 'Projects', to: routes.projects(), match: routes.projects(), icon: Folder },
  { label: 'Method', to: routes.methodRoles(), match: '/method', icon: Scan },
]

const isActive = (pathname: string, match: string): boolean =>
  match === '/' ? pathname === '/' : pathname === match || pathname.startsWith(`${match}/`)

const PROJECT_TAB_LABELS: Readonly<Record<string, string>> = {
  repositories: 'Repositories',
  knowledge: 'Knowledge base',
  adrs: 'ADRs',
  memory: 'Memory',
  activity: 'Activity',
}

const breadcrumbAdrRouteId = (number: number): string =>
  `adr-${String(number).padStart(BREADCRUMB_ADR_NUMBER_WIDTH, '0')}`

const breadcrumbAdrLabel = (projectId: string, adrId: string): string => {
  const adr = adrsForProject(projectId).find(
    (candidate) => candidate.id === adrId || breadcrumbAdrRouteId(candidate.number) === adrId.toLowerCase(),
  )

  return adr ? `ADR-${String(adr.number).padStart(BREADCRUMB_ADR_NUMBER_WIDTH, '0')}` : adrId.toUpperCase()
}

const breadcrumbProjectDetailLabel = (projectId: string, tab: string, detailId: string): string => {
  if (tab === 'adrs') return breadcrumbAdrLabel(projectId, detailId)
  if (tab === 'knowledge') {
    return knowledgeForProject(projectId).find((article) => article.id === detailId)?.title ?? detailId
  }
  if (tab === 'memory') {
    return memoryForProject(projectId).find((table) => table.id === detailId)?.name ?? detailId
  }

  return detailId
}

const projectBreadcrumbs = (segments: ReadonlyArray<string>): ReadonlyArray<BreadcrumbItem> => {
  const projectId = segments[PROJECT_ID_INDEX]
  const tab = segments[PROJECT_TAB_INDEX]
  const detailId = segments[PROJECT_DETAIL_INDEX]

  if (!projectId) return [{ label: 'Projects' }]

  const project = projectById(projectId)
  if (!project) return [{ label: 'Projects', to: routes.projects() }, { label: projectId }]

  const crumbs: Array<BreadcrumbItem> = [
    { label: 'Projects', to: routes.projects() },
    { label: project.name, to: `/projects/${project.id}` },
  ]

  if (tab) {
    const tabCrumb = { label: PROJECT_TAB_LABELS[tab] ?? tab, to: `/projects/${project.id}/${tab}` }
    crumbs.push(detailId ? tabCrumb : { label: tabCrumb.label })
  }

  if (tab && detailId) crumbs.push({ label: breadcrumbProjectDetailLabel(project.id, tab, detailId) })

  return crumbs
}

const breadcrumbsForPath = (pathname: string): ReadonlyArray<BreadcrumbItem> => {
  const segments = pathname.split('/').filter(Boolean)
  const section = segments[PATH_SECTION_INDEX]

  if (section === 'runs') {
    if (segments[PROJECT_ID_INDEX] === 'new') return [{ label: 'Runs', to: routes.runs() }, { label: 'New run' }]
    return [{ label: 'Runs' }]
  }

  if (section === 'inbox') return [{ label: 'Inbox' }]
  if (section === 'method') return [{ label: 'Method' }]

  if (section === 'projects') return projectBreadcrumbs(segments)

  return [{ label: 'Control plane' }]
}

const SIDEBAR_W = '232px'
const SIDEBAR_W_COLLAPSED = '64px'

const IconButton = chakra('button', {
  base: {
    display: 'grid',
    placeItems: 'center',
    borderRadius: '7px',
    color: 'fg.secondary',
    cursor: 'pointer',
    transition: 'background 150ms, color 150ms',
    _hover: { bg: 'action.secondary.hoverBg', color: 'fg.default' },
  },
})

const BrandWord = () => (
  <HStack gap="2.5">
    <BrandLogo />
    <Text fontSize="17px" fontWeight="640" letterSpacing="-0.02em" color="fg.default">
      revo
    </Text>
  </HStack>
)

const ProjectAvatar = ({
  initials,
  tone,
  size = '26px',
}: {
  readonly initials: string
  readonly tone: LayoutProjectTone
  readonly size?: string
}) => {
  if (tone === 'all' || tone === 'system') {
    return (
      <Center
        boxSize={size}
        borderRadius="8px"
        bg="bg.subtle"
        color={tone === 'all' ? 'action.primary.bg' : 'fg.secondary'}
        borderWidth="1px"
        borderColor="border.strong"
        flexShrink="0"
      >
        {tone === 'all' ? <Layers size={15} /> : <Scan size={15} />}
      </Center>
    )
  }

  return (
    <Center
      boxSize={size}
      borderRadius="8px"
      bg="bg.subtle"
      color="fg.secondary"
      borderWidth="1px"
      borderColor="border.structural"
      textStyle="caption"
      textTransform="lowercase"
      flexShrink="0"
    >
      {initials}
    </Center>
  )
}

const ProjectMenuRow = ({
  active,
  children,
  onSelect,
  value,
}: {
  readonly active?: boolean
  readonly children: ReactNode
  readonly onSelect?: () => void
  readonly value: string
}) => (
  <Menu.Item
    value={value}
    onClick={onSelect}
    display="flex"
    alignItems="center"
    gap="2.5"
    w="full"
    px="2.5"
    py="2"
    borderRadius="8px"
    bg={active ? 'bg.subtle' : 'transparent'}
    color="fg.secondary"
    _highlighted={{ bg: 'bg.subtle' }}
  >
    {children}
  </Menu.Item>
)

const ProjectSwitcher = observer(({ collapsed }: { readonly collapsed: boolean }) => {
  const navigate = useNavigate()
  const switcher = useViewModel(ProjectSwitcherViewModel)

  const selectProject = (projectId: string, to: string): void => {
    switcher.selectProject(projectId)
    navigate(to)
  }

  return (
    <Menu.Root positioning={{ placement: 'bottom-start' }}>
      <Box px="3" pb="2.5" position="relative">
        <Menu.Trigger asChild>
          <Button
            w="full"
            h={collapsed ? '42px' : '46px'}
            px={collapsed ? '0' : '2.5'}
            justifyContent={collapsed ? 'center' : 'flex-start'}
            gap="2.5"
            bg="bg.surface"
            color="fg.default"
            borderWidth="1px"
            borderColor="border.structural"
            borderRadius="9px"
            boxShadow="none"
            _hover={{ bg: 'bg.surface', borderColor: 'border.strong' }}
            _expanded={{ bg: 'bg.surface', borderColor: 'border.strong', boxShadow: 'popover' }}
            title={collapsed ? 'Switch project' : undefined}
          >
            <ProjectAvatar initials={switcher.selectedInitials} tone={switcher.selectedTone} />
            {collapsed ? null : (
              <>
                <Stack gap="0" flex="1" minW="0" align="flex-start">
                  <Text textStyle="bodyStrong" color="fg.default" truncate>
                    {switcher.selectedLabel}
                  </Text>
                  <Text className="mono" textStyle="caption" color="fg.muted" truncate>
                    {switcher.selectedMeta}
                  </Text>
                </Stack>
                <Box color="fg.muted" flexShrink="0">
                  <ChevronDown size={15} />
                </Box>
              </>
            )}
          </Button>
        </Menu.Trigger>
      </Box>
      <Portal>
        <Menu.Positioner>
          <Menu.Content
            w="204px"
            p="1.5"
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border.strong"
            borderRadius="11px"
            boxShadow="dialog"
          >
            <Text
              px="2.5"
              pt="1.5"
              pb="1"
              color="fg.muted"
              fontSize="10.5px"
              fontWeight="650"
              textTransform="uppercase"
              letterSpacing=".05em"
            >
              Workspace · agent-orchestration
            </Text>
            <ProjectMenuRow
              value="all"
              active={switcher.allProjectsSelected}
              onSelect={() => selectProject('all', routes.projects())}
            >
              <ProjectAvatar initials="all" tone="all" size="22px" />
              <Text flex="1" textStyle="bodyStrong" color="fg.default">
                All projects
              </Text>
              {switcher.allProjectsSelected ? (
                <Box color="action.primary.bg">
                  <Check size={15} />
                </Box>
              ) : null}
            </ProjectMenuRow>
            {switcher.projects.map((project) => (
              <ProjectMenuRow
                key={project.id}
                value={project.id}
                active={switcher.selectedProjectId === project.id}
                onSelect={() => selectProject(project.id, `/projects/${project.id}`)}
              >
                <ProjectAvatar initials={project.initials} tone={project.tone} size="22px" />
                <Text flex="1" textStyle="bodyStrong" color="fg.default">
                  {project.label}
                </Text>
                {switcher.selectedProjectId === project.id ? (
                  <Box color="action.primary.bg">
                    <Check size={15} />
                  </Box>
                ) : null}
              </ProjectMenuRow>
            ))}
            <Box h="1px" bg="border.structural" mx="1" my="1.5" />
            <ProjectMenuRow value="control-plane" onSelect={() => selectProject('control-plane', routes.methodRoles())}>
              <ProjectAvatar initials="sys" tone="system" size="22px" />
              <Stack gap="0" flex="1" minW="0">
                <Text textStyle="bodyStrong" color="fg.default">
                  Control plane
                </Text>
                <Span
                  alignSelf="flex-start"
                  px="1.5"
                  borderRadius="4px"
                  bg="bg.subtle"
                  color="fg.muted"
                  fontSize="9.5px"
                  fontWeight="650"
                  textTransform="uppercase"
                  letterSpacing=".04em"
                >
                  System
                </Span>
              </Stack>
              <Box color="fg.muted">
                <ArrowRight size={14} />
              </Box>
            </ProjectMenuRow>
            <ProjectMenuRow value="browse-projects" onSelect={() => selectProject('all', routes.projects())}>
              <Plus size={15} />
              <Text flex="1" textStyle="bodyStrong" color="fg.default">
                Browse all projects
              </Text>
            </ProjectMenuRow>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
})

const Avatar = () => (
  <Center
    boxSize="30px"
    borderRadius="full"
    bgGradient="to-br"
    gradientFrom="action.primary.bg"
    gradientTo="action.primary.hoverBg"
    color="action.primary.fg"
    textStyle="bodyStrong"
    flexShrink="0"
  >
    ka
  </Center>
)

// Search field — visual only (⌘K). In the topbar at lg+, and inside the drawer on smaller screens.
const SearchField = (props: { readonly full?: boolean }) => (
  <HStack
    h={props.full ? '36px' : '34px'}
    w={props.full ? 'auto' : undefined}
    mx={props.full ? '3' : undefined}
    minW={props.full ? undefined : '168px'}
    px="2.5"
    gap="2"
    borderWidth="1px"
    borderColor="border.strong"
    bg="bg.surface"
    borderRadius="control"
    color="fg.secondary"
    textStyle="small"
  >
    <Search size={16} />
    <Span flex="1">Search</Span>
    <Center
      className="mono"
      px="1.5"
      py="0.5"
      borderRadius="5px"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.structural"
      textStyle="caption"
    >
      ⌘K
    </Center>
  </HStack>
)

const navRowColor = (item: NavItem, active: boolean): string => {
  if (item.disabled) return 'fg.muted'
  return active ? 'fg.default' : 'fg.secondary'
}

const NavRowInner = ({
  item,
  active,
  collapsed,
}: {
  readonly item: NavItem
  readonly active: boolean
  readonly collapsed: boolean
}) => {
  const Icon = item.icon
  return (
    <>
      <Box display="inline-flex" color={active ? 'action.primary.bg' : 'inherit'} position="relative">
        <Icon size={18} />
        {collapsed && item.badge ? (
          <Box position="absolute" top="-2px" right="-2px" boxSize="7px" borderRadius="full" bg="dot.waiting" />
        ) : null}
      </Box>
      {collapsed ? null : (
        <>
          <Span flex="1">{item.label}</Span>
          {item.badge ? (
            <Center
              minW="19px"
              h="19px"
              px="1.5"
              borderRadius="pill"
              bg="action.primary.bg"
              color="white"
              textStyle="caption"
            >
              {item.badge}
            </Center>
          ) : null}
        </>
      )}
    </>
  )
}

const NavRow = ({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  readonly item: NavItem
  readonly active: boolean
  readonly collapsed: boolean
  readonly onNavigate?: () => void
}) => {
  const content = <NavRowInner item={item} active={active} collapsed={collapsed} />

  const shared = {
    h: '34px',
    px: collapsed ? '0' : '2.5',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    gap: '2.5',
    textStyle: active ? 'bodyStrong' : 'body',
    color: navRowColor(item, active),
  } as const

  if (item.disabled) {
    return (
      <Box {...shared} cursor="not-allowed" title={`${item.label} · coming soon`} aria-disabled="true">
        {content}
      </Box>
    )
  }

  return (
    <ChakraLink
      asChild
      {...shared}
      bg={active ? 'bg.subtle' : 'transparent'}
      _hover={
        active ? { textDecoration: 'none' } : { textDecoration: 'none', bg: 'blackAlpha.50', color: 'fg.default' }
      }
    >
      <Link to={item.to} title={collapsed ? item.label : undefined} onClick={onNavigate}>
        {content}
      </Link>
    </ChakraLink>
  )
}

const NavRail = ({
  pathname,
  collapsed,
  onNavigate,
}: {
  readonly pathname: string
  readonly collapsed: boolean
  readonly onNavigate?: () => void
}) => (
  <Stack as="nav" gap="0.5" px={collapsed ? '2.5' : '3'} py="2">
    {NAV_ITEMS.map((item) => (
      <NavRow
        key={item.to}
        item={item}
        active={isActive(pathname, item.match)}
        collapsed={collapsed}
        onNavigate={onNavigate}
      />
    ))}
  </Stack>
)

// Host status pill at the sidebar foot (.host-pill): beacon + daemon line.
const HostPill = ({ collapsed }: { readonly collapsed: boolean }) => {
  const dot = <Box boxSize="2" borderRadius="full" bg="dot.success" flexShrink="0" />

  if (collapsed) {
    return (
      <Center
        mt="auto"
        mx="3"
        mb="3"
        p="2.5"
        borderRadius="9px"
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.structural"
        title="local · connected"
      >
        {dot}
      </Center>
    )
  }

  return (
    <HStack
      mt="auto"
      mx="3"
      mb="3"
      p="2.5"
      gap="2.5"
      borderRadius="9px"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.structural"
    >
      {dot}
      <Stack gap="0" minW="0">
        <Text textStyle="caption" color="fg.secondary">
          local · connected
        </Text>
        <Text className="mono" textStyle="caption" color="fg.muted" truncate>
          daemon up · {HOST_STATUS.uptime}
        </Text>
      </Stack>
    </HStack>
  )
}

// Persistent sidebar — desktop only (lg+); on smaller screens it lives in the drawer.
const Sidebar = ({
  pathname,
  collapsed,
  onToggle,
}: {
  readonly pathname: string
  readonly collapsed: boolean
  readonly onToggle: () => void
}) => {
  const ToggleIcon = collapsed ? ChevronRight : ChevronLeft
  const toggleLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar'
  const toggle = (
    <IconButton boxSize="26px" onClick={onToggle} title={toggleLabel} aria-label={toggleLabel}>
      <ToggleIcon size={16} />
    </IconButton>
  )

  return (
    <Flex
      as="aside"
      display={{ base: 'none', lg: 'flex' }}
      direction="column"
      w={collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W}
      flexShrink="0"
      bg="bg.surface"
      borderRightWidth="1px"
      borderColor="border.structural"
      transition="width 150ms cubic-bezier(.2,0,0,1)"
    >
      {collapsed ? (
        <Stack align="center" gap="2" px="2" pt="4" pb="3">
          <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
            <Link to={routes.home()}>
              <BrandLogo />
            </Link>
          </ChakraLink>
          {toggle}
        </Stack>
      ) : (
        <HStack justify="space-between" px="3.5" pt="4" pb="3">
          <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
            <Link to={routes.home()}>
              <BrandWord />
            </Link>
          </ChakraLink>
          {toggle}
        </HStack>
      )}
      <ProjectSwitcher collapsed={collapsed} />
      <NavRail pathname={pathname} collapsed={collapsed} />
      <HostPill collapsed={collapsed} />
    </Flex>
  )
}

// Mobile navigation — the same nav inside an off-canvas drawer (<lg).
const MobileNavDrawer = ({
  pathname,
  open,
  onClose,
}: {
  readonly pathname: string
  readonly open: boolean
  readonly onClose: () => void
}) => (
  <Drawer.Root
    open={open}
    onOpenChange={(e) => {
      if (!e.open) onClose()
    }}
    placement="start"
  >
    <Portal>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content w={SIDEBAR_W} maxW="80vw" bg="bg.surface">
          <Flex direction="column" h="100%">
            <HStack justify="space-between" px="3.5" pt="4" pb="3">
              <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
                <Link to={routes.home()} onClick={onClose}>
                  <BrandWord />
                </Link>
              </ChakraLink>
              <IconButton boxSize="26px" onClick={onClose} title="Close menu" aria-label="Close menu">
                <X size={16} />
              </IconButton>
            </HStack>
            <Box pb="1">
              <SearchField full />
            </Box>
            <NavRail pathname={pathname} collapsed={false} onNavigate={onClose} />
            <Box mt="auto">
              <ChakraLink
                asChild
                display="flex"
                alignItems="center"
                gap="2.5"
                mx="3"
                mb="1"
                p="2"
                borderRadius="9px"
                _hover={{ bg: 'blackAlpha.50', textDecoration: 'none' }}
              >
                <Link to={routes.home()} onClick={onClose}>
                  <Avatar />
                  <Stack gap="0" minW="0">
                    <Text textStyle="body" color="fg.secondary">
                      ka
                    </Text>
                    <Text textStyle="caption" color="fg.muted">
                      Account
                    </Text>
                  </Stack>
                </Link>
              </ChakraLink>
              <HostPill collapsed={false} />
            </Box>
          </Flex>
        </Drawer.Content>
      </Drawer.Positioner>
    </Portal>
  </Drawer.Root>
)

// Mobile-only Inbox shortcut: surfaces the pending-decisions count in the topbar
// since the sidebar nav badge is hidden inside the drawer on small screens.
const InboxButton = () => (
  <ChakraLink
    asChild
    display={{ base: 'grid', lg: 'none' }}
    placeItems="center"
    position="relative"
    boxSize="34px"
    borderRadius="7px"
    color="fg.secondary"
    _hover={{ bg: 'blackAlpha.50', color: 'fg.default', textDecoration: 'none' }}
  >
    <Link to={routes.inbox()} title="Inbox" aria-label={`Inbox · ${PENDING_INBOX} pending`}>
      <Inbox size={18} />
      {PENDING_INBOX ? (
        <Center
          position="absolute"
          top="-2px"
          right="-2px"
          minW="16px"
          h="16px"
          px="1"
          borderRadius="pill"
          bg="action.primary.bg"
          color="white"
          textStyle="caption"
          borderWidth="2px"
          borderColor="bg.surface"
        >
          {PENDING_INBOX}
        </Center>
      ) : null}
    </Link>
  </ChakraLink>
)

// Search lives in the topbar at lg+; on smaller screens it moves into the drawer.
const CommandAffordance = () => (
  <Box display={{ base: 'none', lg: 'block' }}>
    <SearchField />
  </Box>
)

const TopBar = ({ pathname, onMenuOpen }: { readonly pathname: string; readonly onMenuOpen: () => void }) => {
  const breadcrumbs = breadcrumbsForPath(pathname)

  return (
    <Flex
      as="header"
      h="56px"
      flexShrink="0"
      align="center"
      justify="space-between"
      gap="3"
      pl={{ base: '3', lg: '6' }}
      pr={{ base: '3', md: '7' }}
      borderBottomWidth="1px"
      borderColor="border.structural"
      bg="bg.surface"
      position="sticky"
      top="0"
      zIndex="20"
    >
      <HStack gap="2" minW="0">
        <IconButton
          display={{ base: 'grid', lg: 'none' }}
          boxSize="34px"
          onClick={onMenuOpen}
          title="Open menu"
          aria-label="Open menu"
        >
          <MenuIcon size={18} />
        </IconButton>
        <HStack
          as="nav"
          aria-label="Breadcrumb"
          display={{ base: 'none', sm: 'flex' }}
          gap="2"
          textStyle="small"
          color="fg.secondary"
          minW="0"
        >
          <ChakraLink
            asChild
            color="fg.secondary"
            flexShrink="0"
            _hover={{ color: 'fg.default', textDecoration: 'none' }}
          >
            <Link to={routes.home()}>revo</Link>
          </ChakraLink>
          {breadcrumbs.map((crumb) => (
            <HStack key={`${crumb.label}-${crumb.to ?? 'current'}`} as="span" gap="2" minW="0">
              <Box color="fg.muted" display="inline-flex" flexShrink="0">
                <ChevronRight size={14} />
              </Box>
              {crumb.to ? (
                <ChakraLink
                  asChild
                  color="fg.secondary"
                  flexShrink="0"
                  _hover={{ color: 'fg.default', textDecoration: 'none' }}
                >
                  <Link to={crumb.to}>{crumb.label}</Link>
                </ChakraLink>
              ) : (
                <Text color="fg.default" fontWeight="560" truncate>
                  {crumb.label}
                </Text>
              )}
            </HStack>
          ))}
        </HStack>
        <Box display={{ base: 'flex', sm: 'none' }}>
          <BrandLogo />
        </Box>
      </HStack>
      <HStack gap={{ base: '2', md: '3' }}>
        <InboxButton />
        <CommandAffordance />
        <Button
          asChild
          size="sm"
          h="34px"
          px={{ base: '2.5', sm: '3.5' }}
          gap="1.5"
          bg="action.primary.bg"
          color="action.primary.fg"
          borderRadius="control"
          _hover={{ bg: 'action.primary.hoverBg' }}
        >
          <Link to={routes.runCreate()}>
            <Plus size={16} />
            <Span display={{ base: 'none', lg: 'inline' }}>New run</Span>
          </Link>
        </Button>
        <Box display={{ base: 'none', lg: 'block' }} w="1px" h="26px" bg="border" />
        <Box display={{ base: 'none', lg: 'flex' }}>
          <Avatar />
        </Box>
      </HStack>
    </Flex>
  )
}

export const Layout = () => {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const { open, onOpen, onClose } = useDisclosure()

  return (
    <Flex h="100dvh" overflow="hidden" bg="bg.canvas">
      <Sidebar pathname={pathname} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <MobileNavDrawer pathname={pathname} open={open} onClose={onClose} />
      <Flex direction="column" flex="1" minW="0">
        <TopBar pathname={pathname} onMenuOpen={onOpen} />
        <Box flex="1" overflowY="auto" overflowX="hidden">
          <Box maxW="1180px" mx="auto" px={{ base: '4', md: '6', lg: '10' }} pt={{ base: '5', md: '7' }} pb="24">
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Flex>
  )
}
