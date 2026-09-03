import { defineRecipe } from '@chakra-ui/react'

export const navLinkRecipe = defineRecipe({
  className: 'monoNavLink',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    minH: { base: '44px', lg: 'auto' },
    pt: '13px',
    pb: '11px',
    color: 'fg.secondary',
    textStyle: 'bodyStrong',
    textDecoration: 'none',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    whiteSpace: 'nowrap',
    flexShrink: '0',
    transitionProperty: 'color, border-color',
    transitionDuration: 'moderate',
    _hover: {
      color: 'fg.default',
      borderBottomColor: 'border.strong',
    },
    "&[aria-current='page']": {
      color: 'fg.default',
      borderBottomColor: 'fg.default',
    },
    '@media (pointer: coarse)': {
      minH: '44px',
    },
  },
})
