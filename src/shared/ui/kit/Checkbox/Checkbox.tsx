import { Checkbox as ChakraCheckbox, useSlotRecipe } from '@chakra-ui/react'
import { Check } from 'lucide-react'
import { type ComponentPropsWithoutRef, type Ref } from 'react'
import { checkboxRecipe } from './checkbox.recipe'

type CheckboxRootProps = Omit<ComponentPropsWithoutRef<typeof ChakraCheckbox.Root>, 'children' | 'size' | 'unstyled'>

interface CheckboxProps extends CheckboxRootProps {
  readonly children: string
  readonly ref?: Ref<HTMLLabelElement>
}

export const Checkbox = ({ children, ref, ...restProps }: CheckboxProps) => {
  const recipe = useSlotRecipe({ recipe: checkboxRecipe })
  const styles = recipe()

  return (
    <ChakraCheckbox.Root unstyled ref={ref} css={styles.root} {...restProps}>
      <ChakraCheckbox.HiddenInput />
      <ChakraCheckbox.Control unstyled css={styles.control}>
        <ChakraCheckbox.Indicator>
          <Check size={12} />
        </ChakraCheckbox.Indicator>
      </ChakraCheckbox.Control>
      <ChakraCheckbox.Label unstyled css={styles.label}>
        {children}
      </ChakraCheckbox.Label>
    </ChakraCheckbox.Root>
  )
}

Checkbox.displayName = 'Checkbox'

export type { CheckboxProps }
