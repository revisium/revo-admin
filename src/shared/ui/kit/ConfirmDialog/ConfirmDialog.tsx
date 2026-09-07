import { Box, Dialog, useSlotRecipe } from '@chakra-ui/react'
import { type ReactElement, type ReactNode, useEffect, useRef } from 'react'
import { confirmDialogRecipe } from './confirmDialog.recipe'

interface ConfirmDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly title: string
  readonly children: ReactNode
  readonly blockers?: ReactNode
  readonly cancelAction: ReactNode
  readonly confirmAction: ReactNode
  readonly confirming?: boolean
  readonly dismissLockedWhileConfirming?: boolean
  readonly restoreFocus?: boolean
  readonly trigger?: ReactElement
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  children,
  blockers,
  cancelAction,
  confirmAction,
  confirming,
  dismissLockedWhileConfirming,
  restoreFocus = true,
  trigger,
}: ConfirmDialogProps) => {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const recipe = useSlotRecipe({ recipe: confirmDialogRecipe })
  const styles = recipe()

  const dismissLocked = Boolean(dismissLockedWhileConfirming && confirming)

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => titleRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [open])

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      closeOnEscape={!dismissLocked}
      closeOnInteractOutside={!dismissLocked}
      restoreFocus={restoreFocus}
    >
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Backdrop unstyled css={styles.backdrop} />
      <Dialog.Positioner unstyled css={styles.positioner}>
        <Dialog.Content unstyled css={styles.content}>
          <Dialog.Title unstyled css={styles.title} ref={titleRef} tabIndex={-1}>
            {title}
          </Dialog.Title>
          <Dialog.Body unstyled css={styles.body}>
            {children}
          </Dialog.Body>
          {blockers ? <Box>{blockers}</Box> : null}
          <Dialog.Footer unstyled css={styles.footer} flexDirection={{ base: 'column-reverse', lg: 'row' }}>
            {cancelAction}
            {confirmAction}
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

ConfirmDialog.displayName = 'ConfirmDialog'

export type { ConfirmDialogProps }
