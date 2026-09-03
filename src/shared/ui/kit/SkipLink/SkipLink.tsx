import { chakra, useRecipe } from '@chakra-ui/react'
import { type ReactNode } from 'react'
import { skipLinkRecipe } from './skipLink.recipe'

interface SkipLinkProps {
  readonly href?: string
  readonly children: ReactNode
}

export const SkipLink = ({ href = '#content', children }: SkipLinkProps) => {
  const recipe = useRecipe({ recipe: skipLinkRecipe })
  const styles = recipe()

  return (
    <chakra.a href={href} css={styles}>
      {children}
    </chakra.a>
  )
}

SkipLink.displayName = 'SkipLink'

export type { SkipLinkProps }
