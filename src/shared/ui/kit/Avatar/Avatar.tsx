import { Center, useRecipe, type RecipeVariantProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { avatarRecipe } from './avatar.recipe'

type AvatarVariantProps = RecipeVariantProps<typeof avatarRecipe>

interface IAvatarProps extends AvatarVariantProps {
  readonly children: ReactNode
}

// Children carry the content: precomputed initials (the app code stays free of slice-length
// literals) or an icon for the non-human variants.
export const Avatar = ({ size, shape, tone, children }: IAvatarProps) => {
  const recipe = useRecipe({ recipe: avatarRecipe })

  return <Center css={recipe({ size, shape, tone })}>{children}</Center>
}

Avatar.displayName = 'Avatar'

export type { IAvatarProps }
