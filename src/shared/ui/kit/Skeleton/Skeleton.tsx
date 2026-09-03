import { Box, Flex, useRecipe, type RecipeVariantProps } from '@chakra-ui/react'
import { skeletonRecipe } from './skeleton.recipe'

type SkeletonVariantProps = RecipeVariantProps<typeof skeletonRecipe>

interface SkeletonProps {
  readonly shape?: NonNullable<SkeletonVariantProps['shape']>
  readonly width?: string
}

interface SkeletonTextProps {
  readonly lines: number
}

// Skeletons are aria-hidden because the container that owns the loading region
// supplies its own status text; the skeletons themselves must not be announced to
// screen readers. Skeletons match the final block geometry to prevent layout shift,
// and an animated shimmer is deliberately omitted.
export const Skeleton = ({ shape, width }: SkeletonProps) => {
  const recipe = useRecipe({ recipe: skeletonRecipe })
  const styles = recipe({ shape })

  return <Box css={styles} width={width} aria-hidden="true" />
}

Skeleton.displayName = 'Skeleton'

export const SkeletonText = ({ lines }: SkeletonTextProps) => {
  return (
    <Flex flexDirection="column" gap="2" aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} shape="text" width={index === lines - 1 ? '60%' : undefined} />
      ))}
    </Flex>
  )
}

SkeletonText.displayName = 'SkeletonText'

export type { SkeletonProps, SkeletonTextProps }
