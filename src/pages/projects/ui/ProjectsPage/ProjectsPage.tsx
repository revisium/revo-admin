import { Button, Grid, HStack, Stack, Text } from '@chakra-ui/react'
import { Folder, Plus } from 'lucide-react'
import type React from 'react'
import { PROJECTS } from 'src/shared/fixtures'
import { PageHeader } from 'src/shared/ui/components'
import { ControlPlaneCard } from '../ControlPlaneCard/ControlPlaneCard'
import { ProjectCard } from '../ProjectCard'

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

export const ProjectsPage: React.FC = () => (
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
