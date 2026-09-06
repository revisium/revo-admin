import { defineRecipe } from '@chakra-ui/react'

export const sidebarItemRecipe = defineRecipe({
  className: 'monoSidebarItem',
  base: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: '0',
    flexShrink: '0',
    gap: '3',
    px: '2',
    borderRadius: 'card',
    bg: 'transparent',
    color: 'fg.secondary',
    fontWeight: '400',
    textDecoration: 'none',
    cursor: 'pointer',
    userSelect: 'none',
    transitionProperty: 'background-color, color',
    transitionDuration: 'moderate',
    _hover: {
      bg: 'bg.subtle',
      color: 'fg.default',
      textDecoration: 'none',
    },
    '&[aria-current="page"]': {
      bg: 'bg.subtle',
      color: 'fg.default',
    },
  },
  variants: {
    lines: {
      single: {
        h: { base: '44px', lg: '36px' },
        '@media (pointer: coarse)': {
          h: '44px',
        },
      },
      double: {
        h: '52px',
      },
    },
    level: {
      root: {},
      nested: {
        ml: '2',
        width: 'calc(100% - 8px)',
      },
    },
    collapsed: {
      true: {
        justifyContent: 'center',
        px: '0',
      },
      false: {},
    },
    disabled: {
      true: {
        color: 'fg.muted',
        cursor: 'not-allowed',
        _hover: {
          bg: 'transparent',
          color: 'fg.muted',
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    lines: 'single',
    level: 'root',
    collapsed: false,
    disabled: false,
  },
})
