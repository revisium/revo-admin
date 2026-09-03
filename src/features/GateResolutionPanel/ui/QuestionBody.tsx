import { Box, Center, chakra, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import type { InboxItemDetail } from 'src/shared/fixtures'
import { RiskBlock } from './RiskBlock'

const OptionButton = chakra('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '3',
    w: '100%',
    textAlign: 'left',
    p: '3',
    borderRadius: 'btn',
    borderWidth: '1px',
    borderColor: 'border',
    bg: 'bg.1',
    cursor: 'pointer',
    transition: 'border-color 150ms, background 150ms',
    _hover: { borderColor: 'border.warmStrong' },
  },
})

export const QuestionBody = ({ detail }: { readonly detail: InboxItemDetail }) => {
  const [picked, setPicked] = useState<string | null>(null)

  return (
    <Stack gap="4">
      <Text textStyle="regular-sm" color="fg.2">
        {detail.contextSummary}
      </Text>
      <Stack gap="2">
        {detail.options.map((option) => {
          const active = picked === option.id
          return (
            <OptionButton
              key={option.id}
              type="button"
              onClick={() => setPicked(option.id)}
              borderColor={active ? 'brand.500' : undefined}
              bg={active ? 'brand.tint' : undefined}
            >
              <Center
                boxSize="18px"
                borderRadius="full"
                borderWidth="1px"
                borderColor={active ? 'brand.500' : 'border.warmStrong'}
                flexShrink="0"
              >
                {active ? <Box boxSize="9px" borderRadius="full" bg="brand.500" /> : null}
              </Center>
              <Text className="mono" textStyle="regular-sm" color="fg.0">
                {option.label}
              </Text>
            </OptionButton>
          )
        })}
      </Stack>
      <RiskBlock risks={detail.riskSummary} />
    </Stack>
  )
}
