import { chakra, useRecipe } from '@chakra-ui/react'
import { type AnchorHTMLAttributes, type ElementType, type ReactNode } from 'react'
import { navLinkRecipe } from './navLink.recipe'

interface NavLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> {
  readonly as?: ElementType
  readonly to?: string
  readonly children: ReactNode
}

export const NavLink = ({ as: asProp, children, ...restProps }: NavLinkProps) => {
  const recipe = useRecipe({ recipe: navLinkRecipe })
  const styles = recipe()

  return (
    <chakra.a as={asProp} css={styles} {...restProps}>
      {children}
    </chakra.a>
  )
}

NavLink.displayName = 'NavLink'

export type { NavLinkProps }
