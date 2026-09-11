import { Box, HStack, NativeSelect, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import type { AgentSelectionViewModel } from '../model/agent/AgentSelectionViewModel'
import { AgentConfigurationField } from './AgentConfigurationField'

interface AgentSelectionProps {
  readonly model: AgentSelectionViewModel
}

export const AgentSelection = observer(({ model }: AgentSelectionProps) => (
  <Box>
    <HStack gap="3" flexWrap="wrap" align="start">
      <Box minW="180px" flex="1">
        <Text textStyle="caption" color="fg.muted">
          Agent
        </Text>
        <NativeSelect.Root size="sm" disabled={model.disabled}>
          <NativeSelect.Field
            aria-label="Agent"
            value={model.value}
            onChange={(event) => model.select(event.target.value)}
          >
            {model.agents.map((agent) => (
              <option key={agent.key} value={agent.key}>
                {agent.displayName}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>
      {model.fields.map((field) => (
        <AgentConfigurationField key={field.id} model={field} />
      ))}
    </HStack>
    {model.loading && <Text textStyle="caption">Loading agent configuration…</Text>}
    {model.empty && <Text textStyle="caption">No agents are currently available.</Text>}
    {model.error && <Text role="alert">{model.error}</Text>}
  </Box>
))
