import { Box, HStack, Span, Stack, Text } from '@chakra-ui/react'
import { ShieldAlert } from 'lucide-react'
import type { InboxItemDetail } from 'src/shared/fixtures'

type RiskLevel = InboxItemDetail['riskSummary'][number]['level']

const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

// This does not use the kit Badge on purpose. That badge exposes exactly two neutral surfaces and
// is contractually free of domain vocabulary (tests/kit-recipes.spec.ts pins it). A risk level is
// a ranked scale that needs colour to be read at a glance, so the vocabulary and its tokens stay
// here, in the layer that owns them. Geometry is kept in step with the badge deliberately.
const RiskBadge = ({ level }: { readonly level: RiskLevel }) => (
  <Span
    display="inline-flex"
    alignItems="center"
    gap="6px"
    px="2"
    py="3px"
    borderWidth="1px"
    borderStyle="solid"
    borderRadius="pill"
    textStyle="caption"
    whiteSpace="nowrap"
    color={`risk.${level}.fg`}
    bg={`risk.${level}.bg`}
    borderColor={`risk.${level}.border`}
  >
    <Span aria-hidden="true" display="inline-flex">
      <Box boxSize="6px" borderRadius="pill" bg="currentColor" />
    </Span>
    {RISK_LABEL[level]}
  </Span>
)

export const RiskBlock = ({ risks }: { readonly risks: InboxItemDetail['riskSummary'] }) => (
  <Stack gap="3" p="3.5" borderWidth="1px" borderColor="border.structural" borderRadius="card" bg="bg.surface">
    <HStack gap="2" color="fg.secondary">
      <ShieldAlert size={14} />
      <Text textStyle="caption" textTransform="uppercase" letterSpacing="0.04em">
        Risk summary
      </Text>
    </HStack>
    <Stack gap="2.5">
      {risks.map((risk) => (
        <HStack key={risk.note} gap="2.5" align="start">
          <Box flexShrink="0" mt="0.5">
            <RiskBadge level={risk.level} />
          </Box>
          <Text textStyle="small" color="fg.secondary">
            {risk.note}
          </Text>
        </HStack>
      ))}
    </Stack>
  </Stack>
)
