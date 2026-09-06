import { Box, useRecipe } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { sidebarActionRecipe } from './sidebarAction.recipe'

interface SidebarActionProps {
  readonly children: ReactNode
  readonly iconOnly?: boolean
  readonly label: string
  readonly onClick?: () => void
  readonly to?: string
}

export const SidebarAction = ({ children, iconOnly = false, label, onClick, to }: SidebarActionProps) => {
  const recipe = useRecipe({ recipe: sidebarActionRecipe })
  const styles = recipe({ iconOnly })
  const accessibilityProps = iconOnly ? { 'aria-label': label, title: label } : { title: label }

  if (to) {
    return (
      <Box asChild css={styles}>
        <Link to={to} onClick={onClick} {...accessibilityProps}>
          {children}
        </Link>
      </Box>
    )
  }

  return (
    <Box asChild css={styles}>
      <button type="button" onClick={onClick} {...accessibilityProps}>
        {children}
      </button>
    </Box>
  )
}

SidebarAction.displayName = 'SidebarAction'

export type { SidebarActionProps }
