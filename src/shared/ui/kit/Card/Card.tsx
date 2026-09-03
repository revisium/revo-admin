import { Box, useRecipe, type RecipeVariantProps } from '@chakra-ui/react'
import { type ElementType, type ReactNode } from 'react'
import { cardRecipe } from './card.recipe'

type CardVariantProps = RecipeVariantProps<typeof cardRecipe>

interface CardProps extends CardVariantProps {
  readonly as?: ElementType
  readonly children: ReactNode
}

// `interactive` only adds a hover treatment and does not make the card a link or a button — a
// card that is a navigation target is an anchor owned by the component composing it. Hover
// changes fill and border, never geometry, so no transform, no boxShadow, no lift or scale may
// be added.
export const Card = ({ as: asProp, padding, interactive, children }: CardProps) => {
  const recipe = useRecipe({ recipe: cardRecipe })
  const styles = recipe({ padding, interactive })

  return (
    <Box as={asProp} css={styles}>
      {children}
    </Box>
  )
}

Card.displayName = 'Card'

export type { CardProps }
