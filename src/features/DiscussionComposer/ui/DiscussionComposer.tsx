import { Box, Button, HStack, Stack, Text, Textarea } from '@chakra-ui/react'
import { ArrowUp } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'
import { useViewModel } from 'src/shared/lib'
import { DiscussionComposerViewModel } from '../model/DiscussionComposerViewModel'

interface DiscussionComposerProps {
  readonly chatId?: string
  readonly suggestions?: boolean
}

export const DiscussionComposer = observer(({ chatId, suggestions = false }: DiscussionComposerProps) => {
  const model = useViewModel(DiscussionComposerViewModel, chatId, suggestions)
  const navigate = useNavigate()

  const submit = (): void => {
    const destination = model.submit()
    if (destination) navigate(destination)
  }

  return (
    <Stack gap="3">
      <Box
        as="form"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
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
          rows={3}
          border="0"
          resize="vertical"
        />
        <HStack justify="space-between" gap="3" mt="2">
          <Text textStyle="caption" color="fg.muted">
            {model.statusLabel}
          </Text>
          <Button type="submit" size="sm" disabled={!model.canSubmit} aria-label="Send message">
            <ArrowUp size={16} /> {model.sendLabel}
          </Button>
        </HStack>
      </Box>
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
