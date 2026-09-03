import { chakra, useRecipe } from '@chakra-ui/react'
import { type AnchorHTMLAttributes, type ElementType, type ReactNode } from 'react'
import { inlineLinkRecipe } from './inlineLink.recipe'

interface InlineLinkBaseProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> {
  readonly as?: ElementType
  readonly href?: string
  readonly to?: string
  readonly children: ReactNode
}

export const InlineLink = ({ as: asProp, children, ...restProps }: InlineLinkBaseProps) => {
  const recipe = useRecipe({ recipe: inlineLinkRecipe })
  const styles = recipe()

  return (
    <chakra.a as={asProp} css={styles} {...restProps}>
      {children}
    </chakra.a>
  )
}

InlineLink.displayName = 'InlineLink'

export type { InlineLinkBaseProps as InlineLinkProps }
