import { Box, Center, Stack, Text } from '@chakra-ui/react'

interface EmptyStateProps {
  readonly title: string
  readonly description?: string
}

// Centered empty state (.empty): inset icon tile, title, muted body.
export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <Center borderWidth="1px" borderStyle="dashed" borderColor="border.strong" borderRadius="card" py="14" px="6">
    <Stack gap="2" align="center" textAlign="center">
      <Box
        w="13"
        h="13"
        borderRadius="dialog"
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border.structural"
        display="grid"
        placeItems="center"
        color="fg.muted"
        mb="2"
        textStyle="componentTitle"
      >
        ∅
      </Box>
      <Text textStyle="componentTitle" color="fg.default">
        {title}
      </Text>
      {description ? (
        <Text textStyle="body" color="fg.secondary" maxW="360px">
          {description}
        </Text>
      ) : null}
    </Stack>
  </Center>
)
