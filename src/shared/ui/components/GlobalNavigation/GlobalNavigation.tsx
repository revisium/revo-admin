import { Box, chakra, type SystemStyleObject } from '@chakra-ui/react'

interface GlobalNavigationProps {
  readonly items: ReadonlyArray<{ readonly label: string; readonly href: string; readonly current?: boolean }>
  readonly label?: string
}

// Styled inline with semantic tokens and deliberately has no recipe.
// The kit already has NavLink with navLinkRecipe — secondary text with a 2px ink underline on the
// active item. That is a different treatment from this one.
// A global link is a different treatment entirely: a filled rounded row.
// It has exactly one consumer, so a second registered recipe would be unearned indirection.
const linkStyles: SystemStyleObject = {
  display: 'flex',
  alignItems: 'center',
  minH: { base: '44px', lg: '40px' },
  py: '10px',
  px: 3,
  borderRadius: 'control',
  textStyle: 'bodyStrong',
  textDecoration: 'none',
  color: 'fg.secondary',
  transitionProperty: 'background-color, color',
  transitionDuration: 'moderate',
  _hover: { bg: 'action.secondary.hoverBg', color: 'fg.default' },
  // The active item gets a filled quiet surface, NOT the underline treatment.
  '&[aria-current="page"]': { bg: 'bg.subtle', color: 'fg.default' },
  // 44px minimum on compact and under a coarse pointer is unconditional.
  // A viewport-only rule would miss a touch device at a wide viewport,
  // such as a tablet in landscape.
  '@media (pointer: coarse)': { minH: '44px' },
}

export const GlobalNavigation = ({ items, label = 'Global' }: GlobalNavigationProps) => {
  return (
    <Box as="nav" aria-label={label} display="flex" gap="1" flexDirection={{ base: 'row', lg: 'column' }}>
      {items.map((item) => (
        <chakra.a key={item.href} href={item.href} aria-current={item.current ? 'page' : undefined} css={linkStyles}>
          {item.label}
        </chakra.a>
      ))}
    </Box>
  )
}

GlobalNavigation.displayName = 'GlobalNavigation'

export type { GlobalNavigationProps }
