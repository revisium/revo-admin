import { Box, Button } from '@chakra-ui/react'
import { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso'
import { useViewModel } from 'src/shared/lib'
import { TimelineViewModel } from '../model/list/TimelineViewModel'
import { TimelineBlock } from './TimelineBlock'

interface DialogueTimelineClientProps {
  readonly id: string
}
const OVERSCAN = 300

export const DialogueTimelineClient = observer(({ id }: DialogueTimelineClientProps) => {
  const model = useViewModel(TimelineViewModel, id)
  const attachViewport = useCallback(
    (viewport: VirtuosoHandle | null) => {
      model.scroll.attach(
        viewport ? () => viewport.scrollToIndex({ index: 'LAST', align: 'end', behavior: 'auto' }) : undefined,
      )
    },
    [model],
  )
  return (
    <Box h="full" minH="0" position="relative" data-testid="dialogue-timeline">
      <Virtuoso
        ref={attachViewport}
        data={model.blocks}
        computeItemKey={(_index, item) => item.id}
        alignToBottom={false}
        initialScrollTop={model.scroll.initialTop}
        onScroll={(event) => model.scroll.setTop(event.currentTarget.scrollTop)}
        onWheel={(event) => model.scroll.wheel(event.deltaY)}
        onTouchMove={model.scroll.pause}
        onKeyDown={(event) => model.scroll.keyDown(event.key)}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) model.scroll.pause()
        }}
        totalListHeightChanged={model.scroll.contentResized}
        increaseViewportBy={OVERSCAN}
        followOutput={model.scroll.followOutput}
        atBottomStateChange={model.scroll.setAtBottom}
        itemContent={(_index, item) => <TimelineBlock item={item} />}
      />
      {model.scroll.showJump && (
        <Button
          position="absolute"
          bottom="2"
          right="4"
          size="xs"
          variant="outline"
          onClick={model.scroll.jumpToLatest}
        >
          Jump to latest
        </Button>
      )}
    </Box>
  )
})
