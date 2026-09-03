import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { ShieldAlert } from 'lucide-react'
import type { InboxItemDetail } from 'src/shared/fixtures'
import { StatusBadge, type StatusTone } from 'src/shared/ui'

const RISK_TONE: Record<'low' | 'medium' | 'high', StatusTone> = {
  low: 'neutral',
  medium: 'waiting',
  high: 'failed',
}

export const RiskBlock = ({ risks }: { readonly risks: InboxItemDetail['riskSummary'] }) => (
  <Stack gap="3" p="3.5" borderWidth="1px" borderColor="border" borderRadius="warmCard" bg="bg.1">
    <HStack gap="2" color="fg.2">
      <ShieldAlert size={14} />
      <Text textStyle="semibold-xs" textTransform="uppercase" letterSpacing="0.04em">
        Risk summary
      </Text>
    </HStack>
    <Stack gap="2.5">
      {risks.map((risk) => (
        <HStack key={risk.note} gap="2.5" align="start">
          <Box flexShrink="0" mt="0.5">
            <StatusBadge status={risk.level} tone={RISK_TONE[risk.level]} size="sm" dot={false} />
          </Box>
          <Text textStyle="regular-sm" color="fg.2">
            {risk.note}
          </Text>
        </HStack>
      ))}
    </Stack>
  </Stack>
)
