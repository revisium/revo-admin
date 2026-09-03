import { HStack, Stack, Text } from '@chakra-ui/react'
import { Inbox } from 'lucide-react'
import { InboxView } from 'src/widgets/InboxView'
import { PageHeader } from 'src/shared/ui/components'

interface InboxItemPageProps {
  readonly itemId: string
}

const Eyebrow = (
  <HStack gap="2" align="center">
    <Inbox size={13} />
    <Text as="span">Decisions · all projects</Text>
  </HStack>
)

export const InboxItemPage = ({ itemId }: InboxItemPageProps) => (
  <Stack gap="6">
    <PageHeader
      eyebrow={Eyebrow}
      title="Inbox"
      description="One queue for everything that needs you — approvals, questions, and alerts. Decide with one click."
    />
    <InboxView selectedId={itemId} />
  </Stack>
)
