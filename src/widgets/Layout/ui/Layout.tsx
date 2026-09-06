import {
  Box,
  Button,
  Center,
  chakra,
  Drawer,
  Flex,
  HStack,
  Link as ChakraLink,
  Portal,
  Span,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import {
  ChevronLeft,
  ChevronRight,
  Folder,
  Inbox,
  House,
  MessageSquare,
  List,
  type LucideIcon,
  Menu as MenuIcon,
  Plus,
  Scan,
  Search,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { PENDING_INBOX, adrsForProject, knowledgeForProject, memoryForProject, projectById } from 'src/shared/fixtures'
import { BrandLogo } from 'src/shared/ui'
import { SidebarAction, SidebarItem } from 'src/shared/ui/components'
import { Avatar } from 'src/shared/ui/kit'
import { ContextList } from './ContextList'
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

interface SearchFieldProps {
  readonly full?: boolean
}

interface NavRailProps {
  readonly pathname: string
  readonly collapsed: boolean
  readonly onNavigate?: () => void
}

interface SidebarProps {
  readonly pathname: string
  readonly collapsed: boolean
  readonly onToggle: () => void
}

interface MobileNavDrawerProps {
  readonly pathname: string
  readonly open: boolean
  readonly onClose: () => void
}

interface TopBarProps {
  readonly pathname: string
  readonly onMenuOpen: () => void
}

const PATH_SECTION_INDEX = 0
const PROJECT_ID_INDEX = 1
const PROJECT_TAB_INDEX = 2
const PROJECT_DETAIL_INDEX = 3
const BREADCRUMB_ADR_NUMBER_WIDTH = 4

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: 'Home', to: routes.home(), match: routes.home(), icon: House },
  { label: 'Assistant', to: routes.assistant(), match: routes.assistant(), icon: MessageSquare },
  { label: 'Runs', to: routes.runs(), match: routes.runs(), icon: List },
  { label: 'Inbox', to: routes.inbox(), match: routes.inbox(), icon: Inbox, badge: PENDING_INBOX.length },
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
  if (projectId === 'new') return [{ label: 'Projects', to: routes.projects() }, { label: 'Create project' }]
  if (!tab) return [{ label: 'Projects', to: routes.projects() }, { label: projectId }]

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

  if (section === 'assistant') return [{ label: 'Assistant' }]
  if (section === 'inbox') return [{ label: 'Inbox' }]
  if (section === 'method') return [{ label: 'Method' }]

  if (section === 'projects') return projectBreadcrumbs(segments)

  return [{ label: 'Home' }]
}

const SIDEBAR_W = '288px'
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

const UserAvatar = () => (
  <Avatar size="md" shape="circle" tone="brand">
    ka
  </Avatar>
)

// Search field — visual only (⌘K). In the topbar at lg+, and inside the drawer on smaller screens.
const SearchField = (props: SearchFieldProps) => (
  <HStack
    h={props.full ? '36px' : '34px'}
    w={props.full ? 'auto' : undefined}
    mx={props.full ? '4' : undefined}
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

const NavRail = ({ pathname, collapsed, onNavigate }: NavRailProps) => (
  <Stack as="nav" aria-label="Main navigation" flexShrink="0" gap="1" px={collapsed ? '2.5' : '4'} py="2">
    {NAV_ITEMS.map((item) => {
      const ItemIcon = item.icon

      return (
        <SidebarItem
          key={item.to}
          active={isActive(pathname, item.match)}
          badge={item.badge}
          collapsed={collapsed}
          disabled={item.disabled}
          icon={<ItemIcon size={18} />}
          label={item.label}
          onNavigate={onNavigate}
          to={item.to}
        />
      )
    })}
  </Stack>
)

// Persistent sidebar — desktop only (lg+); on smaller screens it lives in the drawer.
const Sidebar = ({ pathname, collapsed, onToggle }: SidebarProps) => {
  const ToggleIcon = collapsed ? ChevronRight : ChevronLeft
  const toggleLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar'
  const toggle = (
    <SidebarAction iconOnly label={toggleLabel} onClick={onToggle}>
      <ToggleIcon size={16} />
    </SidebarAction>
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
        <HStack justify="space-between" px="4" pt="4" pb="3">
          <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
            <Link to={routes.home()}>
              <BrandWord />
            </Link>
          </ChakraLink>
          {toggle}
        </HStack>
      )}
      <NavRail pathname={pathname} collapsed={collapsed} />
      {!collapsed && <ContextList pathname={pathname} />}
    </Flex>
  )
}

// Mobile navigation — the same nav inside an off-canvas drawer (<lg).
const MobileNavDrawer = ({ pathname, open, onClose }: MobileNavDrawerProps) => (
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
            <HStack justify="space-between" px="4" pt="4" pb="3">
              <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
                <Link to={routes.home()} onClick={onClose}>
                  <BrandWord />
                </Link>
              </ChakraLink>
              <SidebarAction iconOnly label="Close menu" onClick={onClose}>
                <X size={16} />
              </SidebarAction>
            </HStack>
            <Box pb="1">
              <SearchField full />
            </Box>
            <NavRail pathname={pathname} collapsed={false} onNavigate={onClose} />
            <ContextList pathname={pathname} onNavigate={onClose} />
            <Box mt="auto" mb="1" px="4" flexShrink="0">
              <SidebarItem icon={<UserAvatar />} label="ka" meta="Account" onNavigate={onClose} to={routes.home()} />
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
    <Link to={routes.inbox()} title="Inbox" aria-label={`Inbox · ${PENDING_INBOX.length} pending`}>
      <Inbox size={18} />
      {PENDING_INBOX.length ? (
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
          {PENDING_INBOX.length}
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

const TopBar = ({ pathname, onMenuOpen }: TopBarProps) => {
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
          <UserAvatar />
        </Box>
      </HStack>
    </Flex>
  )
}

export const Layout = () => {
  const { pathname } = useLocation()
  const isProjectsIndex = pathname === routes.projects()
  const [collapsed, setCollapsed] = useState(false)
  const { open, onOpen, onClose } = useDisclosure()

  return (
    <Flex h="100dvh" overflow="hidden" bg="bg.canvas">
      <Sidebar pathname={pathname} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <MobileNavDrawer pathname={pathname} open={open} onClose={onClose} />
      <Flex direction="column" flex="1" minW="0" minH="0">
        <TopBar pathname={pathname} onMenuOpen={onOpen} />
        <Box
          flex="1"
          minH="0"
          overflowY={{ base: 'auto', lg: isProjectsIndex ? 'hidden' : 'auto' }}
          overflowX="hidden"
          scrollbarGutter={{ base: 'stable', lg: isProjectsIndex ? 'auto' : 'stable' }}
        >
          <Box
            maxW="1180px"
            mx="auto"
            px={{ base: '4', md: '6', lg: '10' }}
            py={{ base: '5', md: '7' }}
            h={{ lg: isProjectsIndex ? 'full' : 'auto' }}
            minH={{ lg: isProjectsIndex ? '0' : 'auto' }}
          >
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Flex>
  )
}
