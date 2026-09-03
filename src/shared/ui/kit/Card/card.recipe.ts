import { defineRecipe } from '@chakra-ui/react'

export const cardRecipe = defineRecipe({
  className: 'monoCard',
  base: {
    bg: 'bg.surface',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border.structural',
    borderRadius: 'card',
    p: 6,
    transitionProperty: 'background-color, border-color',
    transitionDuration: 'moderate',
  },
  variants: {
    padding: {
      default: {
        p: 6,
      },
      compact: {
        p: 4,
      },
      summary: {
        p: 5,
      },
    },
    interactive: {
      true: {
        _hover: {
          bg: 'bg.subtle',
          borderColor: 'border.strong',
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    padding: 'default',
    interactive: false,
  },
})
