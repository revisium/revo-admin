import { Box } from '@chakra-ui/react'
import { Archive } from 'lucide-react'
import { Badge } from 'src/shared/ui/kit'

const ARCHIVED_ICON_SIZE_PX = 12

interface ProjectStatusBadgeProps {
  readonly status: 'active' | 'archived'
  readonly label: string
}

// Status meaning is carried by text, never by colour; any additional status needs a governing UX
// document first.
export const ProjectStatusBadge = ({ status, label }: ProjectStatusBadgeProps) => {
  const icon =
    status === 'active' ? (
      <Box boxSize="6px" borderRadius="pill" bg="currentColor" />
    ) : (
      <Archive size={ARCHIVED_ICON_SIZE_PX} />
    )

  return (
    <Badge tone={status === 'archived' ? 'quiet' : 'default'} icon={icon}>
      {label}
    </Badge>
  )
}

ProjectStatusBadge.displayName = 'ProjectStatusBadge'

export type { ProjectStatusBadgeProps }
