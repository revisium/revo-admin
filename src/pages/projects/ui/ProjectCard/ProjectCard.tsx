import { Box, Link as ChakraLink, HStack, Span, Stack, Text } from '@chakra-ui/react'
import { ArrowRight, BookOpen, Cpu, GitBranch, Layers3, Play } from 'lucide-react'
import type React from 'react'
import { Link } from 'react-router'
import { reposForProject, type ProjectRow } from 'src/shared/fixtures'
import { Card } from 'src/shared/ui'
import { Avatar } from 'src/shared/ui/kit'
import { StatItem } from 'src/shared/ui/components'
import { RepoPill } from './RepoPill'

// Project identity is carried by name and id, not by colour: the grid deliberately picks the
// neutral avatar tone instead of mapping project.tone the way the detail header does.
interface IProjectCardProps {
  readonly project: ProjectRow
}

export const ProjectCard: React.FC<IProjectCardProps> = ({ project }: IProjectCardProps) => {
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
            <Avatar size="lg">{project.initials}</Avatar>
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
