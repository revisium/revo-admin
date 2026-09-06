import { defineRecipe } from '@chakra-ui/react'

export const sidebarActionRecipe = defineRecipe({
  className: 'monoSidebarAction',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    h: { base: '44px', lg: '28px' },
    minW: { base: '44px', lg: '28px' },
    px: '1.5',
    borderRadius: 'control',
    bg: 'transparent',
    color: 'fg.muted',
    textStyle: 'caption',
    textDecoration: 'none',
    cursor: 'pointer',
    transitionProperty: 'background-color, color',
    transitionDuration: 'moderate',
    _hover: {
      bg: 'bg.subtle',
      color: 'fg.default',
      textDecoration: 'none',
    },
    '@media (pointer: coarse)': {
      h: '44px',
      minW: '44px',
    },
  },
  variants: {
    iconOnly: {
      true: {
        px: '0',
      },
      false: {},
    },
  },
  defaultVariants: {
    iconOnly: false,
  },
})
