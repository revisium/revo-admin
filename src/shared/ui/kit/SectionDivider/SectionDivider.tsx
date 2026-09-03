import { Box, useRecipe, type RecipeVariantProps } from '@chakra-ui/react'
import { sectionDividerRecipe } from './sectionDivider.recipe'

type SectionDividerProps = RecipeVariantProps<typeof sectionDividerRecipe>

export const SectionDivider = ({ spacing }: SectionDividerProps) => {
  const recipe = useRecipe({ recipe: sectionDividerRecipe })
  const styles = recipe({ spacing })

  return <Box as="hr" css={styles} />
}

SectionDivider.displayName = 'SectionDivider'

export type { SectionDividerProps }
