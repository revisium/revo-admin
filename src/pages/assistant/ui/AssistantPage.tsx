import { Box, Button, HStack, Spinner, Stack, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router'
import { DiscussionComposer } from 'src/features/DiscussionComposer'
import { DialogueInteractions } from 'src/features/DialogueInteractions'
import { DialogueTimeline } from 'src/widgets/DialogueTimeline'
import { useViewModel } from 'src/shared/lib'
import { routes } from 'src/shared/config'
import { AssistantPageViewModel } from '../model/AssistantPageViewModel'

interface AssistantPageProps {
  readonly chatId?: string
}

export const AssistantPage = observer(({ chatId }: AssistantPageProps) => {
  const model = useViewModel(AssistantPageViewModel, chatId)

  return (
    <Stack h="full" minH="0" maxW="880px" mx="auto" gap="3">
      <HStack justify="space-between" align="start" flexShrink="0">
        <Box minW="0">
          <Text as="h1" textStyle="heading" fontSize="xl" truncate>
            {model.title}
          </Text>
          {model.description && (
            <Text textStyle="caption" color="fg.muted">
              {model.description}
            </Text>
          )}
        </Box>
        {!model.isNew && (
          <Button asChild size="xs" variant="ghost">
            <Link to={routes.assistant()}>New chat</Link>
          </Button>
        )}
      </HStack>
      {model.showControls && (
        <HStack flexWrap="wrap" gap="2" flexShrink="0">
          {model.showConnectionStatus && (
            <Text role="status" textStyle="caption" color="fg.muted">
              {model.connectionLabel}
            </Text>
          )}
          {model.canCancel && (
            <Button size="xs" variant="outline" onClick={model.cancel}>
              Stop
            </Button>
          )}
          {model.canReopen && (
            <Button size="xs" variant="outline" onClick={model.reopen}>
              Reopen dialogue
            </Button>
          )}
        </HStack>
      )}
      {model.notice && (
        <Text role="status" textStyle="small" bg="bg.subtle" p="3">
          {model.notice}
        </Text>
      )}
      {model.error && (
        <Text role="alert" textStyle="small">
          {model.error}
        </Text>
      )}
      {model.connectionError && (
        <Text role="status" textStyle="caption">
          {model.connectionError}
        </Text>
      )}
      <Box flex="1" minH="0">
        {model.isNew ? (
          <Text color="fg.muted" mt="8">
            What would you like to do?
          </Text>
        ) : (
          model.hasDialogue && <DialogueTimeline id={model.dialogueId} />
        )}
        {model.loading && <Spinner size="sm" aria-label="Loading conversation" />}
      </Box>
      {model.hasMoreHistory && (
        <Button size="xs" variant="outline" onClick={model.loadMoreHistory} loading={model.loadingHistory}>
          Load newer history
        </Button>
      )}
      {model.hasDialogue && (
        <DialogueInteractions key={`interactions:${model.dialogueId}`} dialogueId={model.dialogueId} />
      )}
      <DiscussionComposer key={`composer:${chatId ?? 'new'}`} chatId={chatId} suggestions={model.isNew} />
    </Stack>
  )
})
