import { defineRecipe } from '@chakra-ui/react'

export const skipLinkRecipe = defineRecipe({
  className: 'monoSkipLink',
  base: {
    position: 'fixed',
    left: '3',
    top: '3',
    zIndex: '1000',
    px: '3',
    py: '2',
    bg: 'bg.inverse',
    color: 'fg.inverse',
    borderRadius: 'control',
    textStyle: 'bodyStrong',
    textDecoration: 'none',
    // transform is used to park the skip link off-screen, not as motion UI.
    transform: 'translateY(-160%)',
    _focusVisible: { transform: 'translateY(0)' },
    _focus: { transform: 'translateY(0)' },
  },
})
