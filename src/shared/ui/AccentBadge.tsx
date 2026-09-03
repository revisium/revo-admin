import { Badge } from '@chakra-ui/react'

type AccentKind = 'gate' | 'role'

interface AccentBadgeProps {
  readonly kind: AccentKind
  readonly children: string
}

// Non-status taxonomy chip (.tag--gate / .tag--role). The two kinds differ by fill weight
// rather than by hue: a gate sits on the subtle fill, a role on the plain surface.
export const AccentBadge = ({ kind, children }: AccentBadgeProps) => (
  <Badge
    textStyle="body"
    textTransform="capitalize"
    px="2"
    py="0.5"
    borderRadius="control"
    borderWidth="1px"
    whiteSpace="nowrap"
    color="fg.secondary"
    bg={kind === 'gate' ? 'bg.subtle' : 'bg.surface'}
    borderColor="border.structural"
  >
    {children}
  </Badge>
)
