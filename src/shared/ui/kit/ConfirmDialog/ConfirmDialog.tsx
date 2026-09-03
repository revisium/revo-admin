import { Box, Dialog, useSlotRecipe } from '@chakra-ui/react'
import { type ReactNode, useRef } from 'react'
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
}: ConfirmDialogProps) => {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const recipe = useSlotRecipe({ recipe: confirmDialogRecipe })
  const styles = recipe()

  const dismissLocked = Boolean(dismissLockedWhileConfirming && confirming)

  /* trapFocus and restoreFocus are left at their defaults on purpose —
   * Ark traps focus while open and returns it to the invoking control
   * on close. Do not hand-roll either. */
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      initialFocusEl={() => titleRef.current}
      closeOnEscape={!dismissLocked}
      closeOnInteractOutside={!dismissLocked}
    >
      <Dialog.Backdrop unstyled css={styles.backdrop} />
      <Dialog.Positioner unstyled css={styles.positioner}>
        <Dialog.Content unstyled css={styles.content}>
          {/* Initial focus goes to the title, never to the confirm button: a
           * consequential confirmation must not receive surprise initial focus.
           * That is why the title carries tabIndex={-1} and initialFocusEl
           * points at it. */}
          <Dialog.Title unstyled css={styles.title} ref={titleRef} tabIndex={-1}>
            {title}
          </Dialog.Title>
          <Dialog.Body unstyled css={styles.body}>
            {children}
          </Dialog.Body>
          {blockers ? <Box>{blockers}</Box> : null}
          <Dialog.Footer unstyled css={styles.footer} flexDirection={{ base: 'column-reverse', lg: 'row' }}>
            {/* The actions arrive as slots rather than being rendered here,
             * so this component does not dictate which button variants a caller
             * uses, and stays free of composition. */}
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
