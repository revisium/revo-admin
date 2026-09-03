import { defineRecipe } from '@chakra-ui/react'

export const sectionDividerRecipe = defineRecipe({
  className: 'monoSectionDivider',
  base: {
    borderWidth: '0',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'border.structural',
  },
  variants: {
    spacing: {
      default: {
        marginBlock: '12',
      },
      compact: {
        marginBlock: '6',
      },
    },
  },
  defaultVariants: {
    spacing: 'default',
  },
})
