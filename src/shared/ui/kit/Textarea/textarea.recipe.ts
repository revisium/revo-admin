import { defineRecipe } from '@chakra-ui/react'

export const textareaRecipe = defineRecipe({
  className: 'monoTextarea',
  base: {
    width: '100%',
    // No responsive value or coarse-pointer override here, unlike the other control recipes:
    // 92px already clears the 44px touch target by a wide margin, so there is nothing to bump.
    minH: '92px',
    py: '9px',
    px: 3,
    resize: 'vertical',
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
  },
})
