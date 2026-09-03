import { Box, Flex } from '@chakra-ui/react'
import { Settings } from 'lucide-react'
import { Button, IconButton } from 'src/shared/ui/kit'
import { PreviewSectionHeading, PreviewSubsectionHeading } from './PreviewHeading'
import {
  BUTTON_CREATE_LABEL,
  BUTTON_CREATE_BUSY_LABEL,
  BUTTON_SECONDARY_LABEL,
  BUTTON_QUIET_LABEL,
  BUTTON_DISABLED_LABEL,
  ICON_BUTTON_LABEL,
} from './sampleContent'

const ICON_SIZE = 20

interface ActionsSectionProps {
  readonly creating: boolean
  readonly onToggleCreating: () => void
}

export const ActionsSection = ({ creating, onToggleCreating }: ActionsSectionProps) => {
  return (
    <Box as="section">
      <PreviewSectionHeading>Actions</PreviewSectionHeading>

      <Flex flexDirection="column" gap="8">
        <Box>
          <PreviewSubsectionHeading>Button</PreviewSubsectionHeading>
          <Flex gap="3" flexWrap="wrap">
            <Button variant="primary">{BUTTON_CREATE_LABEL}</Button>
            <Button variant="secondary">{BUTTON_SECONDARY_LABEL}</Button>
            <Button variant="quiet">{BUTTON_QUIET_LABEL}</Button>
            <Button variant="secondary" disabled>
              {BUTTON_DISABLED_LABEL}
            </Button>
            <Button variant="primary" busy={creating} busyLabel={BUTTON_CREATE_BUSY_LABEL} onClick={onToggleCreating}>
              {BUTTON_CREATE_LABEL}
            </Button>
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>Icon button</PreviewSubsectionHeading>
          <Flex gap="3">
            <IconButton label={ICON_BUTTON_LABEL}>
              <Settings size={ICON_SIZE} />
            </IconButton>
            <IconButton label={ICON_BUTTON_LABEL} disabled>
              <Settings size={ICON_SIZE} />
            </IconButton>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}

ActionsSection.displayName = 'ActionsSection'
