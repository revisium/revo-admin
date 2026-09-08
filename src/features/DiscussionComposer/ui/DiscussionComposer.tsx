import { Box, Button, HStack, Stack, Text, Textarea } from '@chakra-ui/react'
import { ArrowUp } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'
import { useViewModel } from 'src/shared/lib'
import { DiscussionComposerViewModel } from '../model/DiscussionComposerViewModel'
import { AgentSelection } from './AgentSelection'

interface DiscussionComposerProps {
  readonly chatId?: string
  readonly suggestions?: boolean
}

export const DiscussionComposer = observer(({ chatId, suggestions = false }: DiscussionComposerProps) => {
  const navigate = useNavigate()
  const model = useViewModel(DiscussionComposerViewModel, chatId, suggestions, navigate)

  return (
    <Stack gap="3" flexShrink="0">
      {model.showConfiguration && <AgentSelection model={model.agent} />}
      <Box
        as="form"
        onSubmit={(event) => {
          event.preventDefault()
          model.submit()
        }}
        p="3"
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.strong"
        borderRadius="card"
      >
        <Textarea
          aria-label="Message"
          placeholder={model.placeholder}
          value={model.draft}
          onChange={(event) => model.setDraft(event.target.value)}
          disabled={model.inputDisabled}
          rows={2}
          maxH="160px"
          border="0"
          resize="vertical"
        />
        <HStack justify="space-between" gap="3" mt="2">
          <Text textStyle="caption" color="fg.muted">
            {model.statusLabel}
          </Text>
          <Button type="submit" size="sm" disabled={!model.canSubmit} loading={model.sending} aria-label="Send message">
            <ArrowUp size={16} /> {model.sendLabel}
          </Button>
        </HStack>
      </Box>
      {model.error && (
        <Text role="alert" textStyle="small">
          {model.error}
        </Text>
      )}
      {model.suggestions.length > 0 && (
        <HStack gap="2" flexWrap="wrap">
          {model.suggestions.map((suggestion) => (
            <Button key={suggestion} size="sm" variant="outline" onClick={() => model.selectSuggestion(suggestion)}>
              {suggestion}
            </Button>
          ))}
        </HStack>
      )}
    </Stack>
  )
})
