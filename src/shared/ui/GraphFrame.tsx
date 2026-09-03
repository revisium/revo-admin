import { useCallback, useEffect, useRef } from 'react'
import { Box, Center, Spinner } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface GraphFrameProps {
  readonly height: number
  readonly children: ReactNode
  readonly contentWidth?: string
  readonly framed?: boolean
}

const FULL_PERCENT = 100

// Bordered, SSR-safe surface for a client-only xyflow canvas. The server emits
// this box with the spinner placeholder; the real graph mounts into it after
// hydration. Warm surface + dotgrid background to match the prototype DAG frame.
export const GraphFrame = ({ height, children, contentWidth, framed = true }: GraphFrameProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const thumbRef = useRef<HTMLDivElement | null>(null)

  const syncThumb = useCallback(() => {
    const scrollEl = scrollRef.current
    const thumbEl = thumbRef.current

    if (!scrollEl || !thumbEl) return

    const { clientWidth, scrollLeft, scrollWidth } = scrollEl

    if (scrollWidth <= clientWidth) {
      thumbEl.style.width = '100%'
      thumbEl.style.transform = 'translateX(0px)'
      return
    }

    const width = (clientWidth / scrollWidth) * FULL_PERCENT
    const maxOffset = clientWidth - (clientWidth * width) / FULL_PERCENT
    const offset = (scrollLeft / (scrollWidth - clientWidth)) * maxOffset

    thumbEl.style.width = `${width}%`
    thumbEl.style.transform = `translateX(${offset}px)`
  }, [])

  useEffect(() => {
    if (!contentWidth) return undefined

    syncThumb()

    const scrollEl = scrollRef.current
    if (!scrollEl) return undefined

    const resizeObserver = new ResizeObserver(syncThumb)
    resizeObserver.observe(scrollEl)

    return () => resizeObserver.disconnect()
  }, [contentWidth, syncThumb])

  return (
    <Box
      className="dotgrid"
      position="relative"
      h={`${height}px`}
      w="full"
      borderWidth={framed ? '1px' : '0'}
      borderColor="border.structural"
      borderRadius={framed ? 'card' : '0'}
      bg="bg.surface"
      overflow="hidden"
      p={contentWidth ? '4px' : '0'}
    >
      <Box
        ref={scrollRef}
        h="full"
        w="full"
        overflowX={contentWidth ? 'auto' : 'hidden'}
        overflowY="hidden"
        onScroll={contentWidth ? syncThumb : undefined}
        css={
          contentWidth
            ? {
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }
            : undefined
        }
      >
        <Box h="full" w={contentWidth ?? 'full'} minW={contentWidth ?? undefined}>
          {children}
        </Box>
      </Box>
      {contentWidth ? (
        <Box
          position="absolute"
          left="4px"
          right="4px"
          bottom="4px"
          h="8px"
          bg="transparent"
          pointerEvents="none"
          zIndex="2"
        >
          <Box ref={thumbRef} h="full" w="72%" borderRadius="pill" bg="border.strong" />
        </Box>
      ) : null}
    </Box>
  )
}

export const GraphPlaceholder = () => (
  <Center h="full" w="full">
    <Spinner color="action.primary.bg" />
  </Center>
)
