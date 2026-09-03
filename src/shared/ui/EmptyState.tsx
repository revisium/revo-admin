import { Box, Center, Stack, Text } from '@chakra-ui/react'

interface EmptyStateProps {
  readonly title: string
  readonly description?: string
}

// Centered empty state (.empty): inset icon tile, title, muted body.
export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <Center borderWidth="1px" borderStyle="dashed" borderColor="border.warmStrong" borderRadius="warmCard" py="14" px="6">
    <Stack gap="2" align="center" textAlign="center">
      <Box
        w="13"
        h="13"
        borderRadius="modal"
        bg="bg.inset"
        borderWidth="1px"
        borderColor="border"
        display="grid"
        placeItems="center"
        color="fg.3"
        mb="2"
        textStyle="semibold-md"
      >
        ∅
      </Box>
      <Text textStyle="semibold-md" color="fg.0">
        {title}
      </Text>
      {description ? (
        <Text textStyle="regular-body" color="fg.2" maxW="360px">
          {description}
        </Text>
      ) : null}
    </Stack>
  </Center>
)
