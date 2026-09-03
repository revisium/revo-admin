import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { BookText, Check, Coins } from 'lucide-react'
import type { InboxItemDetail } from 'src/shared/fixtures'
import { formatUsd } from 'src/shared/fixtures'
import { CostMeter } from 'src/shared/ui'

const AdrBlock = ({ adr }: { readonly adr: NonNullable<InboxItemDetail['adr']> }) => (
  <Stack gap="3" p="4" borderWidth="1px" borderColor="border.structural" borderRadius="card" bg="bg.surface">
    <HStack gap="2">
      <HStack
        gap="1.5"
        px="2"
        h="22px"
        borderRadius="control"
        bg="bg.subtle"
        color="fg.secondary"
        borderWidth="1px"
        borderColor="border.structural"
        textStyle="caption"
      >
        <BookText size={13} />
        ADR
      </HStack>
      <Text textStyle="bodyStrong" color="fg.default">
        {adr.title}
      </Text>
    </HStack>
    <Text textStyle="small" color="fg.secondary">
      <Text as="span" textStyle="bodyStrong" color="fg.secondary">
        Decision&nbsp;
      </Text>
      {adr.decision}
    </Text>
    <Stack gap="1.5">
      {adr.bullets.map((bullet) => (
        <HStack key={bullet} gap="2" align="start" textStyle="small" color="fg.secondary">
          <Box color="status.success.fg" flexShrink="0" mt="0.5">
            <Check size={13} />
          </Box>
          <Text>{bullet}</Text>
        </HStack>
      ))}
    </Stack>
  </Stack>
)

export const PlanGateBody = ({ detail }: { readonly detail: InboxItemDetail }) => (
  <Stack gap="4">
    <Text textStyle="small" color="fg.secondary">
      {detail.contextSummary}
    </Text>
    {detail.adr ? <AdrBlock adr={detail.adr} /> : null}
    {detail.budget ? (
      <Stack gap="3" p="4" borderWidth="1px" borderColor="border.structural" borderRadius="card" bg="bg.surface">
        <HStack gap="2" color="fg.secondary">
          <Coins size={14} />
          <Text textStyle="caption" textTransform="uppercase" letterSpacing="0.04em">
            Budget for this run
          </Text>
        </HStack>
        <CostMeter spent={detail.budget.spent} limit={detail.budget.limit} estimate={detail.budget.estimate} />
        <Text className="mono" textStyle="caption" color="fg.default">
          approving authorizes ~{formatUsd(detail.budget.estimate)} more · cap {formatUsd(detail.budget.limit)}
        </Text>
      </Stack>
    ) : null}
  </Stack>
)
