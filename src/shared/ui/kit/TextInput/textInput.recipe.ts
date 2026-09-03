import { defineRecipe } from '@chakra-ui/react'

export const textInputRecipe = defineRecipe({
  className: 'monoInput',
  base: {
    width: '100%',
    height: { base: '44px', lg: '40px' },
    px: 3,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border.control',
    borderRadius: 'control',
    bg: 'bg.surface',
    color: 'fg.default',
    textStyle: 'body',
    transitionProperty: 'border-color',
    transitionDuration: 'moderate',
    _hover: {
      borderColor: 'border.strong',
    },
    _placeholder: {
      color: 'fg.muted',
    },
    _invalid: {
      borderColor: 'border.strong',
    },
    _disabled: {
      bg: 'action.disabled.bg',
      color: 'action.disabled.fg',
      cursor: 'not-allowed',
    },
    _readOnly: {
      bg: 'bg.subtle',
      borderColor: 'border.structural',
    },
    '@media (pointer: coarse)': {
      height: '44px',
    },
  },
})
