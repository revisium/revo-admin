import { defineRecipe } from '@chakra-ui/react'

export const inlineLinkRecipe = defineRecipe({
  className: 'monoInlineLink',
  base: {
    color: 'fg.default',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    _hover: {
      textDecorationThickness: '2px',
    },
  },
})
