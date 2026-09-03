import { defineRecipe } from '@chakra-ui/react'

// skeletons match final block geometry to prevent layout shift; infinite shimmer is not required in this version.
export const skeletonRecipe = defineRecipe({
  className: 'monoSkeleton',
  base: {
    bg: 'border.structural',
    borderRadius: 'control',
  },
  variants: {
    shape: {
      text: {
        height: '14px',
      },
      title: {
        height: '24px',
      },
      block: {
        height: '92px',
      },
    },
  },
  defaultVariants: {
    shape: 'text',
  },
})
