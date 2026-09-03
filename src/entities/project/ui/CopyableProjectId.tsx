import { Flex, Text, VisuallyHidden } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { Button } from 'src/shared/ui/kit'

const MESSAGE_CLEAR_DELAY_MS = 2000

interface CopyableProjectIdProps {
  readonly projectId: string
  readonly copyLabel: string
  readonly copiedMessage: string
  readonly copyFailedMessage: string
}

export const CopyableProjectId = ({
  projectId,
  copyLabel,
  copiedMessage,
  copyFailedMessage,
}: CopyableProjectIdProps) => {
  const [message, setMessage] = useState<string>('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(projectId)
      setMessage(copiedMessage)
    } catch {
      setMessage(copyFailedMessage)
    }

    // Clear any existing timer and schedule a new one atomically after the await,
    // so rapid clicks don't orphan timers waiting for pending clipboard writes.
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setMessage('')
      timerRef.current = null
    }, MESSAGE_CLEAR_DELAY_MS)
  }

  // The live region is VisuallyHidden with aria-live="polite" rather than display: none,
  // because a hidden-by-display element is not announced. Focus never moves — copy success
  // is announced, not navigated to.
  // The clipboard rejection path is real, not defensive padding: insecure contexts and denied
  // permissions both reject. The <code> element stays selectable, so manual copy is the fallback
  // and needs no extra affordance.

  // overflowWrap: 'anywhere' plus minWidth: 0 is what stops a long id from forcing the page
  // wider than the viewport.
  return (
    <Flex alignItems="center" gap="2">
      <Text as="code" textStyle="mono" color="fg.secondary" overflowWrap="anywhere" minWidth="0">
        {projectId}
      </Text>
      <Button variant="quiet" onClick={handleCopy}>
        {copyLabel}
      </Button>
      <VisuallyHidden aria-live="polite">{message}</VisuallyHidden>
    </Flex>
  )
}

CopyableProjectId.displayName = 'CopyableProjectId'

export type { CopyableProjectIdProps }
