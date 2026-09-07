import { Box, Text } from '@chakra-ui/react'
import { ConfirmDialog, Button } from 'src/shared/ui/kit'

interface ArchiveProjectDialogProps {
  readonly open: boolean
  readonly projectName: string
  readonly pending: boolean
  readonly error: string | null
  readonly onClose: () => void
  readonly onConfirm: () => void
}

export const ArchiveProjectDialog = ({
  open,
  projectName,
  pending,
  error,
  onClose,
  onConfirm,
}: ArchiveProjectDialogProps) => (
  <ConfirmDialog
    open={open}
    onOpenChange={(nextOpen) => {
      if (!nextOpen) onClose()
    }}
    title="Archive project"
    confirming={pending}
    dismissLockedWhileConfirming
    cancelAction={
      <Button variant="secondary" disabled={pending} onClick={onClose}>
        Cancel
      </Button>
    }
    confirmAction={
      <Button busy={pending} busyLabel="Archiving…" onClick={onConfirm}>
        {error ? 'Retry' : 'Archive project'}
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
    <Text>Archive {projectName}? Project data remains available to read, and the project can be restored later.</Text>
  </ConfirmDialog>
)

ArchiveProjectDialog.displayName = 'ArchiveProjectDialog'

export type { ArchiveProjectDialogProps }
