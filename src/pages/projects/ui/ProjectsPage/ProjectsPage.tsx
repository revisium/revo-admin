import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react'
import { Folder, Plus } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import type React from 'react'
import { ProjectSearchToolbar } from 'src/features/ProjectSearchToolbar'
import { useViewModel } from 'src/shared/lib'
import { EmptyState, NoResultsState, PageHeader } from 'src/shared/ui/components'
import { ProjectListViewModel } from '../../model/ProjectListViewModel'
import { ProjectList } from '../ProjectList/ProjectList'
import { ProjectListColumnHeadings } from '../ProjectListColumnHeadings/ProjectListColumnHeadings'

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

export const ProjectsPage: React.FC = observer(() => {
  const viewModel = useViewModel(ProjectListViewModel)

  const renderContent = () => {
    if (viewModel.isNoResults) {
      return (
        <NoResultsState
          title="No projects match this search"
          query={viewModel.query.trim()}
          description="Nothing in the current list matches that name or ID."
          onClearSearch={() => viewModel.setQuery('')}
          clearSearchLabel="Clear search"
        />
      )
    }

    if (viewModel.isEmpty) {
      return <EmptyState title="No projects yet" description="Create a project to start working." action={Actions} />
    }

    return (
      <>
        <ProjectListColumnHeadings />
        <ProjectList rows={viewModel.rows} />
      </>
    )
  }

  return (
    <Stack gap="6">
      <PageHeader
        eyebrow={Eyebrow}
        title="Projects"
        description="Every project you can open, newest change first. Search by name or ID."
        actions={Actions}
      />
      <ProjectSearchToolbar
        query={viewModel.query}
        onQueryChange={viewModel.setQuery}
        searchLabel="Search by name or ID"
        searchPlaceholder="For example, Orchestrator"
        includeArchived={viewModel.includeArchived}
        onIncludeArchivedChange={viewModel.setIncludeArchived}
        includeArchivedLabel="Include archived"
      />
      <Box marginTop="-2">
        <Text textStyle="small" color="fg.secondary" marginBottom="4">
          {viewModel.resultCountLabel}
        </Text>
        {renderContent()}
      </Box>
    </Stack>
  )
})

ProjectsPage.displayName = 'ProjectsPage'
