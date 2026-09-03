import { chakra, useRecipe } from '@chakra-ui/react'
import { type Ref, type TextareaHTMLAttributes } from 'react'
import { textareaRecipe } from './textarea.recipe'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly invalid?: boolean
  readonly ref?: Ref<HTMLTextAreaElement>
}

export const Textarea = ({ invalid, ref, ...restProps }: TextareaProps) => {
  const recipe = useRecipe({ recipe: textareaRecipe })
  const styles = recipe()

  return (
    <chakra.textarea
      ref={ref}
      css={styles}
      aria-invalid={invalid ? 'true' : undefined}
      data-invalid={invalid ? '' : undefined}
      {...restProps}
    />
  )
}

Textarea.displayName = 'Textarea'

export type { TextareaProps }
