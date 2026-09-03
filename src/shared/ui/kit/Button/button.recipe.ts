import { defineRecipe } from '@chakra-ui/react'

export const buttonRecipe = defineRecipe({
  className: 'monoButton',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minH: { base: '44px', lg: '40px' },
    minW: { base: '44px', lg: 'auto' },
    px: '14px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: 'control',
    textStyle: 'bodyStrong',
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transitionProperty: 'background-color, border-color, color',
    transitionDuration: 'moderate',
    _disabled: {
      bg: 'action.disabled.bg',
      borderColor: 'action.disabled.bg',
      color: 'action.disabled.fg',
      cursor: 'not-allowed',
    },
    '@media (pointer: coarse)': {
      minH: '44px',
      minW: '44px',
    },
  },
  variants: {
    variant: {
      primary: {
        bg: 'action.primary.bg',
        borderColor: 'action.primary.bg',
        color: 'action.primary.fg',
        _hover: {
          bg: 'action.primary.hoverBg',
          borderColor: 'action.primary.hoverBg',
        },
      },
      secondary: {
        bg: 'action.secondary.bg',
        borderColor: 'border.control',
        color: 'fg.default',
        _hover: {
          bg: 'action.secondary.hoverBg',
          borderColor: 'border.strong',
        },
      },
      quiet: {
        bg: 'transparent',
        borderColor: 'transparent',
        color: 'fg.default',
        _hover: {
          bg: 'action.secondary.hoverBg',
          borderColor: 'transparent',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'secondary',
  },
})
