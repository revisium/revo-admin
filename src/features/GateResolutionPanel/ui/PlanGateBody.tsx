import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { BookText, Check, Coins } from 'lucide-react'
import type { InboxItemDetail } from 'src/shared/fixtures'
import { formatUsd } from 'src/shared/fixtures'
import { CostMeter } from 'src/shared/ui'

const AdrBlock = ({ adr }: { readonly adr: NonNullable<InboxItemDetail['adr']> }) => (
  <Stack gap="3" p="4" borderWidth="1px" borderColor="border" borderRadius="warmCard" bg="bg.1">
    <HStack gap="2">
      <HStack
        gap="1.5"
        px="2"
        h="22px"
        borderRadius="chip"
        bg="accent.gate.bg"
        color="accent.gate.fg"
        borderWidth="1px"
        borderColor="accent.gate.border"
        textStyle="semibold-micro"
      >
        <BookText size={13} />
        ADR
      </HStack>
      <Text textStyle="semibold-sm" color="fg.0">
        {adr.title}
      </Text>
    </HStack>
    <Text textStyle="regular-sm" color="fg.1">
      <Text as="span" textStyle="semibold-sm" color="fg.2">
        Decision&nbsp;
      </Text>
      {adr.decision}
    </Text>
    <Stack gap="1.5">
      {adr.bullets.map((bullet) => (
        <HStack key={bullet} gap="2" align="start" textStyle="regular-sm" color="fg.2">
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
    <Text textStyle="regular-sm" color="fg.2">
      {detail.contextSummary}
    </Text>
    {detail.adr ? <AdrBlock adr={detail.adr} /> : null}
    {detail.budget ? (
      <Stack gap="3" p="4" borderWidth="1px" borderColor="border" borderRadius="warmCard" bg="bg.1">
        <HStack gap="2" color="fg.2">
          <Coins size={14} />
          <Text textStyle="semibold-xs" textTransform="uppercase" letterSpacing="0.04em">
            Budget for this run
          </Text>
        </HStack>
        <CostMeter spent={detail.budget.spent} limit={detail.budget.limit} estimate={detail.budget.estimate} />
        <Text className="mono" textStyle="regular-micro" color="brand.ink">
          approving authorizes ~{formatUsd(detail.budget.estimate)} more · cap {formatUsd(detail.budget.limit)}
        </Text>
      </Stack>
    ) : null}
  </Stack>
)
