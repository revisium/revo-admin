import { HStack, Span } from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'
import type React from 'react'

interface IStatItemProps {
  readonly icon: LucideIcon
  readonly value: number | string
  readonly label: string
}

// A compact count in a metadata row: the icon is decorative, so the meaning lives in `label`,
// which stays in the accessibility tree while the visual row shows only the number.
export const StatItem: React.FC<IStatItemProps> = ({ icon: Icon, value, label }: IStatItemProps) => (
  <HStack as="span" gap="1" color="fg.secondary" textStyle="caption">
    <Icon size={12} />
    <Span className="tnum">{value}</Span>
    <Span srOnly>{label}</Span>
  </HStack>
)

StatItem.displayName = 'StatItem'

export type { IStatItemProps }
