import { chakra, Span, useRecipe } from '@chakra-ui/react'
import { type ButtonHTMLAttributes, type Ref, type ReactElement } from 'react'
import { iconButtonRecipe } from './iconButton.recipe'

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children' | 'type'>

interface IconButtonProps extends NativeButtonProps {
  readonly label: string
  readonly children: ReactElement
  readonly type?: 'button' | 'submit' | 'reset'
  readonly ref?: Ref<HTMLButtonElement>
}

export const IconButton = ({ label, children, type = 'button', onClick, ref, ...restProps }: IconButtonProps) => {
  const recipe = useRecipe({ recipe: iconButtonRecipe })
  const styles = recipe()

  return (
    <chakra.button ref={ref} type={type} aria-label={label} css={styles} onClick={onClick} {...restProps}>
      <Span aria-hidden="true">{children}</Span>
    </chakra.button>
  )
}

IconButton.displayName = 'IconButton'

export type { IconButtonProps }
