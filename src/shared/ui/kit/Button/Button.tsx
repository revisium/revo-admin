import { Box, chakra, mergeRefs, useRecipe, type RecipeVariantProps } from '@chakra-ui/react'
import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useRef,
  useState,
} from 'react'
import { buttonRecipe } from './button.recipe'

type ButtonVariantProps = RecipeVariantProps<typeof buttonRecipe>

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-busy' | 'aria-disabled' | 'children' | 'type'
>

interface ButtonProps extends NativeButtonProps {
  readonly variant?: NonNullable<ButtonVariantProps['variant']>
  readonly busy?: boolean
  readonly busyLabel?: string
  readonly children: ReactNode
  readonly type?: 'button' | 'submit' | 'reset'
  readonly ref?: Ref<HTMLButtonElement>
}

export const Button = ({
  busy,
  busyLabel,
  onClick,
  variant,
  type = 'button',
  children,
  ref,
  ...restProps
}: ButtonProps) => {
  const recipe = useRecipe({ recipe: buttonRecipe })
  const styles = recipe({ variant })
  const isBusy = Boolean(busy)
  const internalRef = useRef<HTMLButtonElement | null>(null)
  const [restingWidth, setRestingWidth] = useState<number | undefined>(undefined)

  // useEffect keeps width measurement out of the initial render and works for
  // both the static build and browser hydration.
  // This only captures a width while idle, so a button that mounts already busy never gets one
  // and the minWidth guard below does nothing for it — correctly, since it had no prior idle
  // width to preserve.
  useEffect(() => {
    setRestingWidth((current) => (isBusy ? current : (internalRef.current?.offsetWidth ?? current)))
  }, [isBusy, children])

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isBusy) {
      event.preventDefault()
      return
    }

    onClick?.(event)
  }

  return (
    <chakra.button
      ref={mergeRefs(internalRef, ref)}
      type={type}
      css={styles}
      onClick={handleClick}
      aria-busy={isBusy || undefined}
      aria-disabled={isBusy ? 'true' : undefined}
      data-busy={isBusy ? 'true' : undefined}
      // minWidth pins the floor to the resting width; a busyLabel longer than the idle label still widens the button.
      // Callers are expected to keep busyLabel no longer than the idle label.
      style={isBusy && restingWidth !== undefined ? { minWidth: `${restingWidth}px` } : undefined}
      {...restProps}
    >
      <span>{isBusy && busyLabel ? busyLabel : children}</span>
      {isBusy ? (
        <Box
          as="span"
          aria-hidden
          css={{
            animation: 'monoButtonSpin 800ms linear infinite',
            '@keyframes monoButtonSpin': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' },
            },
            '@media (prefers-reduced-motion: reduce)': {
              borderTopColor: 'currentColor',
            },
          }}
          boxSize="14px"
          borderWidth="2px"
          borderStyle="solid"
          borderColor="currentColor"
          borderTopColor="transparent"
          borderRadius="pill"
          display="inline-block"
        />
      ) : null}
    </chakra.button>
  )
}

Button.displayName = 'Button'

export type { ButtonProps }
