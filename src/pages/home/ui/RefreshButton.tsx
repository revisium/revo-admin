import { Button } from '@chakra-ui/react'
import { RefreshCw } from 'lucide-react'

interface RefreshButtonProps {
  readonly loading: boolean
  readonly onRefresh: () => void
}

export const RefreshButton = ({ loading, onRefresh }: RefreshButtonProps) => (
  <Button
    size="sm"
    h="36px"
    px="3.5"
    gap="2"
    bg="transparent"
    color="fg.secondary"
    borderRadius="control"
    disabled={loading}
    onClick={onRefresh}
    _hover={{ bg: 'action.secondary.hoverBg', color: 'fg.default' }}
  >
    <RefreshCw size={15} />
    Refresh
  </Button>
)
