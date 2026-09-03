import { Badge } from '@chakra-ui/react'

type ModelLevel = 'cheap' | 'standard' | 'deep'

interface ModelChipProps {
  readonly level: ModelLevel
}

// Model-level pill (.model-chip): lowercase, pill radius. cheap = neutral,
// standard = running-blue, deep = gate-warm — mapped onto status/accent tokens.
const LEVEL_TOKEN: Record<ModelLevel, { fg: string; bg: string; border: string }> = {
  cheap: { fg: 'fg.secondary', bg: 'bg.subtle', border: 'border.structural' },
  standard: { fg: 'fg.secondary', bg: 'bg.subtle', border: 'border.structural' },
  deep: { fg: 'fg.secondary', bg: 'bg.subtle', border: 'border.structural' },
}

export const ModelChip = ({ level }: ModelChipProps) => {
  const token = LEVEL_TOKEN[level]
  return (
    <Badge
      textStyle="caption"
      textTransform="lowercase"
      letterSpacing="0.01em"
      px="2"
      py="0.5"
      borderRadius="pill"
      borderWidth="1px"
      color={token.fg}
      bg={token.bg}
      borderColor={token.border}
    >
      {level}
    </Badge>
  )
}
