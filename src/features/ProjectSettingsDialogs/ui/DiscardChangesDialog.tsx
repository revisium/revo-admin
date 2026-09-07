import { Text } from '@chakra-ui/react'
import { ConfirmDialog, Button } from 'src/shared/ui/kit'

interface DiscardChangesDialogProps {
  readonly open: boolean
  readonly onKeepEditing: () => void
  readonly onDiscard: () => void
}

export const DiscardChangesDialog = ({ open, onKeepEditing, onDiscard }: DiscardChangesDialogProps) => (
  <ConfirmDialog
    open={open}
    restoreFocus={false}
    onOpenChange={(nextOpen) => {
      if (!nextOpen) onKeepEditing()
    }}
    title="Discard changes?"
    cancelAction={
      <Button variant="secondary" onClick={onKeepEditing}>
        Keep editing
      </Button>
    }
    confirmAction={<Button onClick={onDiscard}>Discard changes</Button>}
  >
    <Text>Your unsaved changes will be lost.</Text>
  </ConfirmDialog>
)

DiscardChangesDialog.displayName = 'DiscardChangesDialog'

export type { DiscardChangesDialogProps }
