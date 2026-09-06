import { HStack, Stack, Text } from '@chakra-ui/react'
import { CheckCircle2 } from 'lucide-react'
import type { InboxItem } from 'src/shared/fixtures'
import { InboxRow } from 'src/entities/inbox'

interface InboxListProps {
  readonly items: ReadonlyArray<InboxItem>
  readonly activeId?: string
}

interface GroupLabelProps {
  readonly label: string
  readonly count?: number
}

const GroupLabel = ({ label, count }: GroupLabelProps) => (
  <HStack gap="2" px="2.5" pb="1">
    <Text textStyle="caption" textTransform="uppercase" letterSpacing="0.05em" color="fg.muted">
      {label}
    </Text>
    {count === undefined ? null : (
      <Text className="tnum" textStyle="caption" color="fg.muted">
        {count}
      </Text>
    )}
  </HStack>
)

export const InboxList = ({ items, activeId }: InboxListProps) => {
  const pending = items.filter((item) => item.status === 'pending')

  return (
    <Stack gap="0.5">
      <GroupLabel label="Needs attention" count={pending.length} />
      {pending.length === 0 ? (
        <HStack gap="2" px="2.5" py="3" color="fg.muted" textStyle="small">
          <CheckCircle2 size={18} />
          <Text>Inbox zero</Text>
        </HStack>
      ) : (
        pending.map((item) => <InboxRow key={item.id} item={item} active={item.id === activeId} />)
      )}
    </Stack>
  )
}
