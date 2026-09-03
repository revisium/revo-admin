import { defineSlotRecipe } from '@chakra-ui/react'

export const checkboxRecipe = defineSlotRecipe({
  className: 'monoCheckbox',
  slots: ['root', 'control', 'label'],
  base: {
    root: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      minH: { base: '44px', lg: '40px' },
      cursor: 'pointer',
      '@media (pointer: coarse)': {
        minH: '44px',
      },
    },
    control: {
      boxSize: '16px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'border.control',
      borderRadius: 'control',
      bg: 'bg.surface',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: '0',
      transitionProperty: 'background-color, border-color',
      transitionDuration: 'moderate',
      _checked: {
        bg: 'bg.inverse',
        borderColor: 'bg.inverse',
        color: 'fg.inverse',
      },
      _hover: {
        borderColor: 'border.strong',
      },
      _disabled: {
        bg: 'action.disabled.bg',
        borderColor: 'action.disabled.bg',
      },
    },
    label: {
      textStyle: 'body',
      color: 'fg.default',
      userSelect: 'none',
    },
  },
})
