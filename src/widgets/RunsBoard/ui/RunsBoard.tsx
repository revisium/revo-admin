import { Box, chakra, Flex, HStack, Span, Stack } from '@chakra-ui/react'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { RUN_FILTERS, type RunFilter, type TaskRun } from 'src/shared/fixtures'
import { EmptyState } from 'src/shared/ui'
import { RunRow, RunsTableHeader } from 'src/entities/run'

interface RunsBoardProps {
  readonly runs: ReadonlyArray<TaskRun>
}

const SegBtn = chakra('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5',
    h: '30px',
    px: '3',
    borderRadius: '7px',
    fontSize: '13px',
    fontWeight: '540',
    color: 'fg.secondary',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all 150ms',
    _hover: { color: 'fg.default' },
  },
})

const matchesQuery = (run: TaskRun, query: string): boolean => {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return run.title.toLowerCase().includes(needle) || run.repos.join(' ').toLowerCase().includes(needle)
}

export const RunsBoard = ({ runs }: RunsBoardProps) => {
  const [filter, setFilter] = useState<RunFilter['id']>('all')
  const [query, setQuery] = useState('')

  const countFor = (id: RunFilter['id']): number =>
    id === 'all' ? runs.length : runs.filter((run) => run.status === id).length

  const rows = useMemo(
    () => runs.filter((run) => (filter === 'all' || run.status === filter) && matchesQuery(run, query)),
    [runs, filter, query],
  )

  return (
    <Stack gap="4">
      <Flex direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }} gap="3">
        <Flex
          flexShrink="0"
          maxW="100%"
          overflowX="auto"
          gap="0.5"
          p="0.5"
          bg="bg.subtle"
          borderWidth="1px"
          borderColor="border.structural"
          borderRadius="9px"
          css={{ scrollbarWidth: 'none' }}
        >
          {RUN_FILTERS.map((f) => {
            const active = filter === f.id
            return (
              <SegBtn
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                bg={active ? 'bg.surface' : 'transparent'}
                color={active ? 'fg.default' : undefined}
                fontWeight={active ? '600' : undefined}
              >
                {f.label}
                <Span className="tnum" textStyle="caption" color={active ? 'fg.default' : 'fg.muted'}>
                  {countFor(f.id)}
                </Span>
              </SegBtn>
            )
          })}
        </Flex>
        <HStack
          flex="1"
          minW="0"
          h="36px"
          px="3"
          gap="2"
          bg="bg.surface"
          borderWidth="1px"
          borderColor="border.strong"
          borderRadius="control"
          color="fg.secondary"
          _focusWithin={{ borderColor: 'fg.default' }}
        >
          <Search size={15} />
          <chakra.input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Filter by title or repo…"
            flex="1"
            minW="0"
            h="100%"
            bg="transparent"
            border="none"
            outline="none"
            color="fg.default"
            fontSize="13.5px"
            _placeholder={{ color: 'fg.muted' }}
          />
        </HStack>
      </Flex>

      {rows.length === 0 ? (
        <EmptyState
          title="No runs match this view"
          description={
            filter === 'all'
              ? 'Start a run to route a task through the architect → developer → reviewer → integrator pipeline.'
              : 'No runs in this status right now. Try another filter.'
          }
        />
      ) : (
        <Box
          containerType="inline-size"
          bg="bg.surface"
          borderWidth="1px"
          borderColor="border.structural"
          borderRadius="card"
          boxShadow="popover"
          overflow="hidden"
        >
          <RunsTableHeader />
          {rows.map((run) => (
            <RunRow key={run.id} run={run} variant="table" />
          ))}
        </Box>
      )}
    </Stack>
  )
}
