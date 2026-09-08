import { Box, NativeSelect, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import type { AgentConfigurationFieldViewModel } from '../model/agent/AgentConfigurationFieldViewModel'

interface AgentConfigurationFieldProps {
  readonly model: AgentConfigurationFieldViewModel
}

export const AgentConfigurationField = observer(({ model }: AgentConfigurationFieldProps) => (
  <Box minW="140px" maxW="280px" flex="1">
    <Text textStyle="caption" color="fg.muted">
      {model.label}
    </Text>
    <NativeSelect.Root size="sm" disabled={model.disabled}>
      <NativeSelect.Field
        aria-label={model.label}
        value={model.value}
        onChange={(event) => model.select(event.target.value)}
      >
        {model.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  </Box>
))
