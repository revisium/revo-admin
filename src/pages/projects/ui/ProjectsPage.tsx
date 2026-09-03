import { Box, Button, Center, Grid, HStack, Link as ChakraLink, Span, Stack, Text } from '@chakra-ui/react'
import { ArrowRight, BookOpen, Cpu, Folder, GitBranch, Layers3, Plus, Play, Scan, UserRound } from 'lucide-react'
import { Link } from 'react-router'
import { PIPELINES, PROJECTS, reposForProject, ROLES, type ProjectRow } from 'src/shared/fixtures'
import { Card } from 'src/shared/ui'
import { PageHeader } from 'src/shared/ui/components'

// Project identity is carried by name and id, not by colour: every avatar uses the same
// neutral surface.
const avatarStyles = { bg: 'bg.subtle', fg: 'fg.secondary', border: 'border.structural' }

const ProjectAvatar = ({ initials, system = false }: { readonly initials: string; readonly system?: boolean }) => {
  return (
    <Center
      boxSize="40px"
      borderRadius="8px"
      bg={avatarStyles.bg}
      color={avatarStyles.fg}
      borderWidth="1px"
      borderColor={avatarStyles.border}
      textStyle="componentTitle"
      textTransform="lowercase"
      flexShrink="0"
    >
      {system ? <Scan size={18} /> : initials}
    </Center>
  )
}

const RepoPill = ({ repoName }: { readonly repoName: string }) => {
  const [, name] = repoName.split('/')

  return (
    <HStack
      as="span"
      gap="1.5"
      px="2"
      py="1"
      borderRadius="pill"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.structural"
      color="fg.secondary"
      textStyle="caption"
    >
      <GitBranch size={11} />
      <Span className="mono">{name ?? repoName}</Span>
    </HStack>
  )
}

const StatItem = ({
  icon: Icon,
  value,
  label,
}: {
  readonly icon: typeof BookOpen
  readonly value: number | string
  readonly label: string
}) => (
  <HStack as="span" gap="1" color="fg.secondary" textStyle="caption">
    <Icon size={12} />
    <Span className="tnum">{value}</Span>
    <Span srOnly>{label}</Span>
  </HStack>
)

const ProjectCard = ({ project }: { readonly project: ProjectRow }) => {
  const repos = reposForProject(project.id)

  return (
    <ChakraLink
      asChild
      display="block"
      h="100%"
      color="inherit"
      _hover={{ textDecoration: 'none' }}
      _focusVisible={{ outline: '2px solid', outlineColor: 'focus.ring', outlineOffset: '3px' }}
    >
      <Link to={`/projects/${project.id}`}>
        <Card
          as="article"
          className="group"
          p="5"
          minH="242px"
          h="100%"
          display="flex"
          flexDirection="column"
          transition="transform 150ms cubic-bezier(.2,0,0,1), box-shadow 150ms, border-color 150ms"
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'popover', borderColor: 'border.strong' }}
        >
          <HStack gap="3" mb="3.5" align="center">
            <ProjectAvatar initials={project.initials} />
            <Stack gap="0.5" minW="0" flex="1">
              <Text textStyle="componentTitle" color="fg.default" truncate>
                {project.name}
              </Text>
              <Text className="mono" textStyle="caption" color="fg.muted" truncate>
                {project.key}
              </Text>
            </Stack>
            <Box
              color="fg.muted"
              transition="transform 150ms, color 150ms"
              _groupHover={{ transform: 'translateX(3px)', color: 'fg.default' }}
            >
              <ArrowRight size={16} />
            </Box>
          </HStack>
          <Text textStyle="small" color="fg.secondary" lineHeight="1.55" mb="4">
            {project.description}
          </Text>
          <HStack gap="1.5" wrap="wrap" mb="4">
            {repos.map((repo) => (
              <RepoPill key={repo.id} repoName={repo.name} />
            ))}
          </HStack>
          <HStack mt="auto" pt="3.5" borderTopWidth="1px" borderColor="border.structural" gap="3" wrap="wrap">
            <HStack className="mono" gap="1.5" color="fg.secondary" textStyle="caption">
              <GitBranch size={12} />
              <Span>{project.defaultBranch}</Span>
            </HStack>
            <Text className="mono" textStyle="caption" color="fg.muted">
              @{project.headRev}
            </Text>
            <HStack gap="3" ml={{ base: '0', md: 'auto' }} wrap="wrap">
              <StatItem icon={BookOpen} value={project.stats.adrs} label="ADRs" />
              <StatItem icon={Layers3} value={project.stats.kb} label="KB articles" />
              <StatItem icon={Cpu} value={project.stats.tables} label="Memory tables" />
              <StatItem icon={Play} value={project.stats.runs} label="Runs" />
            </HStack>
          </HStack>
        </Card>
      </Link>
    </ChakraLink>
  )
}

const ControlPlaneCard = () => (
  <ChakraLink
    asChild
    display="block"
    h="100%"
    color="inherit"
    _hover={{ textDecoration: 'none' }}
    _focusVisible={{ outline: '2px solid', outlineColor: 'focus.ring', outlineOffset: '3px' }}
  >
    <Link to="/method/roles">
      <Card
        as="article"
        className="group"
        p="5"
        minH="242px"
        h="100%"
        display="flex"
        flexDirection="column"
        bg="bg.subtle"
        transition="transform 150ms cubic-bezier(.2,0,0,1), box-shadow 150ms, border-color 150ms"
        _hover={{ transform: 'translateY(-2px)', boxShadow: 'popover', borderColor: 'border.strong' }}
      >
        <HStack gap="3" mb="3.5" align="center">
          <ProjectAvatar initials="sys" system />
          <Stack gap="0.5" minW="0" flex="1">
            <HStack gap="2" minW="0">
              <Text textStyle="componentTitle" color="fg.default" truncate>
                Control plane
              </Text>
              <Span
                px="1.5"
                py="0.5"
                borderRadius="4px"
                bg="bg.surface"
                borderWidth="1px"
                borderColor="border.structural"
                color="fg.muted"
                fontSize="9.5px"
                fontWeight="650"
                textTransform="uppercase"
                letterSpacing="0"
                flexShrink="0"
              >
                System
              </Span>
            </HStack>
            <Text className="mono" textStyle="caption" color="fg.muted" truncate>
              admin/control-plane/master
            </Text>
          </Stack>
          <Box
            color="fg.muted"
            transition="transform 150ms, color 150ms"
            _groupHover={{ transform: 'translateX(3px)', color: 'fg.default' }}
          >
            <ArrowRight size={16} />
          </Box>
        </HStack>
        <Text textStyle="small" color="fg.secondary" lineHeight="1.55">
          The Method: versioned roles, pipelines, playbooks, model profiles, and routing policy that govern every run.
        </Text>
        <HStack mt="auto" pt="3.5" borderTopWidth="1px" borderColor="border.structural" gap="3" wrap="wrap">
          <HStack className="mono" gap="1.5" color="fg.secondary" textStyle="caption">
            <GitBranch size={12} />
            <Span>master</Span>
          </HStack>
          <HStack gap="3" ml={{ base: '0', md: 'auto' }} wrap="wrap">
            <StatItem icon={Scan} value={PIPELINES.length} label="Pipelines" />
            <StatItem icon={UserRound} value={ROLES.length} label="Roles" />
          </HStack>
        </HStack>
      </Card>
    </Link>
  </ChakraLink>
)

const Eyebrow = (
  <HStack gap="2" align="center">
    <Folder size={13} />
    <Text as="span">Workspace · agent-orchestration</Text>
  </HStack>
)

const Actions = (
  <Button
    size="sm"
    h="36px"
    px="3.5"
    gap="2"
    bg="fg.default"
    color="action.primary.fg"
    disabled
    _hover={{ bg: 'action.primary.hoverBg' }}
    _disabled={{ opacity: 0.58, cursor: 'not-allowed' }}
  >
    <Plus size={15} />
    New project
  </Button>
)

export const ProjectsPage = () => (
  <Stack gap="6">
    <PageHeader
      eyebrow={Eyebrow}
      title="Projects"
      description="Each project is a versioned Revisium project — repositories, knowledge base, ADRs, and the domain memory agents read."
      actions={Actions}
    />
    <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }} gap="4.5" alignItems="stretch">
      {PROJECTS.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <ControlPlaneCard />
    </Grid>
  </Stack>
)
