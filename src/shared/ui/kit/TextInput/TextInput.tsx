import { chakra, useRecipe } from '@chakra-ui/react'
import { type HTMLInputTypeAttribute, type InputHTMLAttributes, type Ref } from 'react'
import { textInputRecipe } from './textInput.recipe'

// The native `size` attribute sets a character-count width, which the recipe overrides with
// `width: '100%'`; keeping it omitted avoids exposing a prop that would silently have no effect.
type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>

interface TextInputProps extends NativeInputProps {
  readonly invalid?: boolean
  readonly type?: HTMLInputTypeAttribute
  readonly ref?: Ref<HTMLInputElement>
}

export const TextInput = ({ invalid, type = 'text', ref, ...restProps }: TextInputProps) => {
  const recipe = useRecipe({ recipe: textInputRecipe })
  const styles = recipe()

  return (
    <chakra.input
      ref={ref}
      type={type}
      css={styles}
      aria-invalid={invalid ? 'true' : undefined}
      data-invalid={invalid ? '' : undefined}
      {...restProps}
    />
  )
}

TextInput.displayName = 'TextInput'

export type { TextInputProps }
