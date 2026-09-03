import { Button, HStack, Stack, Text } from '@chakra-ui/react'
import { Filter, List, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { TASK_RUNS } from 'src/shared/fixtures'
import { RunsBoard } from 'src/widgets/RunsBoard'
import { routes } from 'src/shared/config'
import { PageHeader } from 'src/shared/ui/components'

const Eyebrow = (
  <HStack gap="2" align="center">
    <List size={13} />
    <Text as="span">Task runs · all projects</Text>
  </HStack>
)

const Actions = (
  <HStack gap="2" wrap="wrap" justify="flex-end">
    <Button
      size="sm"
      h="36px"
      px="3.5"
      gap="2"
      bg="transparent"
      color="fg.secondary"
      borderWidth="1px"
      borderColor="border.strong"
      borderRadius="control"
      _hover={{ bg: 'blackAlpha.50', color: 'fg.default' }}
    >
      <Filter size={15} />
      Filters
    </Button>
    <Button
      asChild
      size="sm"
      h="36px"
      px="3.5"
      gap="2"
      bg="fg.default"
      color="action.primary.fg"
      _hover={{ bg: 'action.primary.hoverBg' }}
    >
      <Link to={routes.runCreate()}>
        <Plus size={15} />
        New run
      </Link>
    </Button>
  </HStack>
)

export const RunsBoardPage = () => (
  <Stack gap="6">
    <PageHeader
      eyebrow={Eyebrow}
      title="Runs"
      description="Every task run under deterministic control. Status is the anchor."
      actions={Actions}
    />
    <RunsBoard runs={TASK_RUNS} />
  </Stack>
)
