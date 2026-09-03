import { Heading, Stack, Text } from '@chakra-ui/react'
import { RunProgressGraph } from 'src/features/RunProgressGraph'

export const RunGraphSmokePage = () => (
  <Stack gap="4">
    <Stack gap="1">
      <Heading textStyle="sectionTitle" color="fg.default">
        Run progress graph
      </Heading>
      <Text textStyle="small" color="fg.secondary">
        Client-only xyflow smoke probe. Seed of the real /runs/:runId DAG.
      </Text>
    </Stack>
    <RunProgressGraph />
  </Stack>
)
