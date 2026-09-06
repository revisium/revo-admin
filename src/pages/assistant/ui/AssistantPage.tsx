import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router'
import { DiscussionComposer } from 'src/features/DiscussionComposer'
import { useViewModel } from 'src/shared/lib'
import { PageHeader } from 'src/shared/ui/components'
import { AssistantPageViewModel } from '../model/AssistantPageViewModel'

interface AssistantPageProps {
  readonly chatId?: string
}

export const AssistantPage = observer(({ chatId }: AssistantPageProps) => {
  const model = useViewModel(AssistantPageViewModel, chatId)

  if (model.unavailable)
    return (
      <Stack gap="4">
        <Text>{model.unavailableMessage}</Text>
        <Button asChild>
          <Link to={model.newChatPath}>{model.unavailableActionLabel}</Link>
        </Button>
      </Stack>
    )

  return (
    <Stack gap="6" maxW="800px" mx="auto">
      <PageHeader
        title={model.title}
        description={model.description}
        actions={
          model.showNewChatAction ? (
            <Button asChild variant="outline" size="sm">
              <Link to={model.newChatPath}>{model.newChatLabel}</Link>
            </Button>
          ) : undefined
        }
      />
      {model.messages.length > 0 && (
        <Stack gap="5">
          {model.messages.map((message) => (
            <Box
              key={message.id}
              p="5"
              borderRadius="card"
              bg={message.fromUser ? 'bg.subtle' : 'bg.surface'}
              borderWidth="1px"
              borderColor="border.structural"
            >
              <Text textStyle="caption" color="fg.muted" mb="2">
                {message.authorLabel}
              </Text>
              <Text textStyle="body" whiteSpace="pre-wrap">
                {message.content}
              </Text>
            </Box>
          ))}
        </Stack>
      )}
      <DiscussionComposer chatId={chatId} suggestions={model.showSuggestions} />
      {model.showSuggestions && (
        <Stack gap="2">
          <Text textStyle="bodyStrong">{model.recentChatsLabel}</Text>
          {model.chats.map((item) => (
            <Button
              key={item.id}
              asChild
              variant="ghost"
              justifyContent="flex-start"
              whiteSpace="normal"
              h="auto"
              py="3"
            >
              <Link to={item.to}>{item.title}</Link>
            </Button>
          ))}
        </Stack>
      )}
      <HStack>
        <Text textStyle="caption" color="fg.muted">
          {model.retentionNotice}
        </Text>
      </HStack>
    </Stack>
  )
})
