import { Box, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MessageActions } from './MessageActions'
import type { MessageViewModel } from '../model/item/MessageViewModel'

interface DialogueMessageProps {
  readonly item: MessageViewModel
}
const MARKDOWN_PLUGINS = [remarkGfm]

export const DialogueMessage = observer(({ item }: DialogueMessageProps) => (
  <Box
    data-item-id={item.id}
    data-item-source={item.source}
    data-item-kind={item.kind}
    data-item-status={item.status}
    py="3"
    px="2"
  >
    <Box
      ml={item.fromUser ? 'auto' : '0'}
      w={item.fromUser ? 'fit-content' : 'full'}
      maxW={item.fromUser ? '80%' : 'full'}
    >
      <Box
        px={item.fromUser ? '4' : '2'}
        py={item.fromUser ? '3' : '2'}
        borderRadius="card"
        borderWidth={item.fromUser ? '1px' : '0'}
        borderColor="border.structural"
        bg={item.fromUser ? 'bg.subtle' : 'transparent'}
      >
        {item.showText && (
          <Box
            textStyle="body"
            overflowWrap="anywhere"
            css={{
              '& p': { marginBlock: '0.6em' },
              '& pre': { overflowX: 'auto', padding: '3', background: 'bg.subtle', borderRadius: 'card' },
              '& ul, & ol': { paddingInlineStart: '5' },
              '& a': { textDecoration: 'underline' },
              '& table': { display: 'block', overflowX: 'auto' },
              '& th, & td': { padding: '2', borderWidth: '1px', borderColor: 'border.structural' },
            }}
          >
            {item.fromUser ? (
              <Text whiteSpace="pre-wrap">{item.text}</Text>
            ) : (
              <Markdown remarkPlugins={MARKDOWN_PLUGINS}>{item.text}</Markdown>
            )}
          </Box>
        )}
        {item.notice && (
          <Text role="status" textStyle="small" color="fg.muted" mt="2">
            {item.notice}
          </Text>
        )}
      </Box>
      <MessageActions model={item.actions} />
    </Box>
  </Box>
))
