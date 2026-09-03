import { defineRecipe } from '@chakra-ui/react'

// Two neutral surface treatments, named for what they render rather than for any domain state:
// `default` is the white surface with ink text, `quiet` is the subtle fill with secondary text.
// Any domain vocabulary is mapped onto these tones by the entity layer that owns it, so this base
// component stays free of business meaning.
export const badgeRecipe = defineRecipe({
  className: 'monoBadge',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    px: 2,
    py: '3px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border.structural',
    borderRadius: 'pill',
    textStyle: 'caption',
    whiteSpace: 'nowrap',
  },
  variants: {
    tone: {
      default: {
        bg: 'bg.surface',
        color: 'fg.default',
      },
      quiet: {
        bg: 'bg.subtle',
        color: 'fg.secondary',
      },
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})
