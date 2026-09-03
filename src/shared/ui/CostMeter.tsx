import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { system } from './theme/theme'

// Hatch stripes for the estimate bar, resolved from brand tokens (not raw hex)
// so the meter stays token-driven, matching graphTokens.ts.
const hatchBorder = system.token('colors.border.structural')
const hatchFill = system.token('colors.bg.subtle')
const estimateHatch = `repeating-linear-gradient(45deg, ${hatchBorder}, ${hatchBorder} 4px, ${hatchFill} 4px, ${hatchFill} 8px)`

interface CostMeterProps {
  readonly spent: number
  readonly limit: number
  readonly estimate?: number
}

const PERCENT = 100
const COST_DECIMALS = 2

// Token/cost budget meter (.meter): a filled brand bar for spend, a hatched
// subtle hatched bar for the estimate, and a labelled summary row beneath.
export const CostMeter = ({ spent, limit, estimate = 0 }: CostMeterProps) => {
  const spentPct = Math.min(PERCENT, (spent / limit) * PERCENT)
  const estPct = estimate ? Math.min(PERCENT - spentPct, (estimate / limit) * PERCENT) : 0

  return (
    <Stack gap="2">
      <HStack
        gap="0"
        h="2"
        borderRadius="pill"
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border.structural"
        overflow="hidden"
      >
        <Box h="full" w={`${spentPct}%`} bg="action.primary.bg" />
        {estPct > 0 ? <Box h="full" w={`${estPct}%`} backgroundImage={estimateHatch} /> : null}
      </HStack>
      <HStack gap="4" textStyle="caption" color="fg.secondary" wrap="wrap">
        <Text className="mono">
          <Text as="span" color="fg.default" fontWeight="650">
            ${spent.toFixed(COST_DECIMALS)}
          </Text>{' '}
          spent
        </Text>
        {estimate ? (
          <Text className="mono" color="fg.default">
            +${estimate.toFixed(COST_DECIMALS)} est.
          </Text>
        ) : null}
        <Text className="mono" ml="auto">
          ${limit.toFixed(COST_DECIMALS)} budget
        </Text>
      </HStack>
    </Stack>
  )
}
