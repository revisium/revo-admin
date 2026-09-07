import { Box, Text } from '@chakra-ui/react'
import { ConfirmDialog, Button } from 'src/shared/ui/kit'

interface RestoreProjectDialogProps {
  readonly open: boolean
  readonly projectName: string
  readonly pending: boolean
  readonly error: string | null
  readonly onClose: () => void
  readonly onConfirm: () => void
}

export const RestoreProjectDialog = ({
  open,
  projectName,
  pending,
  error,
  onClose,
  onConfirm,
}: RestoreProjectDialogProps) => (
  <ConfirmDialog
    open={open}
    onOpenChange={(nextOpen) => {
      if (!nextOpen) onClose()
    }}
    title="Restore project"
    confirming={pending}
    dismissLockedWhileConfirming
    cancelAction={
      <Button variant="secondary" disabled={pending} onClick={onClose}>
        Cancel
      </Button>
    }
    confirmAction={
      <Button busy={pending} busyLabel="Restoring…" onClick={onConfirm}>
        {error ? 'Retry' : 'Restore project'}
      </Button>
    }
    blockers={
      error ? (
        <Box role="alert" aria-live="assertive" marginTop="4">
          <Text textStyle="body" color="fg.default">
            {error}
          </Text>
        </Box>
      ) : undefined
    }
  >
    <Text>Restore {projectName}? The project will become editable again.</Text>
  </ConfirmDialog>
)

RestoreProjectDialog.displayName = 'RestoreProjectDialog'

export type { RestoreProjectDialogProps }
