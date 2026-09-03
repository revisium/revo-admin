import { defineSlotRecipe } from '@chakra-ui/react'

export const confirmDialogRecipe = defineSlotRecipe({
  className: 'monoDialog',
  slots: ['backdrop', 'positioner', 'content', 'title', 'body', 'footer'],
  base: {
    backdrop: {
      position: 'fixed',
      inset: '0',
      bg: 'overlay.scrim',
    },
    positioner: {
      position: 'fixed',
      inset: '0',
      display: 'grid',
      placeItems: 'center',
      p: 4,
    },
    content: {
      width: 'min(576px, 100%)',
      p: 6,
      bg: 'bg.surface',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'border.structural',
      borderRadius: 'dialog',
      boxShadow: 'dialog',
    },
    title: {
      textStyle: 'sectionTitle',
      color: 'fg.default',
    },
    body: {
      textStyle: 'body',
      color: 'fg.secondary',
      mt: 3,
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 3,
      mt: 5,
    },
  },
})
