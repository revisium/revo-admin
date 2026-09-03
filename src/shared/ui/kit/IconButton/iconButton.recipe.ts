import { defineRecipe } from '@chakra-ui/react'

export const iconButtonRecipe = defineRecipe({
  className: 'monoIconButton',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSize: { base: '44px', lg: '40px' },
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    bg: 'transparent',
    borderRadius: 'control',
    color: 'fg.default',
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color',
    transitionDuration: 'moderate',
    _hover: {
      bg: 'action.secondary.hoverBg',
    },
    _disabled: {
      color: 'action.disabled.fg',
      cursor: 'not-allowed',
    },
    '@media (pointer: coarse)': {
      boxSize: '44px',
    },
  },
})
