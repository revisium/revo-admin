import { Box, Center, Link as ChakraLink, Grid, HStack, Stack, Text } from '@chakra-ui/react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router'
import { INBOX_ITEMS, inboxItemById } from 'src/shared/fixtures'
import { InboxList } from 'src/features/InboxList'
import { GateResolutionPanel } from 'src/features/GateResolutionPanel'

const FIRST_PENDING = INBOX_ITEMS.find((item) => item.status === 'pending')

const DetailCard = ({ children }: { readonly children: React.ReactNode }) => (
  <Box
    display="flex"
    flexDirection="column"
    bg="bg.1"
    borderWidth="1px"
    borderColor="border"
    borderRadius="warmCard"
    boxShadow="sh-1"
    overflow="hidden"
    position={{ xl: 'sticky' }}
    top={{ xl: '1.5rem' }}
    maxH={{ xl: 'calc(100dvh - 7rem)' }}
  >
    {children}
  </Box>
)

const ResolvedPlaceholder = ({ runId }: { readonly runId?: string }) => (
  <Center flexDirection="column" textAlign="center" gap="3" p="10" minH="280px">
    <Center boxSize="48px" borderRadius="13px" bg="status.success.bg" color="status.success.fg">
      <CheckCircle2 size={26} />
    </Center>
    <Text textStyle="semibold-body" color="fg.0">
      Resolved
    </Text>
    {runId ? (
      <ChakraLink asChild color="brand.500" textStyle="medium-sm">
        <Link to={`/runs/${runId}`}>Open run</Link>
      </ChakraLink>
    ) : null}
  </Center>
)

export const InboxView = ({ selectedId }: { readonly selectedId?: string }) => {
  const effectiveId = selectedId ?? FIRST_PENDING?.id
  const selected = effectiveId ? INBOX_ITEMS.find((item) => item.id === effectiveId) : undefined
  const resolved = selected?.status === 'resolved'

  return (
    <Grid templateColumns={{ base: '1fr', xl: '320px minmax(0, 1fr)' }} gap="5" alignItems="start">
      <Box display={{ base: selectedId ? 'none' : 'block', xl: 'block' }}>
        <InboxList items={INBOX_ITEMS} activeId={effectiveId} />
      </Box>

      <Stack gap="3" display={{ base: selectedId ? 'flex' : 'none', xl: 'flex' }} minW="0">
        {selectedId ? (
          <ChakraLink
            asChild
            display={{ base: 'inline-flex', xl: 'none' }}
            color="fg.2"
            textStyle="medium-sm"
            _hover={{ color: 'fg.0', textDecoration: 'none' }}
          >
            <Link to="/inbox">
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
