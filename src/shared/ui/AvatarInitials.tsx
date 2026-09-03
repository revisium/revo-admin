import { Center } from '@chakra-ui/react'

// Small initials avatar (.avatar). `label` is precomputed by the caller (so the
// app code stays free of slice-length literals); `system` renders the muted
// system variant.
export const AvatarInitials = ({ label, system = false }: { readonly label: string; readonly system?: boolean }) => (
  <Center
    boxSize="22px"
    borderRadius="full"
    flexShrink="0"
    textStyle="caption"
    textTransform="lowercase"
    color={system ? 'fg.secondary' : 'action.primary.fg'}
    bg={system ? 'bg.subtle' : undefined}
    bgGradient={system ? undefined : 'to-br'}
    gradientFrom={system ? undefined : 'fg.default'}
    gradientTo={system ? undefined : 'action.primary.hoverBg'}
    borderWidth={system ? '1px' : '0'}
    borderColor={system ? 'border' : undefined}
  >
    {label}
  </Center>
)
