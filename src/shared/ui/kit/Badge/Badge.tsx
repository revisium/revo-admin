import { Span, useRecipe, type RecipeVariantProps } from '@chakra-ui/react'
import { type ReactNode } from 'react'
import { badgeRecipe } from './badge.recipe'

type BadgeVariantProps = RecipeVariantProps<typeof badgeRecipe>

interface BadgeProps extends BadgeVariantProps {
  readonly icon?: ReactNode
  readonly children: ReactNode
}

// The text is required and always present because meaning is carried by text — never by the icon
// and never by colour, which is why the icon is aria-hidden and children is required. No colour
// props are exposed: the recipe supplies both neutral surfaces.
//
// `tone` names a surface treatment, not a state. Whatever domain vocabulary a caller has is mapped
// onto it by the entity that owns that vocabulary, so this component carries no business meaning.
export const Badge = ({ tone, icon, children }: BadgeProps) => {
  const recipe = useRecipe({ recipe: badgeRecipe })
  const styles = recipe({ tone })

  return (
    <Span css={styles}>
      {icon ? <Span aria-hidden="true">{icon}</Span> : null}
      {children}
    </Span>
  )
}

Badge.displayName = 'Badge'

export type { BadgeProps }
