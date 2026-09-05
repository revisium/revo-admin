import { Box, Button, HStack, Spinner, Stack, Text } from '@chakra-ui/react'
import { Folder, Plus } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import type React from 'react'
import { Link } from 'react-router'
import { routes } from 'src/shared/config'
import { ProjectSearchToolbar } from 'src/features/ProjectSearchToolbar'
import {
  ProjectListContinuationError,
  ProjectListContinuationProgress,
  ProjectListInitialProgress,
} from '../ProjectListContinuation/ProjectListContinuation'
import { useViewModel } from 'src/shared/lib'
import { EmptyState, InlineError, NoResultsState, PageHeader } from 'src/shared/ui/components'
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
    asChild
    size="sm"
    h={{ base: '44px', lg: '36px' }}
    minW="44px"
    px="3.5"
    gap="2"
    bg="fg.default"
    color="action.primary.fg"
    _hover={{ bg: 'action.primary.hoverBg' }}
  >
    <Link to={routes.projectCreate()} state={{ fromProjects: true }}>
      <Plus size={15} />
      Create project
    </Link>
  </Button>
)

export const ProjectsPage: React.FC = observer(() => {
  const viewModel = useViewModel(ProjectListViewModel)

  const renderContent = () => {
    if (viewModel.state === 'error') {
      return (
        <InlineError
          title="Projects could not be loaded"
          description={viewModel.error}
          onRetry={viewModel.retry}
          retryLabel="Retry"
        />
      )
    }

    if (viewModel.state === 'idle' || (viewModel.state === 'loading' && !viewModel.hasLoaded)) {
      return (
        <Box borderTopWidth="1px" borderColor="border.structural" flex={{ lg: '1' }} minH={{ lg: '0' }}>
          <ProjectListInitialProgress label="Loading projects…" />
        </Box>
      )
    }

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
        <Box
          as="section"
          aria-label="Projects collection"
          borderTopWidth="1px"
          borderColor="border.structural"
          flex={{ lg: '1' }}
          minH={{ lg: '0' }}
          overflowY={{ lg: 'auto' }}
          overscrollBehavior={{ lg: 'contain' }}
          scrollbarGutter={{ lg: 'stable' }}
        >
          <ProjectListColumnHeadings />
          <ProjectList rows={viewModel.rows} />
          {viewModel.isLoadingNextPage && <ProjectListContinuationProgress label="Loading more projects…" />}
          {viewModel.continuationState === 'error' && (
            <ProjectListContinuationError
              title="More projects could not be loaded"
              description={viewModel.continuationError}
              retryLabel="Retry"
              onRetry={viewModel.retryNextPage}
            />
          )}
        </Box>
        {viewModel.hasNextPage && !viewModel.isRefreshing && viewModel.continuationState === 'idle' && (
          <Box paddingBlock="4">
            <Button variant="outline" onClick={viewModel.loadNextPage}>
              Load more projects
            </Button>
          </Box>
        )}
      </>
    )
  }

  return (
    <Stack gap="6" h={{ lg: 'full' }} minH={{ lg: '0' }}>
      <PageHeader
        eyebrow={Eyebrow}
        title="Projects"
        description="Every project you can open, newest change first. Search by name or ID."
        actions={viewModel.isEmpty && !viewModel.isNoResults ? undefined : Actions}
      />
      <Box position={{ base: 'sticky', lg: 'static' }} top="0" zIndex="10" bg="bg.canvas">
        <ProjectSearchToolbar
          query={viewModel.query}
          onQueryChange={viewModel.setQuery}
          searchLabel="Search by name or ID"
          searchPlaceholder="For example, Orchestrator"
          includeArchived={viewModel.includeArchived}
          onIncludeArchivedChange={viewModel.setIncludeArchived}
          includeArchivedLabel="Include archived"
        />
      </Box>
      <Box marginTop="-2" display={{ lg: 'flex' }} flexDirection="column" flex={{ lg: '1' }} minH={{ lg: '0' }}>
        {viewModel.resultCountLabel && (
          <HStack gap="2" marginBottom="4">
            <Text textStyle="small" color="fg.secondary">
              {viewModel.resultCountLabel}
            </Text>
            {viewModel.isRefreshing && (
              <Spinner role="status" size="sm" color="action.primary.bg" aria-label="Updating projects" />
            )}
          </HStack>
        )}
        {renderContent()}
      </Box>
    </Stack>
  )
})

ProjectsPage.displayName = 'ProjectsPage'
