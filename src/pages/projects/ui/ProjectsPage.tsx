import { Box, Button, Center, Grid, HStack, Link as ChakraLink, Span, Stack, Text } from '@chakra-ui/react'
import { ArrowRight, BookOpen, Cpu, Folder, GitBranch, Layers3, Plus, Play, Scan, UserRound } from 'lucide-react'
import { Link } from 'react-router'
import { PIPELINES, PROJECTS, reposForProject, ROLES, type ProjectRow, type ProjectTone } from 'src/shared/fixtures'
import { Card, PageHeader } from 'src/shared/ui'

const projectToneStyles = (
  tone: ProjectTone,
): { readonly bg: string; readonly fg: string; readonly border: string } => {
  if (tone === 'teal') return { bg: 'accent.role.bg', fg: 'accent.role.fg', border: 'accent.role.border' }
  if (tone === 'plum') return { bg: 'status.waiting.bg', fg: 'status.waiting.fg', border: 'status.waiting.border' }
  if (tone === 'system') return { bg: 'bg.inset', fg: 'fg.2', border: 'border.warmStrong' }
  return { bg: 'brand.soft', fg: 'brand.ink', border: 'brand.softBorder' }
}

const ProjectAvatar = ({
  initials,
  tone,
  system = false,
}: {
  readonly initials: string
  readonly tone: ProjectTone
  readonly system?: boolean
}) => {
  const colors = projectToneStyles(tone)

  return (
    <Center
      boxSize="40px"
      borderRadius="8px"
      bg={colors.bg}
      color={colors.fg}
      borderWidth="1px"
      borderColor={colors.border}
      textStyle="semibold-md"
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
      bg="bg.inset"
      borderWidth="1px"
      borderColor="border"
      color="fg.1"
      textStyle="regular-xs"
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
  <HStack as="span" gap="1" color="fg.2" textStyle="regular-xs">
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
      _focusVisible={{ outline: '2px solid', outlineColor: 'brand.500', outlineOffset: '3px' }}
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
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'sh-2', borderColor: 'border.warmStrong' }}
        >
          <HStack gap="3" mb="3.5" align="center">
            <ProjectAvatar initials={project.initials} tone={project.tone} />
            <Stack gap="0.5" minW="0" flex="1">
              <Text textStyle="semibold-md" color="fg.0" truncate>
                {project.name}
              </Text>
              <Text className="mono" textStyle="regular-xs" color="fg.3" truncate>
                {project.key}
              </Text>
            </Stack>
            <Box
              color="fg.3"
              transition="transform 150ms, color 150ms"
              _groupHover={{ transform: 'translateX(3px)', color: 'brand.500' }}
            >
              <ArrowRight size={16} />
            </Box>
          </HStack>
          <Text textStyle="regular-sm" color="fg.2" lineHeight="1.55" mb="4">
            {project.description}
          </Text>
          <HStack gap="1.5" wrap="wrap" mb="4">
            {repos.map((repo) => (
              <RepoPill key={repo.id} repoName={repo.name} />
            ))}
          </HStack>
          <HStack mt="auto" pt="3.5" borderTopWidth="1px" borderColor="border.subtle" gap="3" wrap="wrap">
            <HStack className="mono" gap="1.5" color="fg.2" textStyle="regular-xs">
              <GitBranch size={12} />
              <Span>{project.defaultBranch}</Span>
            </HStack>
            <Text className="mono" textStyle="regular-xs" color="fg.3">
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
    _focusVisible={{ outline: '2px solid', outlineColor: 'brand.500', outlineOffset: '3px' }}
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
        bg="bg.inset"
        transition="transform 150ms cubic-bezier(.2,0,0,1), box-shadow 150ms, border-color 150ms"
        _hover={{ transform: 'translateY(-2px)', boxShadow: 'sh-2', borderColor: 'border.warmStrong' }}
      >
        <HStack gap="3" mb="3.5" align="center">
          <ProjectAvatar initials="sys" tone="system" system />
          <Stack gap="0.5" minW="0" flex="1">
            <HStack gap="2" minW="0">
              <Text textStyle="semibold-md" color="fg.0" truncate>
                Control plane
              </Text>
              <Span
                px="1.5"
                py="0.5"
                borderRadius="4px"
                bg="bg.2"
                borderWidth="1px"
                borderColor="border"
                color="fg.3"
                fontSize="9.5px"
                fontWeight="650"
                textTransform="uppercase"
                letterSpacing="0"
                flexShrink="0"
              >
                System
              </Span>
            </HStack>
            <Text className="mono" textStyle="regular-xs" color="fg.3" truncate>
              admin/control-plane/master
            </Text>
          </Stack>
          <Box
            color="fg.3"
            transition="transform 150ms, color 150ms"
            _groupHover={{ transform: 'translateX(3px)', color: 'brand.500' }}
          >
            <ArrowRight size={16} />
          </Box>
        </HStack>
        <Text textStyle="regular-sm" color="fg.2" lineHeight="1.55">
          The Method: versioned roles, pipelines, playbooks, model profiles, and routing policy that govern every run.
        </Text>
        <HStack mt="auto" pt="3.5" borderTopWidth="1px" borderColor="border.subtle" gap="3" wrap="wrap">
          <HStack className="mono" gap="1.5" color="fg.2" textStyle="regular-xs">
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
    bg="brand.500"
    color="brand.on"
    disabled
    _hover={{ bg: 'brand.hover' }}
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
