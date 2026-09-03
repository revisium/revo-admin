import { Box, Flex, Text } from '@chakra-ui/react'
import { PreviewSectionHeading, PreviewSubsectionHeading } from './PreviewHeading'

const SWATCH_SIZE = '60px'
const TYPE_SCALE_ROWS: ReadonlyArray<{
  readonly name: string
  readonly style: 'pageTitle' | 'sectionTitle' | 'componentTitle' | 'bodyStrong' | 'body' | 'small' | 'caption' | 'mono'
  readonly size: string
}> = [
  { name: 'pageTitle', style: 'pageTitle', size: '28/36' },
  { name: 'sectionTitle', style: 'sectionTitle', size: '20/28' },
  { name: 'componentTitle', style: 'componentTitle', size: '16/24' },
  { name: 'bodyStrong', style: 'bodyStrong', size: '14/20' },
  { name: 'body', style: 'body', size: '14/20' },
  { name: 'small', style: 'small', size: '13/18' },
  { name: 'caption', style: 'caption', size: '12/16' },
  { name: 'mono', style: 'mono', size: '12/18' },
]

const COLOUR_TOKENS: ReadonlyArray<string> = [
  'bg.canvas',
  'bg.surface',
  'bg.subtle',
  'bg.inverse',
  'fg.default',
  'fg.secondary',
  'border.structural',
  'border.control',
]

export const FoundationsSection = () => {
  return (
    <Box as="section">
      <PreviewSectionHeading>Foundations</PreviewSectionHeading>

      <Flex flexDirection="column" gap="10">
        <Box>
          <PreviewSubsectionHeading>Colour tokens</PreviewSubsectionHeading>
          <Flex flexWrap="wrap" gap="5">
            {COLOUR_TOKENS.map((token) => (
              <Flex key={token} flexDirection="column" align="center" gap="2">
                <Box
                  width={SWATCH_SIZE}
                  height={SWATCH_SIZE}
                  borderWidth="1px"
                  borderColor="border.control"
                  bg={token}
                />
                <Text textStyle="caption" color="fg.secondary">
                  {token}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>Type scale</PreviewSubsectionHeading>
          <Flex flexDirection="column" gap="3">
            {TYPE_SCALE_ROWS.map((item) => (
              <Text key={item.style} textStyle={item.style} color="fg.default">
                {item.name} · {item.size}
              </Text>
            ))}
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>Spacing &amp; shape</PreviewSubsectionHeading>
          <Flex flexDirection="column" gap="3">
            <Text textStyle="body" color="fg.default">
              Control height · 40px (compact) / 44px (standard)
            </Text>
            <Text textStyle="body" color="fg.default">
              Border radius (control) · 6px
            </Text>
            <Text textStyle="body" color="fg.default">
              Border radius (card) · 8px
            </Text>
            <Text textStyle="body" color="fg.default">
              Border radius (dialog) · 12px
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}

FoundationsSection.displayName = 'FoundationsSection'
