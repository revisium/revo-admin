import { Box, Center, Link as ChakraLink, Grid, HStack, Stack, Text } from '@chakra-ui/react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router'
import { INBOX_ITEMS, inboxItemById } from 'src/shared/fixtures'
import { InboxList } from 'src/features/InboxList'
import { GateResolutionPanel } from 'src/features/GateResolutionPanel'
import { routes } from 'src/shared/config'

const FIRST_PENDING = INBOX_ITEMS.find((item) => item.status === 'pending')

interface DetailCardProps {
  readonly children: React.ReactNode
}

interface ResolvedPlaceholderProps {
  readonly runId?: string
}

interface InboxViewProps {
  readonly selectedId?: string
}

const DetailCard = ({ children }: DetailCardProps) => (
  <Box
    display="flex"
    flexDirection="column"
    bg="bg.surface"
    borderWidth="1px"
    borderColor="border.structural"
    borderRadius="card"
    boxShadow="popover"
    overflow="hidden"
    position={{ xl: 'sticky' }}
    top={{ xl: '1.5rem' }}
  >
    {children}
  </Box>
)

const ResolvedPlaceholder = ({ runId }: ResolvedPlaceholderProps) => (
  <Center flexDirection="column" textAlign="center" gap="3" p="10" minH="280px">
    <Center boxSize="48px" borderRadius="13px" bg="bg.subtle" color="status.success.fg">
      <CheckCircle2 size={26} />
    </Center>
    <Text textStyle="bodyStrong" color="fg.default">
      Resolved
    </Text>
    {runId ? (
      <ChakraLink asChild color="fg.default" textStyle="body">
        <Link to={routes.run(runId)}>Open run</Link>
      </ChakraLink>
    ) : null}
  </Center>
)

export const InboxView = ({ selectedId }: InboxViewProps) => {
  const effectiveId = selectedId ?? FIRST_PENDING?.id
  const selected = effectiveId ? INBOX_ITEMS.find((item) => item.id === effectiveId) : undefined
  const resolved = selected?.status === 'resolved'

  return (
    <Grid templateColumns="1fr" gap="5" alignItems="start">
      <Box display={{ base: selectedId ? 'none' : 'block', lg: 'none' }}>
        <InboxList items={INBOX_ITEMS} activeId={effectiveId} />
      </Box>

      <Stack gap="3" display={{ base: selectedId ? 'flex' : 'none', lg: 'flex' }} minW="0">
        {selectedId ? (
          <ChakraLink
            asChild
            display={{ base: 'inline-flex', lg: 'none' }}
            color="fg.secondary"
            textStyle="body"
            _hover={{ color: 'fg.default', textDecoration: 'none' }}
          >
            <Link to={routes.inbox()}>
              <HStack gap="1.5">
                <ArrowLeft size={15} />
                <Text>Back to inbox</Text>
              </HStack>
            </Link>
          </ChakraLink>
        ) : null}

        <DetailCard>
          {!selected || resolved ? (
            <ResolvedPlaceholder runId={selected?.runId} />
          ) : (
            <GateResolutionPanel item={inboxItemById(selected.id)} />
          )}
        </DetailCard>
      </Stack>
    </Grid>
  )
}
